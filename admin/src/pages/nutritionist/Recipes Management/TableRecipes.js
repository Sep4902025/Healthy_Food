import React, { useEffect, useState, useCallback } from "react";
import { memo } from "react";
import recipesService from "../../../services/nutritionist/recipesServices";
import ingredientService from "../../../services/nutritionist/ingredientsServices";
import dishService from "../../../services/nutritionist/dishesServices";
import {
  Clock,
  Users,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  EditIcon,
  Utensils,
  TrashIcon,
} from "lucide-react";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";
import { toast } from "react-toastify";

const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];

const INGREDIENT_TYPE_OPTIONS = [
  "Meat & Seafood",
  "Vegetables & Roots",
  "Spices & Herbs",
  "Grains & Beans",
  "Eggs & Dairy",
  "Dried & Processed Ingredients",
  "Others",
];

// Hàm debounce để trì hoãn tìm kiếm
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Component SearchInput tái sử dụng
const SearchInput = memo(({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search by dish name"
      className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
      value={value}
      onChange={onChange}
    />
  );
});

const TableRecipes = () => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [totalDishPages, setTotalDishPages] = useState(1);
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [newRecipeData, setNewRecipeData] = useState({
    ingredients: [],
    instruction: [],
    cookingTime: "",
    totalServing: "",
  });
  const [nutritionData, setNutritionData] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingInstruction, setIsEditingInstruction] = useState(null);
  const [newInstructionStep, setNewInstructionStep] = useState({ step: "", description: "" });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dishesResponse, ingredientsResponse] = await Promise.all([
        dishService.getAllDishes(currentPage, itemsPerPage, searchTerm),
        ingredientService.getAllIngredients(1, 1000),
      ]);
  
      if (dishesResponse?.success) {
        let dishesData = dishesResponse.data.items || [];
        // If recipeId is a string, fetch the full recipe data
        for (let dish of dishesData) {
          if (dish.recipeId && typeof dish.recipeId === "string") {
            const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
            if (recipeResponse.success) {
              dish.recipeId = recipeResponse.data; // Assign full recipe object
            } else {
              dish.recipeId = null; // Set to null if fetch fails to avoid errors
            }
          }
        }
        setDishes(dishesData);
        setTotalItems(dishesResponse.data.total || 0);
        setTotalDishPages(dishesResponse.data.totalPages || 1);
      } else {
        setDishes([]);
        toast.error("Failed to load dish list: " + dishesResponse.message);
      }
  
      if (ingredientsResponse?.success) {
        setAvailableIngredients(ingredientsResponse.data.items || []);
      } else {
        setAvailableIngredients([]);
        toast.error("Failed to load ingredient list: " + ingredientsResponse.message);
      }
    } catch (error) {
      setDishes([]);
      setAvailableIngredients([]);
      toast.error("An error occurred while loading data: " + error.message);
    }
    setIsLoading(false);
  };
  

  useEffect(() => {
    if (filterType === "all") {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter((dish) => dish.type === filterType);
      setFilteredDishes(filtered);
    }
  }, [dishes, filterType]);

  useEffect(() => {
    const calculateTotalNutrition = () => {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;

      newRecipeData.ingredients.forEach((ing) => {
        const ingredientData = availableIngredients.find((item) => item._id === ing._id);
        if (ingredientData && ing.quantity && ing.unit) {
          let conversionFactor;
          if (ing.unit === "g" || ing.unit === "ml") {
            conversionFactor = ing.quantity / 100;
          } else if (ing.unit === "tbsp") {
            conversionFactor = (ing.quantity * 15) / 100;
          } else if (ing.unit === "tsp" || ing.unit === "tp") {
            conversionFactor = (ing.quantity * 5) / 100;
          } else {
            conversionFactor = ing.quantity / 100;
          }
          totalCalories += (ingredientData.calories || 0) * conversionFactor;
          totalProtein += (ingredientData.protein || 0) * conversionFactor;
          totalFat += (ingredientData.fat || 0) * conversionFactor;
          totalCarbs += (ingredientData.carbs || 0) * conversionFactor;
        }
      });

      setNutritionData({
        calories: totalCalories.toFixed(2),
        protein: totalProtein.toFixed(2),
        fat: totalFat.toFixed(2),
        carbs: totalCarbs.toFixed(2),
      });
    };

    calculateTotalNutrition();
  }, [newRecipeData.ingredients, availableIngredients]);

  const handleAddRecipeClick = async (dish) => {
    setSelectedDish(dish);
    setErrors({});
    setNewInstructionStep({ step: "", description: "" });
    setIsEditingInstruction(null);
  
    try {
      let recipeData = null;
  
      // Kiểm tra xem dish.recipeId là object hay chuỗi
      if (dish.recipeId && typeof dish.recipeId === "object") {
        // Nếu dish.recipeId đã là object đầy đủ, sử dụng trực tiếp
        recipeData = dish.recipeId;
      } else if (dish.recipeId && typeof dish.recipeId === "string") {
        // Nếu dish.recipeId là chuỗi ID, gọi API để lấy dữ liệu công thức
        const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
        if (recipeResponse.success) {
          recipeData = recipeResponse.data;
        } else {
          toast.error("Could not load existing recipe: " + recipeResponse.message);
        }
      }
  
      if (recipeData) {
        const existingIngredients = recipeData.ingredients?.map((ing) => ({
          _id: ing.ingredientId._id || ing.ingredientId, // Xử lý trường hợp ingredientId là object hoặc ID
          name: ing.ingredientId.name || "Unknown",
          quantity: ing.quantity || "",
          unit: ing.unit || "",
        })) || [];
  
        setNewRecipeData({
          ingredients: existingIngredients,
          instruction: recipeData.instruction || [],
          cookingTime: recipeData.cookingTime || "",
          totalServing: recipeData.totalServing || "",
        });
      } else {
        // Nếu không có recipeId hoặc không lấy được dữ liệu, reset về mặc định
        setNewRecipeData({
          ingredients: [],
          instruction: [],
          cookingTime: "",
          totalServing: "",
        });
      }
    } catch (error) {
      setNewRecipeData({
        ingredients: [],
        instruction: [],
        cookingTime: "",
        totalServing: "",
      });
      toast.error("Error loading recipe: " + (error.message || "Unknown error"));
    }
    setIsAddRecipeModalOpen(true);
  };

  const handleAddInstruction = () => {
    const step = newInstructionStep.step;
    const description = newInstructionStep.description.trim();

    if (!step && !description) {
      setErrors({ ...errors, instruction: "Please enter both step number and description!" });
      return;
    }
    if (!step) {
      setErrors({ ...errors, instruction: "Please enter a step number!" });
      return;
    }
    if (!description) {
      setErrors({ ...errors, instruction: "Please enter a description!" });
      return;
    }

    const stepExists = newRecipeData.instruction.some(
      (inst) => inst.step === parseInt(step)
    );
    if (stepExists) {
      setErrors({ ...errors, instruction: "Step number already exists!" });
      return;
    }

    setNewRecipeData({
      ...newRecipeData,
      instruction: [
        ...newRecipeData.instruction,
        { step: parseInt(step), description },
      ].sort((a, b) => a.step - b.step),
    });
    setNewInstructionStep({ step: "", description: "" });
    setErrors({ ...errors, instruction: "" });
  };

  const handleSaveInstruction = (index) => {
    const step = newInstructionStep.step;
    const descripción = newInstructionStep.description.trim();

    if (!step && !descripción) {
      setErrors({ ...errors, instruction: "Please enter both step number and description!" });
      return;
    }
    if (!step) {
      setErrors({ ...errors, instruction: "Please enter a step number!" });
      return;
    }
    if (!descripción) {
      setErrors({ ...errors, instruction: "Please enter a description!" });
      return;
    }

    const stepExists = newRecipeData.instruction.some(
      (inst, i) => inst.step === parseInt(step) && i !== index
    );
    if (stepExists) {
      setErrors({ ...errors, instruction: "Step number already exists!" });
      return;
    }

    const updatedInstructions = [...newRecipeData.instruction];
    updatedInstructions[index] = { step: parseInt(step), description: descripción };
    setNewRecipeData({
      ...newRecipeData,
      instruction: updatedInstructions.sort((a, b) => a.step - b.step),
    });
    setIsEditingInstruction(null);
    setNewInstructionStep({ step: "", description: "" });
    setErrors({ ...errors, instruction: "" });
  };

  const handleDeleteInstruction = (index) => {
    const updatedInstructions = newRecipeData.instruction.filter((_, i) => i !== index);
    setNewRecipeData({
      ...newRecipeData,
      instruction: updatedInstructions,
    });
    setErrors({
      ...errors,
      instruction: updatedInstructions.length === 0 ? "Please add at least one Instruction step!" : "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newRecipeData.cookingTime || newRecipeData.cookingTime <= 0) {
      newErrors.cookingTime = "Cooking Time must be greater than 0!";
    }
    if (!newRecipeData.totalServing || newRecipeData.totalServing <= 0) {
      newErrors.totalServing = "Serving Size must be greater than 0!";
    }
    if (newRecipeData.ingredients.length === 0) {
      newErrors.ingredients = "Please add at least one Ingredient!";
    } else {
      const invalidIngredient = newRecipeData.ingredients.find(
        (ing) => !ing.quantity || ing.quantity <= 0 || !ing.unit
      );
      if (invalidIngredient) {
        newErrors.ingredients = "Please enter Quantity and Unit for all ingredients!";
      }
    }
    if (newRecipeData.instruction.length === 0) {
      newErrors.instruction = "Please add at least one Instruction step!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRecipe = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    const formattedIngredients = newRecipeData.ingredients.map((ing) => ({
      ingredientId: ing._id,
      quantity: ing.quantity || 0,
      unit: ing.unit || "g",
    }));

    const updatedRecipe = {
      ingredients: formattedIngredients,
      instruction: newRecipeData.instruction,
      cookingTime: newRecipeData.cookingTime,
      totalServing: newRecipeData.totalServing,
    };

    try {
      let response;
      const dishId = selectedDish._id;
      const recipeId = selectedDish.recipeId?._id || selectedDish.recipeId;

      if (recipeId) {
        response = await recipesService.updateRecipe(dishId, recipeId, updatedRecipe);
      } else {
        response = await recipesService.createRecipe(dishId, updatedRecipe);
      }

      setIsSaving(false);
      if (response.success) {
        toast.success(`Recipe for "${selectedDish.name}" has been saved!`);
        fetchData();
        setIsAddRecipeModalOpen(false);
        setNewRecipeData({
          ingredients: [],
          instruction: [],
          cookingTime: "",
          totalServing: "",
        });
        setSelectedDish(null);
        setErrors({});
      } else {
        toast.error("Failed to save: " + response.message);
      }
    } catch (error) {
      setIsSaving(false);
      toast.error("An error occurred while saving: " + (error.message || "Unknown error"));
    }
  };

  const handleOpenIngredientModal = () => {
    setIsIngredientModalOpen(true);
  };

  const handleSelectIngredients = (selected) => {
    const newIngredients = [...newRecipeData.ingredients];
    const duplicates = [];

    selected.forEach((newIng) => {
      const alreadyExists = newIngredients.some((ing) => ing._id === newIng._id);
      if (alreadyExists) {
        duplicates.push(newIng.name);
      } else {
        newIngredients.push(newIng);
      }
    });

    setNewRecipeData({
      ...newRecipeData,
      ingredients: newIngredients,
    });

    if (duplicates.length > 0) {
      toast.error(
        `The following ingredients are already in the recipe: ${duplicates.join(", ")}. Please edit the existing entries instead.`
      );
    } else {
      setErrors({ ...errors, ingredients: "" });
    }

    setIsIngredientModalOpen(false);
  };

  const handleDeleteRecipe = async (dish) => {
    if (!dish.recipeId) {
      toast.error("This dish has no recipe to delete!");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the recipe for "${dish.name}"?`
    );
    if (!confirmDelete) return;

    try {
      const response = await recipesService.deleteRecipe(dish._id, dish.recipeId);
      if (response.success) {
        toast.success(`The recipe for "${dish.name}" has been deleted!`);
        fetchData();
        if (dishes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error("Failed to delete recipe: " + response.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting: " + (error.message || "Unspecified error"));
    }
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalDishPages) {
      setCurrentPage(selectedPage);
    }
  };

  // Reset newRecipeData when the modal is closed
  useEffect(() => {
    if (!isAddRecipeModalOpen) {
      setNewRecipeData({
        ingredients: [],
        instruction: [],
        cookingTime: "",
        totalServing: "",
      });
      setSelectedDish(null);
      setNewInstructionStep({ step: "", description: "" });
      setIsEditingInstruction(null);
      setErrors({});
    }
  }, [isAddRecipeModalOpen]);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">List of Dishes</h2>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setFilterType("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md font-semibold ${filterType === "all"
              ? "bg-[#40B491] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition duration-200`}
          >
            All
          </button>
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${filterType === type
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition duration-200`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <SearchInput value={inputValue} onChange={handleInputChange} />
        </div>
      </div>

      <Loading isLoading={isLoading}>
        <div className="min-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDishes?.length > 0 ? (
              filteredDishes.map((dish) => (
                <div
                  key={dish._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg"
                >
                  <img
                    src={dish.imageUrl || "https://via.placeholder.com/300"}
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                      {dish.name}
                    </h3>
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="flex justify-between">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs">
                              Time: {dish.recipeId?.cookingTime || "N/A"} m
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs">
                              Protein: {dish.totalServing && dish.protein
                                ? (dish.protein / dish.totalServing).toFixed(2)
                                : "N/A"}
                              g
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Droplet className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs">
                              Fat: {dish.totalServing && dish.fat
                                ? (dish.fat / dish.totalServing).toFixed(2)
                                : "N/A"}
                              g
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs">
                              Serving size: {dish.totalServing || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Flame className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs">
                              Calories: {dish.totalServing && dish.calories
                                ? (dish.calories / dish.totalServing).toFixed(2)
                                : "N/A"}
                              kcal
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Wheat className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs">
                              Carbs: {dish.totalServing && dish.carbs
                                ? (dish.carbs / dish.totalServing).toFixed(2)
                                : "N/A"}
                              g
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 border-t border-gray-200 h-16 flex items-center justify-center">
                    <div className="flex w-full justify-center items-center gap-2">
                      <button
                        onClick={() => handleAddRecipeClick(dish)}
                        className="flex-1 text-[#40B491] flex items-center justify-center px-2 py-1 hover:text-[#359c7a] transition whitespace-nowrap"
                      >
                        <EditIcon className="w-4 h-4 mr-1" />
                        Edit Recipe
                      </button>
                      {dish.recipeId && (
                        <>
                          <div className="h-4 border-l border-gray-300 mx-1"></div>
                          <button
                            onClick={() => handleDeleteRecipe(dish)}
                            className="flex-1 text-red-500 flex items-center justify-center px-2 py-1 hover:text-red-600 transition whitespace-nowrap"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete Recipe
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
                <Utensils className="w-24 h-24 text-gray-400 mb-4" />
                <p className="text-lg font-semibold">No dishes</p>
                <p className="text-sm">Looks like you haven't added any dishes yet.</p>
              </div>
            )}
          </div>
        </div>
      </Loading>

      {totalItems > 0 && !isLoading && (
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            currentPage={currentPage - 1}
            text={"Dishes"}
          />
        </div>
      )}

      {isAddRecipeModalOpen && selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {isSaving && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50">
              <div className="loader"></div>
              <p className="mt-4 text-white text-lg">Saving...</p>
            </div>
          )}
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">
                {selectedDish.recipeId ? "Edit Recipe" : "Add Recipe"}: {selectedDish.name}
              </h2>
              <div className="ml-auto flex space-x-3">
                <button
                  onClick={handleSaveRecipe}
                  disabled={isSaving}
                  className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setNewRecipeData({
                      ingredients: [],
                      instruction: [],
                      cookingTime: "",
                      totalServing: "",
                    });
                    setSelectedDish(null);
                    setNewInstructionStep({ step: "", description: "" });
                    setIsEditingInstruction(null);
                    setErrors({});
                    setIsAddRecipeModalOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <img
                    src={selectedDish.imageUrl || "https://via.placeholder.com/200"}
                    alt={selectedDish.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                    placeholder="Enter recipe title"
                    value={selectedDish.name || ""}
                    readOnly
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cooking Time (minutes) *
                    </label>
                    <input
                      type="number"
                      className={`w-full border ${errors.cookingTime ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      value={newRecipeData.cookingTime}
                      onInput={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, "");
                        value = value === "" ? "" : parseInt(value, 10);
                        if (value > 1440) {
                          value = 1440;
                          e.target.value = value;
                        }
                        setNewRecipeData({ ...newRecipeData, cookingTime: value });
                        setErrors({ ...errors, cookingTime: "" });
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter cooking time"
                      min="1"
                      max="1440"
                    />
                    {errors.cookingTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.cookingTime}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serving Size *
                    </label>
                    <input
                      type="number"
                      className={`w-full border ${errors.totalServing ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      value={newRecipeData.totalServing}
                      onInput={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, "");
                        value = value === "" ? "" : parseInt(value, 10);
                        if (value > 50) {
                          value = 50;
                          e.target.value = value;
                        }
                        setNewRecipeData({ ...newRecipeData, totalServing: value });
                        setErrors({ ...errors, totalServing: "" });
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter serving size"
                      min="1"
                    />
                    {errors.totalServing && (
                      <p className="text-red-500 text-sm mt-1">{errors.totalServing}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Directions</h3>
                  </div>
                  {newRecipeData.instruction.length > 0 ? (
                    <ul className="space-y-2">
                      {newRecipeData.instruction.map((step, index) => (
                        <li key={index} className="flex justify-between items-start">
                          {isEditingInstruction === index ? (
                            <div className="flex items-start w-full space-x-2">
                              <input
                                type="number"
                                className="w-16 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                                value={newInstructionStep.step}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/[^0-9]/g, "");
                                  value = value === "" ? "" : parseInt(value, 10);
                                  if (value > 100) value = 100;
                                  setNewInstructionStep({ ...newInstructionStep, step: value });
                                  setErrors({ ...errors, instruction: "" });
                                }}
                                placeholder="Step #"
                                min="1"
                              />
                              <textarea
                                className="flex-1 min-h-[60px] border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491] resize-y"
                                value={newInstructionStep.description}
                                onChange={(e) => {
                                  setNewInstructionStep({
                                    ...newInstructionStep,
                                    description: e.target.value,
                                  });
                                  setErrors({ ...errors, instruction: "" });
                                }}
                                placeholder="Enter direction"
                              />
                              <div className="flex space-x-2">
                                <button
                                  className="text-green-500 hover:text-green-700"
                                  onClick={() => handleSaveInstruction(index)}
                                >
                                  Save
                                </button>
                                <button
                                  className="text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    setIsEditingInstruction(null);
                                    setNewInstructionStep({ step: "", description: "" });
                                    setErrors({ ...errors, instruction: "" });
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1">
                                Step {step.step}: {step.description}
                              </span>
                              <div className="space-x-2">
                                <button
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => {
                                    setNewInstructionStep({
                                      step: step.step,
                                      description: step.description,
                                    });
                                    setIsEditingInstruction(index);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteInstruction(index)}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p>No directions</p>
                      <p>Looks like you haven't added any directions yet.</p>
                    </div>
                  )}
                  {isEditingInstruction === null && (
                    <div className="flex items-start space-x-2 mt-2">
                      <input
                        type="number"
                        className="w-16 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                        value={newInstructionStep.step}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9]/g, "");
                          value = value === "" ? "" : parseInt(value, 10);
                          if (value > 100) value = 100;
                          setNewInstructionStep({ ...newInstructionStep, step: value });
                          setErrors({ ...errors, instruction: "" });
                        }}
                        placeholder="Step #"
                        min="1"
                      />
                      <textarea
                        className="flex-1 min-h-[60px] border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491] resize-y"
                        value={newInstructionStep.description}
                        onChange={(e) => {
                          setNewInstructionStep({ ...newInstructionStep, description: e.target.value });
                          setErrors({ ...errors, instruction: "" });
                        }}
                        placeholder="Enter direction"
                      />
                      <button
                        className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a]"
                        onClick={handleAddInstruction}
                      >
                        Add
                      </button>
                    </div>
                  )}
                  {errors.instruction && (
                    <p className="text-red-500 text-sm mt-1">{errors.instruction}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Ingredients</h3>
                    <button
                      className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a]"
                      onClick={handleOpenIngredientModal}
                    >
                      Select Ingredients
                    </button>
                  </div>
                  {newRecipeData.ingredients.length > 0 ? (
                    <ul className="space-y-2">
                      {newRecipeData.ingredients.map((ing, index) => (
                        <li key={ing._id} className="flex justify-between items-center">
                          <span>{ing.name}</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              className="w-16 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                              value={ing.quantity || ""}
                              placeholder="Qty"
                              onChange={(e) => {
                                let value = e.target.value.replace(/[^0-9]/g, "");
                                value = value === "" ? "" : parseInt(value, 10);
                                const unit = ing.unit || "";
                                const maxValue = unit === "g" || unit === "ml" ? 10000 : 100;
                                if (value > maxValue) {
                                  value = maxValue;
                                  e.target.value = value;
                                }
                                const updatedIngredients = [...newRecipeData.ingredients];
                                updatedIngredients[index].quantity = value;
                                setNewRecipeData({
                                  ...newRecipeData,
                                  ingredients: updatedIngredients,
                                });
                                setErrors({ ...errors, ingredients: "" });
                              }}
                              onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              min="1"
                            />
                            <select
                              className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                              value={ing.unit || ""}
                              onChange={(e) => {
                                const updatedIngredients = [...newRecipeData.ingredients];
                                updatedIngredients[index].unit = e.target.value;
                                const maxValue =
                                  e.target.value === "g" || e.target.value === "ml" ? 10000 : 100;
                                if (updatedIngredients[index].quantity > maxValue) {
                                  updatedIngredients[index].quantity = maxValue;
                                }
                                setNewRecipeData({
                                  ...newRecipeData,
                                  ingredients: updatedIngredients,
                                });
                                setErrors({ ...errors, ingredients: "" });
                              }}
                            >
                              <option value="">Unit</option>
                              <option value="g">g</option>
                              <option value="ml">ml</option>
                              <option value="tsp">tsp</option>
                              <option value="tbsp">tbsp</option>
                            </select>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                const updatedIngredients = newRecipeData.ingredients.filter(
                                  (_, i) => i !== index
                                );
                                setNewRecipeData({
                                  ...newRecipeData,
                                  ingredients: updatedIngredients,
                                });
                                setErrors({
                                  ...errors,
                                  ingredients:
                                    updatedIngredients.length === 0
                                      ? "Please add at least one Ingredient!"
                                      : "",
                                });
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p>No ingredients</p>
                      <p>Looks like you haven't added any ingredients yet.</p>
                    </div>
                  )}
                  {errors.ingredients && (
                    <p className="text-red-500 text-sm mt-1">{errors.ingredients}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nutrition (Total for {newRecipeData.totalServing || 1} Servings)
                  </h3>
                  {newRecipeData.ingredients.length > 0 &&
                    newRecipeData.ingredients.every((ing) => ing.quantity && ing.unit) ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Calories:</span>
                        <span className="font-medium">{nutritionData.calories} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Protein:</span>
                        <span className="font-medium">{nutritionData.protein} g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Fat:</span>
                        <span className="font-medium">{nutritionData.fat} g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Carbs:</span>
                        <span className="font-medium">{nutritionData.carbs} g</span>
                      </div>
                      <h4 className="text-md font-semibold text-gray-700 mt-4">
                        Per Serving (1 Serving)
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Calories:</span>
                        <span className="font-medium">
                          {(nutritionData.calories / (newRecipeData.totalServing || 1)).toFixed(2)} kcal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Protein:</span>
                        <span className="font-medium">
                          {(nutritionData.protein / (newRecipeData.totalServing || 1)).toFixed(2)} g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Fat:</span>
                        <span className="font-medium">
                          {(nutritionData.fat / (newRecipeData.totalServing || 1)).toFixed(2)} g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Carbs:</span>
                        <span className="font-medium">
                          {(nutritionData.carbs / (newRecipeData.totalServing || 1)).toFixed(2)} g
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No nutrition data available. Add ingredients with quantities and units to see
                      nutrition details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <IngredientSelectionModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSelect={handleSelectIngredients}
        availableIngredients={availableIngredients}
        typeOptions={INGREDIENT_TYPE_OPTIONS}
        selectedIngredients={newRecipeData.ingredients}
      />
    </div>
  );
};

const IngredientSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  availableIngredients,
  typeOptions,
  selectedIngredients,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [tempSelectedIngredients, setTempSelectedIngredients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedIngredients([]);
      setCurrentPage(1);
      setSearchTerm("");
      setFilterType("all");
    }
  }, [isOpen]);

  const handleClose = () => {
    setTempSelectedIngredients([]);
    setCurrentPage(1);
    setSearchTerm("");
    setFilterType("all");
    onClose();
  };

  // Filter and paginate ingredients
  const filteredIngredients = availableIngredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || ing.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalItems = filteredIngredients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIngredients = filteredIngredients.slice(startIndex, startIndex + itemsPerPage);

  const handleIngredientClick = (ingredient) => {
    const isAlreadyAdded = selectedIngredients.some((selected) => selected._id === ingredient._id);
    if (isAlreadyAdded) return; // Prevent selecting already added ingredients

    const isSelected = tempSelectedIngredients.some((item) => item._id === ingredient._id);
    if (isSelected) {
      setTempSelectedIngredients(
        tempSelectedIngredients.filter((item) => item._id !== ingredient._id)
      );
    } else {
      setTempSelectedIngredients([
        ...tempSelectedIngredients,
        { ...ingredient, quantity: "", unit: "" },
      ]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelectedIngredients);
    handleClose();
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-5xl h-[100vh] flex flex-col shadow-xl">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-[#40B491]">Select Ingredients</h2>
          <div className="ml-auto flex space-x-3">
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${tempSelectedIngredients.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={tempSelectedIngredients.length === 0}
            >
              Confirm
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilterType("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md font-semibold ${filterType === "all"
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition duration-200`}
            >
              All
            </button>
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${filterType === type
                  ? "bg-[#40B491] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } transition duration-200`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentIngredients.length > 0 ? (
              currentIngredients.map((ing) => {
                const isAlreadyAdded = selectedIngredients.some(
                  (selected) => selected._id === ing._id
                );
                const isSelected = tempSelectedIngredients.some(
                  (item) => item._id === ing._id
                );

                return (
                  <div
                    key={ing._id}
                    className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer relative ${isSelected ? "border-[#40B491] border-2" : "border-gray-200"
                      } ${isAlreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !isAlreadyAdded && handleIngredientClick(ing)}
                  >
                    <div className="relative h-40 bg-gray-200">
                      {ing.imageUrl ? (
                        <img
                          src={ing.imageUrl}
                          alt={ing.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <img
                            src="https://via.placeholder.com/150?text=No+Image"
                            alt="No image available"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {isAlreadyAdded && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white font-semibold">Added</span>
                        </div>
                      )}
                      {isSelected && !isAlreadyAdded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-[#40B491] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">
                            Choice
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800">{ing.name}</h3>
                        <span className="text-sm font-bold text-blue-600">
                          {ing.calories || "N/A"}{" "}
                          {ing.calories !== "N/A" ? "kcal" : ""}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Protein:</span>
                          <span className="font-medium">
                            {ing.protein || "N/A"}{" "}
                            {ing.protein !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Fat:</span>
                          <span className="font-medium">
                            {ing.fat || "N/A"}{" "}
                            {ing.fat !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Carbs:</span>
                          <span className="font-medium">
                            {ing.carbs || "N/A"}{" "}
                            {ing.carbs !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  className="w-24 h-24 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-lg font-semibold">No ingredients found</p>
                <p className="text-sm">Try adjusting your search term.</p>
              </div>
            )}
          </div>
        </div>

        {totalItems > 0 && (
          <div className="mt-6 p-4 bg-gray-50">
            <Pagination
              limit={itemsPerPage}
              setLimit={setItemsPerPage}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              currentPage={currentPage - 1}
              text="Ingredients"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TableRecipes;