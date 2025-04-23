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
  PlusIcon,
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

// Hàm tính toán dinh dưỡng
const calculateTotalNutrition = (ingredients, availableIngredients) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  ingredients.forEach((ing) => {
    const ingredientData = availableIngredients.find(
      (item) => item._id === (ing.ingredientId?._id || ing.ingredientId || ing._id)
    );
    if (ingredientData && ing.quantity >= 0 && ing.unit) {
      let conversionFactor;
      if (ing.unit === "g" || ing.unit === "ml") {
        conversionFactor = ing.quantity / 100;
      } else if (ing.unit === "tbsp") {
        conversionFactor = (ing.quantity * 15) / 100;
      } else if (ing.unit === "tsp") {
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

  return {
    calories: totalCalories.toFixed(2),
    protein: totalProtein.toFixed(2),
    fat: totalFat.toFixed(2),
    carbs: totalCarbs.toFixed(2),
  };
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, dishName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the recipe for <strong>{dishName}</strong>? This action
          cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TableRecipes = () => {
  const [dishes, setDishes] = useState([]);
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
  const [newInstructionStep, setNewInstructionStep] = useState({ description: "" });
  const [addingAfterStep, setAddingAfterStep] = useState(null);
  const [showNewInstructionInput, setShowNewInstructionInput] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteDishId, setDeleteDishId] = useState(null);
  const [deleteDishName, setDeleteDishName] = useState("");
  const [deleteRecipeId, setDeleteRecipeId] = useState(null);

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

  const handleFilterChange = useCallback(
    (type) => {
      setFilterType(type === filterType ? "all" : type);
      setCurrentPage(1);
    },
    [filterType]
  );

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm, filterType]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dishesResponse, ingredientsResponse] = await Promise.all([
        dishService.getAllDishes(currentPage, itemsPerPage, filterType, searchTerm),
        ingredientService.getAllIngredients(1, 1000),
      ]);

      if (dishesResponse?.success) {
        let dishesData = dishesResponse.data.items || [];
        for (let dish of dishesData) {
          if (dish.recipeId && typeof dish.recipeId === "string") {
            const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
            if (recipeResponse.success) {
              dish.recipe = recipeResponse.data;
              if (dish.recipe?.ingredients?.length > 0) {
                const nutrition = calculateTotalNutrition(
                  dish.recipe.ingredients,
                  ingredientsResponse.data.items || []
                );
                dish.recipe.calories = nutrition.calories;
                dish.recipe.protein = nutrition.protein;
                dish.recipe.fat = nutrition.fat;
                dish.recipe.carbs = nutrition.carbs;
              } else {
                dish.recipe.calories = 0;
                dish.recipe.protein = 0;
                dish.recipe.fat = 0;
                dish.recipe.carbs = 0;
              }
            } else {
              dish.recipe = null;
            }
          } else {
            dish.recipe = null;
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
    if (newRecipeData.ingredients.length > 0) {
      const nutrition = calculateTotalNutrition(newRecipeData.ingredients, availableIngredients);
      setNutritionData(nutrition);
    } else {
      setNutritionData({ calories: 0, protein: 0, fat: 0, carbs: 0 });
    }
  }, [newRecipeData.ingredients, availableIngredients]);

  const handleAddRecipeClick = async (dish) => {
    setSelectedDish(dish);
    setErrors({});
    setNewInstructionStep({ description: "" });
    setIsEditingInstruction(null);
    setAddingAfterStep(null);
    setShowNewInstructionInput(false);

    try {
      let recipeData = null;

      if (dish.recipe) {
        recipeData = dish.recipe;
      } else if (dish.recipeId && typeof dish.recipeId === "string") {
        const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
        if (recipeResponse.success) {
          recipeData = recipeResponse.data;
        } else {
          toast.error("Could not load existing recipe: " + recipeResponse.message);
        }
      }

      if (recipeData) {
        const existingIngredients =
          recipeData.ingredients?.map((ing) => ({
            _id: ing.ingredientId._id || ing.ingredientId,
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
    const description = newInstructionStep.description.trim();

    if (!description) {
      setErrors({ ...errors, instruction: "Please enter a description!" });
      return;
    }

    if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(description)) {
      setErrors({ ...errors, instruction: "Description contains invalid characters!" });
      return;
    }

    if (description.length > 300) {
      setErrors({ ...errors, instruction: "Description must not exceed 300 characters!" });
      return;
    }

    const nextStep = newRecipeData.instruction.length + 1;

    setNewRecipeData({
      ...newRecipeData,
      instruction: [...newRecipeData.instruction, { step: nextStep, description }].sort(
        (a, b) => a.step - b.step
      ),
    });
    setNewInstructionStep({ description: "" });
    setShowNewInstructionInput(false);
    setErrors({ ...errors, instruction: "" });
  };

  const handleAddAfterStep = (currentStep) => {
    const description = newInstructionStep.description.trim();

    if (!description) {
      setErrors({ ...errors, instruction: "Please enter a description!" });
      return;
    }

    if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(description)) {
      setErrors({ ...errors, instruction: "Description contains invalid characters!" });
      return;
    }

    if (description.length > 300) {
      setErrors({ ...errors, instruction: "Description must not exceed 300 characters!" });
      return;
    }

    const updatedInstructions = newRecipeData.instruction.map((inst) => {
      if (inst.step > currentStep) {
        return { ...inst, step: inst.step + 1 };
      }
      return inst;
    });

    updatedInstructions.push({ step: currentStep + 1, description });

    setNewRecipeData({
      ...newRecipeData,
      instruction: updatedInstructions.sort((a, b) => a.step - b.step),
    });
    setNewInstructionStep({ description: "" });
    setAddingAfterStep(null);
    setErrors({ ...errors, instruction: "" });
  };

  const handleShowAddAfterInput = (step) => {
    setAddingAfterStep(step);
    setNewInstructionStep({ description: "" });
    setShowNewInstructionInput(false);
    setIsEditingInstruction(null);
    setErrors({ ...errors, instruction: "" });
  };

  const handleShowNewInstructionInput = () => {
    setShowNewInstructionInput(true);
    setAddingAfterStep(null);
    setNewInstructionStep({ description: "" });
    setIsEditingInstruction(null);
    setErrors({ ...errors, instruction: "" });
  };

  const handleCancelInstructionInput = () => {
    setShowNewInstructionInput(false);
    setAddingAfterStep(null);
    setNewInstructionStep({ description: "" });
    setErrors({ ...errors, instruction: "" });
  };

  const handleSaveInstruction = (index) => {
    const description = newInstructionStep.description.trim();

    if (!description) {
      setErrors({ ...errors, instruction: "Please enter a description!" });
      return;
    }

    if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(description)) {
      setErrors({ ...errors, instruction: "Description contains invalid characters!" });
      return;
    }

    if (description.length > 300) {
      setErrors({ ...errors, instruction: "Description must not exceed 300 characters!" });
      return;
    }

    const updatedInstructions = [...newRecipeData.instruction];
    updatedInstructions[index] = { ...updatedInstructions[index], description };

    setNewRecipeData({
      ...newRecipeData,
      instruction: updatedInstructions.sort((a, b) => a.step - b.step),
    });
    setIsEditingInstruction(null);
    setNewInstructionStep({ description: "" });
    setErrors({ ...errors, instruction: "" });
  };

  const handleDeleteInstruction = (index) => {
    const deletedStep = newRecipeData.instruction[index].step;
    const updatedInstructions = newRecipeData.instruction
      .filter((_, i) => i !== index)
      .map((inst) => {
        if (inst.step > deletedStep) {
          return { ...inst, step: inst.step - 1 };
        }
        return inst;
      });

    setNewRecipeData({
      ...newRecipeData,
      instruction: updatedInstructions,
    });
    setErrors({
      ...errors,
      instruction:
        updatedInstructions.length === 0 ? "Please add at least one Instruction step!" : "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      newRecipeData.cookingTime === "" ||
      isNaN(newRecipeData.cookingTime) ||
      newRecipeData.cookingTime < 0
    ) {
      newErrors.cookingTime = "Cooking Time must be greater than or equal to 0";
    } else if (newRecipeData.cookingTime > 1440) {
      newErrors.cookingTime = "Cooking Time must not exceed 1440 minutes";
    }

    if (
      newRecipeData.totalServing === "" ||
      isNaN(newRecipeData.totalServing) ||
      newRecipeData.totalServing < 1
    ) {
      newErrors.totalServing = "Serving Size must be at least 1";
    } else if (newRecipeData.totalServing > 10) {
      newErrors.totalServing = "Serving Size must not exceed 10";
    }

    if (newRecipeData.ingredients.length === 0) {
      newErrors.ingredients = "Please add at least one Ingredient!";
    } else {
      const invalidIngredient = newRecipeData.ingredients.find((ing) => {
        if (!ing.quantity || ing.quantity < 0 || isNaN(ing.quantity) || !ing.unit) {
          return true;
        }
        const maxValue = ing.unit === "g" || ing.unit === "ml" ? 10000 : 100;
        return ing.quantity > maxValue;
      });
      if (invalidIngredient) {
        const maxValue =
          invalidIngredient.unit === "g" || invalidIngredient.unit === "ml" ? 10000 : 100;
        newErrors.ingredients =
          invalidIngredient.quantity > maxValue
            ? `Quantity must not exceed ${maxValue} ${invalidIngredient.unit}`
            : "Please enter a valid Quantity and Unit for all ingredients!";
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
      toast.error("Please fill in all required fields correctly!");
      return;
    }

    setIsSaving(true);

    const formattedIngredients = newRecipeData.ingredients.map((ing) => ({
      ingredientId: ing._id,
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit || "g",
    }));

    const nutrition = calculateTotalNutrition(formattedIngredients, availableIngredients);

    const updatedRecipe = {
      ingredients: formattedIngredients,
      instruction: newRecipeData.instruction,
      cookingTime: newRecipeData.cookingTime,
      totalServing: newRecipeData.totalServing,
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
    };

    try {
      let response;
      const dishId = selectedDish._id;
      const recipeId = selectedDish.recipeId;

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
        toast.error("Please select Unit type");
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
        newIngredients.push({
          _id: newIng._id,
          name: newIng.name,
          quantity: "",
          unit: newIng.unit || "g",
        });
      }
    });

    setNewRecipeData({
      ...newRecipeData,
      ingredients: newIngredients,
    });

    if (duplicates.length > 0) {
      toast.error(
        `The following ingredients are already in the recipe: ${duplicates.join(
          ", "
        )}. Please edit the existing entries instead.`
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

    setDeleteDishId(dish._id);
    setDeleteDishName(dish.name);
    setDeleteRecipeId(dish.recipeId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRecipe = async () => {
    try {
      const response = await recipesService.deleteRecipe(deleteDishId, deleteRecipeId);
      if (response.success) {
        toast.success(`The recipe for "${deleteDishName}" has been deleted!`);
        fetchData();
        if (dishes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error("Failed to delete recipe: " + response.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting: " + (error.message || "Unspecified error"));
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteDishId(null);
      setDeleteDishName("");
      setDeleteRecipeId(null);
    }
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalDishPages) {
      setCurrentPage(selectedPage);
    }
  };

  const formatNutrition = (value) => {
    if (isNaN(value) || value === null) return "N/A";
    if (Math.abs(value) < 0.01) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    if (Number.isInteger(value) || value % 1 === 0) {
      return String(Math.round(value));
    }
    return value.toFixed(2);
  };

  useEffect(() => {
    if (!isAddRecipeModalOpen) {
      setNewRecipeData({
        ingredients: [],
        instruction: [],
        cookingTime: "",
        totalServing: "",
      });
      setSelectedDish(null);
      setNewInstructionStep({ description: "" });
      setIsEditingInstruction(null);
      setAddingAfterStep(null);
      setShowNewInstructionInput(false);
      setErrors({});
    }
  }, [isAddRecipeModalOpen]);

  return (
    <div className="container mx-auto px-6 py-8">
      <style>
        {`
          .loader {
            border-top-color: #40B491;
            border-bottom-color: #40B491;
            border-left-color: transparent;
            border-right-color: transparent;
            border-width: 4px;
            border-style: solid;
            animation: spin 1s linear infinite;
            border-radius: 50%;
            width: 40px;
            height: 40px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">List of Dishes</h2>
      </div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2 rounded-md font-semibold ${
              filterType === "all"
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
            disabled={isLoading}
          >
            All
          </button>
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${
                filterType === type
                  ? "bg-[#40B491] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition duration-200`}
              disabled={isLoading}
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
            {dishes?.length > 0 ? (
              dishes.map((dish) => (
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
                      <div className="flex justify-between gap-2">
                        <div className="flex-1 flex flex-col space-y-2">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs truncate">
                              Time: {dish.recipe?.cookingTime || "N/A"} m
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs truncate">
                              Protein:{" "}
                              {dish.recipe?.totalServing && dish.recipe?.protein
                                ? formatNutrition(dish.recipe.protein / dish.recipe.totalServing)
                                : "0"}{" "}
                              g
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Droplet className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs truncate">
                              Fat:{" "}
                              {dish.recipe?.totalServing && dish.recipe?.fat
                                ? formatNutrition(dish.recipe.fat / dish.recipe.totalServing)
                                : "0"}{" "}
                              g
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col space-y-2">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs truncate">
                              Serving: {dish.recipe?.totalServing || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Flame className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs truncate">
                              Calories:{" "}
                              {dish.recipe?.totalServing && dish.recipe?.calories
                                ? formatNutrition(dish.recipe.calories / dish.recipe.totalServing)
                                : "0"}{" "}
                              kcal
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Wheat className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="text-xs truncate">
                              Carbs:{" "}
                              {dish.recipe?.totalServing && dish.recipe?.carbs
                                ? formatNutrition(dish.recipe.carbs / dish.recipe.totalServing)
                                : "0"}{" "}
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
                        disabled={isLoading}
                      >
                        {dish.recipeId ? (
                          <>
                            <EditIcon className="w-4 h-4 mr-1" />
                            Edit Recipe
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Recipe
                          </>
                        )}
                      </button>
                      {dish.recipeId && (
                        <>
                          <div className="h-4 border-l border-gray-300 mx-1"></div>
                          <button
                            onClick={() => handleDeleteRecipe(dish)}
                            className="flex-1 text-red-500 flex items-center justify-center px-2 py-1 hover:text-red-600 transition whitespace-nowrap"
                            disabled={isLoading}
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
            text="Dishes"
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
                  className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${
                    isSaving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
                    setNewInstructionStep({ description: "" });
                    setIsEditingInstruction(null);
                    setAddingAfterStep(null);
                    setShowNewInstructionInput(false);
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
                      className={`w-full border ${
                        errors.cookingTime ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      value={newRecipeData.cookingTime}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, "");
                        value = value === "" ? "" : parseInt(value, 10);
                        setNewRecipeData({ ...newRecipeData, cookingTime: value });
                        setErrors({ ...errors, cookingTime: "" });
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter cooking time"
                      min="0"
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
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, "");
                        value = value === "" ? "" : parseInt(value, 10);
                        setNewRecipeData({ ...newRecipeData, totalServing: value });
                        setErrors({ ...errors, totalServing: "" });
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter serving size"
                      min="0"
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
                    <ul className="space-y-4">
                      {newRecipeData.instruction.map((inst, index) => (
                        <li key={inst.step} className="flex flex-col gap-2">
                          {isEditingInstruction === index ? (
                            <div className="flex items-start gap-4 w-full">
                              <span className="min-w-[80px] font-medium pt-2">
                                Step {inst.step}:
                              </span>
                              <div className="flex-1 flex flex-col gap-2">
                                <textarea
                                  className="w-full min-h-[60px] border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491] resize-y"
                                  value={newInstructionStep.description}
                                  onChange={(e) => {
                                    setNewInstructionStep({
                                      ...newInstructionStep,
                                      description: e.target.value,
                                    });
                                    setErrors({ ...errors, instruction: "" });
                                  }}
                                  placeholder="Enter description"
                                  maxLength={300}
                                />
                                <div className="flex gap-2">
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
                                      setNewInstructionStep({ description: "" });
                                      setErrors({ ...errors, instruction: "" });
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-4 w-full">
                              <span className="min-w-[80px] font-medium">Step {inst.step}:</span>
                              <span className="flex-1 max-w-full break-words">
                                {inst.description}
                              </span>
                              <div className="min-w-[120px] flex flex-col gap-2 items-end">
                                <button
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => {
                                    setNewInstructionStep({
                                      description: inst.description,
                                    });
                                    setIsEditingInstruction(index);
                                    setAddingAfterStep(null);
                                    setShowNewInstructionInput(false);
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
                                <button
                                  className="text-[#40B491] hover:text-[#359c7a]"
                                  onClick={() => handleShowAddAfterInput(inst.step)}
                                >
                                  Add After
                                </button>
                              </div>
                            </div>
                          )}
                          {addingAfterStep === inst.step && (
                            <div className="flex items-start gap-4 mt-2 w-full">
                              <span className="min-w-[80px] font-medium pt-2">
                                Step {inst.step + 1}:
                              </span>
                              <div className="flex-1 flex flex-col gap-2">
                                <textarea
                                  className="w-full min-h-[60px] border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491] resize-y"
                                  value={newInstructionStep.description}
                                  onChange={(e) => {
                                    setNewInstructionStep({
                                      ...newInstructionStep,
                                      description: e.target.value,
                                    });
                                    setErrors({ ...errors, instruction: "" });
                                  }}
                                  placeholder="Enter description for new step"
                                  maxLength={300}
                                />
                                <div className="flex gap-2">
                                  <button
                                    className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a]"
                                    onClick={() => handleAddAfterStep(inst.step)}
                                  >
                                    Add
                                  </button>
                                  <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={handleCancelInstructionInput}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          {addingAfterStep === inst.step && newInstructionStep.description && (
                            <p className="text-gray-500 text-sm mt-1 ml-[96px]">
                              {newInstructionStep.description.length}/300 characters
                            </p>
                          )}
                          {addingAfterStep === inst.step && errors.instruction && (
                            <p className="text-red-500 text-sm mt-1 ml-[96px]">
                              {errors.instruction}
                            </p>
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
                      <p>No descriptions</p>
                      <p>Looks like you haven't added any descriptions yet.</p>
                    </div>
                  )}
                  {showNewInstructionInput &&
                    isEditingInstruction === null &&
                    addingAfterStep === null && (
                      <div className="flex items-start gap-4 mt-4 w-full">
                        <span className="min-w-[80px] font-medium pt-2">
                          Step {newRecipeData.instruction.length + 1}:
                        </span>
                        <div className="flex-1 flex flex-col gap-2">
                          <textarea
                            className="w-full min-h-[60px] border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491] resize-y"
                            value={newInstructionStep.description}
                            onChange={(e) => {
                              setNewInstructionStep({
                                ...newInstructionStep,
                                description: e.target.value,
                              });
                              setErrors({ ...errors, instruction: "" });
                            }}
                            placeholder="Enter description for new step"
                            maxLength={300}
                          />
                          <div className="flex gap-2">
                            <button
                              className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a]"
                              onClick={handleAddInstruction}
                            >
                              Add
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={handleCancelInstructionInput}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  {showNewInstructionInput && newInstructionStep.description && (
                    <p className="text-gray-500 text-sm mt-1 ml-[96px]">
                      {newInstructionStep.description.length}/300 characters
                    </p>
                  )}
                  {showNewInstructionInput && errors.instruction && (
                    <p className="text-red-500 text-sm mt-1 ml-[96px]">{errors.instruction}</p>
                  )}
                  {isEditingInstruction === null &&
                    addingAfterStep === null &&
                    !showNewInstructionInput && (
                      <div className="mt-4">
                        <button
                          className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a]"
                          onClick={handleShowNewInstructionInput}
                        >
                          Add New Step
                        </button>
                      </div>
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
                        <li key={ing._id} className="flex items-center gap-4">
                          <span className="w-1/2 min-w-0 truncate text-left">{ing.name}</span>
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <input
                              type="text"
                              className="w-16 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                              value={ing.quantity}
                              placeholder="Qty"
                              onChange={(e) => {
                                let value = e.target.value;
                                if (!/^\d*\.?\d{0,2}$/.test(value)) return;
                                const updatedIngredients = [...newRecipeData.ingredients];
                                updatedIngredients[index].quantity = value;
                                setNewRecipeData({
                                  ...newRecipeData,
                                  ingredients: updatedIngredients,
                                });
                                setErrors({ ...errors, ingredients: "" });
                              }}
                              min="0"
                            />
                            <select
                              className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                              value={ing.unit || ""}
                              onChange={(e) => {
                                const updatedIngredients = [...newRecipeData.ingredients];
                                updatedIngredients[index].unit = e.target.value;
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
                  newRecipeData.ingredients.every((ing) => ing.quantity >= 0 && ing.unit) ? (
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
                          {(nutritionData.calories / (newRecipeData.totalServing || 1)).toFixed(2)}{" "}
                          kcal
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
                      No nutrition data available. Add ingredients with valid quantities and units
                      to see nutrition details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteDishId(null);
          setDeleteDishName("");
          setDeleteRecipeId(null);
        }}
        onConfirm={confirmDeleteRecipe}
        dishName={deleteDishName}
      />

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
    if (isAlreadyAdded) return;

    const isSelected = tempSelectedIngredients.some((item) => item._id === ingredient._id);
    if (isSelected) {
      setTempSelectedIngredients(
        tempSelectedIngredients.filter((item) => item._id !== ingredient._id)
      );
    } else {
      setTempSelectedIngredients([
        ...tempSelectedIngredients,
        { ...ingredient, quantity: 0, unit: "Unit" },
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
              className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${
                tempSelectedIngredients.length === 0 ? "opacity-50 cursor-not-allowed" : ""
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
                const isSelected = tempSelectedIngredients.some((item) => item._id === ing._id);

                return (
                  <div
                    key={ing._id}
                    className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer relative ${
                      isSelected ? "border-[#40B491] border-2" : "border-gray-200"
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
                        <h3 className="font-medium text-gray-800 truncate w-[70%]">{ing.name}</h3>
                        <span className="text-sm font-bold text-blue-600 min-w-[80px] text-right">
                          {ing.calories !== "0" ? `${ing.calories} kcal` : "0"}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Protein:</span>
                          <span className="font-medium">
                            {ing.protein || "0"} {ing.protein !== "0" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Fat:</span>
                          <span className="font-medium">
                            {ing.fat || "0"} {ing.fat !== "0" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Carbs:</span>
                          <span className="font-medium">
                            {ing.carbs || "0"} {ing.carbs !== "0" ? "g" : ""}
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
