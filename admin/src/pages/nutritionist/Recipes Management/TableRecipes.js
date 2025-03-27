import React, { useEffect, useState } from "react";
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

const TableRecipes = () => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [totalDishPages, setTotalDishPages] = useState(1);
  const [totalIngredientPages, setTotalIngredientPages] = useState(1);
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
  const [newInstructionStep, setNewInstructionStep] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);
    console.log("📡 Gửi yêu cầu lấy danh sách món ăn:", { currentPage, itemsPerPage, searchTerm });
    try {
      const [dishesResponse, ingredientsResponse] = await Promise.all([
        dishService.getAllDishes(currentPage, itemsPerPage, searchTerm),
        ingredientService.getAllIngredients(1, 1000),
      ]);
      console.log("📌 Phản hồi từ dishesService:", dishesResponse);
      console.log("📌 Phản hồi từ ingredientService:", ingredientsResponse);

      if (dishesResponse?.success) {
        setDishes(dishesResponse.data.items || []);
        setTotalItems(dishesResponse.data.total || 0);
        setTotalDishPages(dishesResponse.data.totalPages || 1);
      } else {
        console.error("❌ Lỗi từ dishesService:", dishesResponse.message);
        setDishes([]);
        alert("Không thể tải danh sách món ăn: " + dishesResponse.message);
      }
      if (ingredientsResponse?.success) {
        setAvailableIngredients(ingredientsResponse.data.items || []);
      } else {
        console.error("❌ Lỗi từ ingredientService:", ingredientsResponse.message);
        setAvailableIngredients([]);
      }
    } catch (error) {
      console.error("❌ Lỗi trong fetchData:", error.message);
      setDishes([]);
      setAvailableIngredients([]);
      alert("Đã xảy ra lỗi khi tải dữ liệu: " + error.message);
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
    try {
      if (dish.recipeId) {
        const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
        if (recipeResponse.success && recipeResponse.data?.status === "success") {
          const recipe = recipeResponse.data.data;
          const existingIngredients = recipe.ingredients?.map((ing) => ({
            _id: ing.ingredientId._id,
            name: ing.ingredientId.name || "Unknown",
            quantity: ing.quantity,
            unit: ing.unit,
          })) || [];
          setNewRecipeData({
            ingredients: existingIngredients,
            instruction: recipe.instruction || [],
            cookingTime: recipe.cookingTime || "",
            totalServing: recipe.totalServing || "",
          });
        } else {
          setNewRecipeData({
            ingredients: [],
            instruction: [],
            cookingTime: "",
            totalServing: "",
          });
        }
      } else {
        setNewRecipeData({
          ingredients: [],
          instruction: [],
          cookingTime: "",
          totalServing: "",
        });
      }
      setIsAddRecipeModalOpen(true);
    } catch (error) {
      setNewRecipeData({
        ingredients: [],
        instruction: [],
        cookingTime: "",
        totalServing: "",
      });
      setIsAddRecipeModalOpen(true);
    }
  };

  const handleAddInstruction = () => {
    if (newInstructionStep.trim()) {
      setNewRecipeData({
        ...newRecipeData,
        instruction: [
          ...newRecipeData.instruction,
          {
            step: newRecipeData.instruction.length + 1,
            description: newInstructionStep.trim(),
          },
        ],
      });
      setNewInstructionStep("");
      setErrors({ ...errors, instruction: "" });
    }
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
      if (selectedDish.recipeId) {
        response = await recipesService.updateRecipe(selectedDish.recipeId, updatedRecipe);
      } else {
        response = await recipesService.createRecipe(selectedDish._id, updatedRecipe);
      }

      if (response.success) {
        alert(`Recipe for "${selectedDish.name}" has been saved!`);
        fetchData();
        setIsAddRecipeModalOpen(false);
        setNewRecipeData({
          ingredients: [],
          instruction: [],
          cookingTime: "",
          totalServing: "",
        });
        setErrors({});
      } else {
        alert("Failed to save: " + response.message);
      }
    } catch (error) {
      alert("An error occurred while saving: " + (error.message || "Unknown error"));
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
      alert(`The following ingredients are already in the recipe: ${duplicates.join(", ")}. Please edit the existing entries instead.`);
    } else {
      setErrors({ ...errors, ingredients: "" });
    }

    setIsIngredientModalOpen(false);
  };

  const handleDeleteRecipe = async (dish) => {
    if (!dish.recipeId) {
      alert("This dish has no recipe to delete!");
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete the recipe for "${dish.name}"?`);
    if (!confirmDelete) return;

    try {
      const response = await recipesService.deleteRecipe(dish._id, dish.recipeId);
      if (response.success) {
        alert(`The recipe for "${dish.name}" has been deleted! ${response.message}`);
        fetchData();
        if (dishes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        alert("Failed to delete recipe: " + response.message);
      }
    } catch (error) {
      alert("An error occurred while deleting: " + (error.message || "Unspecified error"));
    }
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalDishPages) {
      setCurrentPage(selectedPage);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          List of Dishes
        </h2>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setFilterType("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md font-semibold ${
              filterType === "all"
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
              className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${
                filterType === type
                  ? "bg-[#40B491] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition duration-200`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by dish name"
            className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Dishes Grid */}
      {isLoading ? (
        <div className="text-center py-4">
          <p>Loading dishes...</p>
        </div>
      ) : (
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
                    <h3 className="text-lg font-semibold text-center text-gray-800">
                      {dish.name}
                    </h3>
                    <div className="text-sm text-gray-600 mt-2 space-y-2">
                      {/* First Row: Cooking Time, Servings, Calories */}
                      <div className="flex justify-between items-center px-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.cookingTime || "N/A"} mins
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.totalServing || "N/A"} servings
                        </span>
                        <span className="flex items-center">
                          <Flame className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.calories || "N/A"} kcal
                        </span>
                      </div>
                      {/* Second Row: Protein, Carbs, Fat */}
                      <div className="flex justify-between items-center px-4">
                        <span className="flex items-center">
                          <Dumbbell className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.protein || "N/A"}g
                        </span>
                        <span className="flex items-center">
                          <Wheat className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.carbs || "N/A"}g
                        </span>
                        <span className="flex items-center">
                          <Droplet className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.fat || "N/A"}g
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 border-t border-gray-200 h-16 flex items-center justify-center">
                    <div className="flex w-full justify-center items-center gap-2">
                      <button
                        onClick={() => handleAddRecipeClick(dish)}
                        className="flex-1 text-[#40B491] flex items-center justify-center px-2 py-1 hover:text-[#359c7a] transition"
                      >
                        <EditIcon className="w-4 h-4 mr-1" />
                        Edit Recipe
                      </button>
                      {dish.recipeId && (
                        <>
                          <div className="h-4 border-l border-gray-300 mx-2"></div>
                          <button
                            onClick={() => handleDeleteRecipe(dish)}
                            className="flex-1 text-red-500 flex items-center justify-center px-2 py-1 hover:text-red-600 transition"
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
      )}

      {/* Pagination */}
      {totalItems > 0 && !isLoading && (
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text={"Dishes"}
          />
        </div>
      )}

      {/* Add/Edit Recipe Modal */}
      {isAddRecipeModalOpen && selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">
                {selectedDish.recipeId ? "Edit Recipe" : "Add Recipe"}: {selectedDish.name}
              </h2>
              <div className="ml-auto flex space-x-3">
                <button
                  onClick={handleSaveRecipe}
                  className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddRecipeModalOpen(false);
                    setErrors({});
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
                      className={`w-full border ${
                        errors.cookingTime ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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
                      className={`w-full border ${
                        errors.totalServing ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      value={newRecipeData.totalServing}
                      onInput={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, "");
                        value = value === "" ? "" : parseInt(value, 10);
                        if (value > 10) {
                          value = 10;
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
                      max="10"
                    />
                    {errors.totalServing && (
                      <p className="text-red-500 text-sm mt-1">{errors.totalServing}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Directions</h3>
                    <button
                      className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a]"
                      onClick={handleAddInstruction}
                    >
                      + Add Direction
                    </button>
                  </div>
                  {newRecipeData.instruction.length > 0 ? (
                    <ul className="space-y-2">
                      {newRecipeData.instruction.map((step, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>{step.description}</span>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              const updatedInstructions = newRecipeData.instruction
                                .filter((_, i) => i !== index)
                                .map((inst, idx) => ({ ...inst, step: idx + 1 }));
                              setNewRecipeData({
                                ...newRecipeData,
                                instruction: updatedInstructions,
                              });
                              setErrors({
                                ...errors,
                                instruction:
                                  updatedInstructions.length === 0
                                    ? "Please add at least one Instruction step!"
                                    : "",
                              });
                            }}
                          >
                            Delete
                          </button>
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
                  {errors.instruction && (
                    <p className="text-red-500 text-sm mt-1">{errors.instruction}</p>
                  )}
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                    value={newInstructionStep}
                    onChange={(e) => setNewInstructionStep(e.target.value)}
                    placeholder="Enter direction"
                  />
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
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Nutrition</h3>
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentIngredients, setCurrentIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, [currentPage, filterType, searchTerm, itemsPerPage]);

  const fetchIngredients = async () => {
    setIsLoading(true);
    const response = await ingredientService.getAllIngredients(
      currentPage,
      itemsPerPage,
      filterType === "all" ? "" : filterType,
      searchTerm
    );
    if (response.success) {
      setCurrentIngredients(response.data.items || []);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } else {
      setCurrentIngredients([]);
      setTotalPages(1);
    }
    setIsLoading(false);
  };

  const handleCheckboxChange = (ingredient) => {
    const isSelected = tempSelectedIngredients.some((item) => item._id === ingredient._id);
    if (isSelected) {
      setTempSelectedIngredients(
        tempSelectedIngredients.filter((item) => item._id !== ingredient._id)
      );
    } else {
      setTempSelectedIngredients([...tempSelectedIngredients, { ...ingredient, quantity: "", unit: "" }]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelectedIngredients);
    setTempSelectedIngredients([]);
    setCurrentPage(1);
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
      <div className="bg-white rounded-2xl p-6 w-3/4 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-[#40B491]">Select Ingredients</h2>
          <div className="ml-auto flex space-x-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
            >
              Confirm
            </button>
            <button
              onClick={onClose}
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
              className={`px-4 py-2 rounded-md font-semibold ${
                filterType === "all"
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
                className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${
                  filterType === type
                    ? "bg-[#40B491] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition duration-200`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search by ingredient name"
              className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading ingredients...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentIngredients.length > 0 ? (
              currentIngredients.map((ing) => {
                const isAlreadyAdded = selectedIngredients.some(
                  (selected) => selected._id === ing._id
                );
                return (
                  <div
                    key={ing._id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg"
                  >
                    <img
                      src={ing.imageUrl || "https://via.placeholder.com/300"}
                      alt={ing.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-center text-gray-800">
                        {ing.name}
                      </h3>
                      <div className="flex flex-wrap justify-center items-center text-sm text-gray-600 mt-2 gap-3">
                        <span className="flex items-center">
                          <Flame className="w-4 h-4 mr-1" />
                          {ing.calories || "N/A"} kcal
                        </span>
                        <span className="flex items-center">
                          <Dumbbell className="w-4 h-4 mr-1" />
                          {ing.protein || "N/A"}g
                        </span>
                        <span className="flex items-center">
                          <Wheat className="w-4 h-4 mr-1" />
                          {ing.carbs || "N/A"}g
                        </span>
                        <span className="flex items-center">
                          <Droplet className="w-4 h-4 mr-1" />
                          {ing.fat || "N/A"}g
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center items-center p-2 bg-gray-50 border-t border-gray-200">
                      <input
                        type="checkbox"
                        checked={tempSelectedIngredients.some((item) => item._id === ing._id)}
                        onChange={() => handleCheckboxChange(ing)}
                        disabled={isAlreadyAdded}
                        className={isAlreadyAdded ? "opacity-50 cursor-not-allowed" : ""}
                      />
                      {isAlreadyAdded && (
                        <span className="text-sm text-gray-500 ml-2">Already Added</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-500">
                <p>No ingredients found.</p>
              </div>
            )}
          </div>
        )}
        {totalItems > 0 && !isLoading && (
          <div className="p-4 bg-gray-50">
            <Pagination
              limit={itemsPerPage}
              setLimit={(value) => setItemsPerPage(value)}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              text={"Ingredients"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TableRecipes;