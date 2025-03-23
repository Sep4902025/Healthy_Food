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
  Pencil,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Trash2,
} from "lucide-react";

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
  const [availableIngredients, setAvailableIngredients] = useState([]);
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesResponse, ingredientsResponse] = await Promise.all([
          dishService.getAllDishes(),
          ingredientService.getAllIngredients(),
        ]);
        setDishes(dishesResponse?.success && Array.isArray(dishesResponse.data) ? dishesResponse.data : []);
        setAvailableIngredients(ingredientsResponse?.success && Array.isArray(ingredientsResponse.data) ? ingredientsResponse.data : []);
      } catch (error) {
        setDishes([]);
        setAvailableIngredients([]);
      }
    };
    fetchData();
  }, []);

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
        const dishesResponse = await dishService.getAllDishes();
        if (dishesResponse?.success && Array.isArray(dishesResponse.data)) {
          setDishes(dishesResponse.data);
        }
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
        const dishesResponse = await dishService.getAllDishes();
        if (dishesResponse?.success && Array.isArray(dishesResponse.data)) {
          setDishes(dishesResponse.data);
        }
        setIsAddRecipeModalOpen(false);
      } else {
        alert("Failed to delete recipe: " + response.message);
      }
    } catch (error) {
      alert("An error occurred while deleting: " + (error.message || "Unspecified error"));
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesType = filterType === "all" || dish.type === filterType;
    const matchesSearch = searchTerm ? dish?.name?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesType && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">List of Dishes</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(filterType === type ? "all" : type);
                setCurrentPage(1);
              }}
              className={`px-2 py-1 text-sm font-medium rounded-full whitespace-nowrap transition duration-200 ${
                filterType === type
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
          <button
            onClick={() => {
              setFilterType("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
              filterType === "all"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by dish name"
            className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {currentDishes?.length > 0 ? (
            currentDishes.map((dish) => (
              <div key={dish._id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <img
                  src={dish.imageUrl || "https://via.placeholder.com/300"}
                  alt={dish.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-center">{dish.name}</h3>
                  <div className="flex justify-center items-center text-sm text-gray-600 mt-2">
                    <span className="mr-3 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {dish.cookingTime || "N/A"} mins
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {dish.totalServing || "N/A"} servings
                    </span>
                  </div>
                  <div className="flex justify-center items-center text-sm text-gray-600 mt-1">
                    <span className="mr-3 flex items-center">
                      <Flame className="w-4 h-4 mr-1" />
                      {dish.calories || "N/A"} kcal
                    </span>
                    <span className="flex items-center">
                      <Dumbbell className="w-4 h-4 mr-1" />
                      {dish.protein || "N/A"}g Protein
                    </span>
                  </div>
                  <div className="flex justify-center items-center text-sm text-gray-600 mt-1">
                    <span className="mr-3 flex items-center">
                      <Wheat className="w-4 h-4 mr-1" />
                      {dish.carbs || "N/A"}g Carbs
                    </span>
                    <span className="flex items-center">
                      <Droplet className="w-4 h-4 mr-1" />
                      {dish.fat || "N/A"}g Fat
                    </span>
                  </div>
                </div>
                <div className="flex justify-center items-center p-2 bg-gray-100 border-t border-gray-200 space-x-4">
                  <button
                    onClick={() => handleAddRecipeClick(dish)}
                    className="text-blue-500 flex items-center px-2 py-1 hover:text-blue-700"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit Recipe
                  </button>
                  {dish.recipeId && (
                    <button
                      onClick={() => handleDeleteRecipe(dish)}
                      className="text-red-500 flex items-center px-2 py-1 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Recipe
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500">
              <Utensils className="w-24 h-24 text-gray-400 mb-4" />
              <p className="text-lg font-semibold">No dishes</p>
              <p className="text-sm">Looks like you haven't added any dishes yet.</p>
            </div>
          )}
        </div>
      </div>
      {filteredDishes?.length > 0 && (
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              className="border rounded px-2 py-1"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="4">4 dishes</option>
              <option value="8">8 dishes</option>
              <option value="12">12 dishes</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from(
              { length: Math.ceil(filteredDishes.length / itemsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"
                  }`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              )
            )}
            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredDishes.length / itemsPerPage)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {isAddRecipeModalOpen && selectedDish && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-green-700">
                {selectedDish.recipeId ? "Edit Recipe" : "Add Recipe"}: {selectedDish.name}
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-200"
                  onClick={handleSaveRecipe}
                >
                  Save Recipe
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => {
                    setIsAddRecipeModalOpen(false);
                    setErrors({});
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <img
                    src={selectedDish.imageUrl || "https://via.placeholder.com/200"}
                    alt={selectedDish.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter recipe title"
                    value={selectedDish.name || ""}
                    readOnly
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Time (minutes) *</label>
                    <input
                      type="number"
                      className={`w-full border ${errors.cookingTime ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
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
                    {errors.cookingTime && <p className="text-red-500 text-sm mt-1">{errors.cookingTime}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serving Size *</label>
                    <input
                      type="number"
                      className={`w-full border ${errors.totalServing ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
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
                    {errors.totalServing && <p className="text-red-500 text-sm mt-1">{errors.totalServing}</p>}
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Directions</h3>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
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
                              setNewRecipeData({ ...newRecipeData, instruction: updatedInstructions });
                              setErrors({ ...errors, instruction: updatedInstructions.length === 0 ? "Please add at least one Instruction step!" : "" });
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
                  {errors.instruction && <p className="text-red-500 text-sm mt-1">{errors.instruction}</p>}
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newInstructionStep}
                    onChange={(e) => setNewInstructionStep(e.target.value)}
                    placeholder="Enter direction"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Ingredients</h3>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
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
                              className="w-16 border border-gray-300 rounded-md px-2 py-1"
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
                                setNewRecipeData({ ...newRecipeData, ingredients: updatedIngredients });
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
                              className="border border-gray-300 rounded-md px-2 py-1"
                              value={ing.unit || ""}
                              onChange={(e) => {
                                const updatedIngredients = [...newRecipeData.ingredients];
                                updatedIngredients[index].unit = e.target.value;
                                const maxValue = e.target.value === "g" || e.target.value === "ml" ? 10000 : 100;
                                if (updatedIngredients[index].quantity > maxValue) {
                                  updatedIngredients[index].quantity = maxValue;
                                }
                                setNewRecipeData({ ...newRecipeData, ingredients: updatedIngredients });
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
                                const updatedIngredients = newRecipeData.ingredients.filter((_, i) => i !== index);
                                setNewRecipeData({ ...newRecipeData, ingredients: updatedIngredients });
                                setErrors({ ...errors, ingredients: updatedIngredients.length === 0 ? "Please add at least one Ingredient!" : "" });
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
                  {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients}</p>}
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Nutrition</h3>
                  {newRecipeData.ingredients.length > 0 && newRecipeData.ingredients.every(ing => ing.quantity && ing.unit) ? (
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
                    <p className="text-gray-500">No nutrition data available. Add ingredients with quantities and units to see nutrition details.</p>
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

const IngredientSelectionModal = ({ isOpen, onClose, onSelect, availableIngredients, typeOptions, selectedIngredients }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [tempSelectedIngredients, setTempSelectedIngredients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const filteredIngredients = availableIngredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || ing.type === filterType;
    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIngredients = filteredIngredients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCheckboxChange = (ingredient) => {
    const isSelected = tempSelectedIngredients.some((item) => item._id === ingredient._id);
    if (isSelected) {
      setTempSelectedIngredients(tempSelectedIngredients.filter((item) => item._id !== ingredient._id));
    } else {
      setTempSelectedIngredients([...tempSelectedIngredients, { ...ingredient, quantity: "", unit: "" }]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelectedIngredients);
    setTempSelectedIngredients([]);
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select Ingredients</h2>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by ingredient name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentIngredients.length > 0 ? (
            currentIngredients.map((ing) => {
              const isAlreadyAdded = selectedIngredients.some((selected) => selected._id === ing._id);
              return (
                <div
                  key={ing._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                >
                  <img
                    src={ing.imageUrl || "https://via.placeholder.com/300"}
                    alt={ing.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center">{ing.name}</h3>
                    <div className="text-sm text-gray-600 mt-2 text-center">
                      <div className="flex justify-center items-center">
                        <span className="mr-3 flex items-center">
                          <Flame className="w-4 h-4 mr-1" />
                          {ing.calories || "N/A"} Kcal
                        </span>
                        <span className="flex items-center">
                          <Dumbbell className="w-4 h-4 mr-1" />
                          {ing.protein || "N/A"}g Protein
                        </span>
                      </div>
                      <div className="flex justify-center items-center mt-1">
                        <span className="mr-3 flex items-center">
                          <Wheat className="w-4 h-4 mr-1" />
                          {ing.carbs || "N/A"}g Carbs
                        </span>
                        <span className="flex items-center">
                          <Droplet className="w-4 h-4 mr-1" />
                          {ing.fat || "N/A"}g Fat
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center p-2 bg-gray-100 border-t border-gray-200">
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
        {filteredIngredients.length > 0 && (
          <div className="p-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from(
                { length: Math.ceil(filteredIngredients.length / itemsPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-green-500 text-white"
                        : "border hover:bg-gray-100"
                    }`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                )
              )}
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredIngredients.length / itemsPerPage)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            onClick={handleConfirm}
          >
            Confirm
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableRecipes;