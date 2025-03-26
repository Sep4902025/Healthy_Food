import React, { useEffect, useState } from "react";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";
import dishService from "../../../services/nutritionist/dishesServices";
import recipesService from "../../../services/nutritionist/recipesServices";
import {
  HeartPulse,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FoodSelectionModal from "./FoodSelectionModal";

const AddMedicalCondition = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    restrictedFoods: [],
    recommendedFoods: [],
    nutritionalConstraints: {
      carbs: "",
      fat: "",
      protein: "",
      calories: "",
    },
  });
  const [dishes, setDishes] = useState([]);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodModalType, setFoodModalType] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all dishes when component mounts
  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      const dishesResponse = await dishService.getAllDishes(1, 1000); // Lấy tất cả dishes
      const dishesData =
        dishesResponse?.success && Array.isArray(dishesResponse.data.items)
          ? dishesResponse.data.items
          : [];

      // Fetch nutritional data for each dish with a recipe
      const enrichedDishes = await Promise.all(
        dishesData.map(async (dish) => {
          if (dish.recipeId) {
            try {
              const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
              if (recipeResponse.success && recipeResponse.data?.status === "success") {
                const recipe = recipeResponse.data.data;
                const nutritions = calculateNutritionFromRecipe(recipe);
                return { ...dish, nutritions };
              }
            } catch (error) {
              console.error(`Error fetching recipe for dish ${dish._id}:`, error);
            }
          }
          return {
            ...dish,
            nutritions: { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" },
          };
        })
      );

      setDishes(enrichedDishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setDishes([]);
    }
    setIsLoading(false);
  };

  // Function to calculate nutritional data from recipe ingredients
  const calculateNutritionFromRecipe = (recipe) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing) => {
        const ingredient = ing.ingredientId;
        if (ingredient && ing.quantity && ing.unit) {
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
          totalCalories += (ingredient.calories || 0) * conversionFactor;
          totalProtein += (ingredient.protein || 0) * conversionFactor;
          totalFat += (ingredient.fat || 0) * conversionFactor;
          totalCarbs += (ingredient.carbs || 0) * conversionFactor;
        }
      });
    }

    return {
      calories: totalCalories.toFixed(2),
      protein: totalProtein.toFixed(2),
      carbs: totalCarbs.toFixed(2),
      fat: totalFat.toFixed(2),
    };
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.nutritionalConstraints) {
      setFormData({
        ...formData,
        nutritionalConstraints: {
          ...formData.nutritionalConstraints,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.restrictedFoods.some((food) => formData.recommendedFoods.includes(food))) {
      newErrors.foodConflict = "A dish cannot be both restricted and recommended!";
    }
    ["carbs", "fat", "protein", "calories"].forEach((field) => {
      const value = formData.nutritionalConstraints[field];
      if (value && (isNaN(value) || Number(value) < 0)) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } must be a positive number`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill in all required fields correctly!");
      return;
    }

    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      restrictedFoods: formData.restrictedFoods,
      recommendedFoods: formData.recommendedFoods,
      nutritionalConstraints: {
        carbs: formData.nutritionalConstraints.carbs
          ? Number(formData.nutritionalConstraints.carbs)
          : null,
        fat: formData.nutritionalConstraints.fat
          ? Number(formData.nutritionalConstraints.fat)
          : null,
        protein: formData.nutritionalConstraints.protein
          ? Number(formData.nutritionalConstraints.protein)
          : null,
        calories: formData.nutritionalConstraints.calories
          ? Number(formData.nutritionalConstraints.calories)
          : null,
      },
    };

    try {
      const response = await medicalConditionService.createMedicalCondition(dataToSubmit);
      if (response.success) {
        alert(`Medical condition "${formData.name}" has been created successfully!`);
        setFormData({
          name: "",
          description: "",
          restrictedFoods: [],
          recommendedFoods: [],
          nutritionalConstraints: { carbs: "", fat: "", protein: "", calories: "" },
        });
        setErrors({});
      } else {
        alert("Failed to create medical condition: " + response.message);
      }
    } catch (error) {
      console.error("Error creating medical condition:", error);
      alert("An error occurred while creating the medical condition.");
    }
  };

  // Open food selection modal
  const handleOpenFoodModal = (type) => {
    setFoodModalType(type);
    setIsFoodModalOpen(true);
  };

  // Handle dish selection from modal
  const handleFoodSelect = (selectedDishes) => {
    if (foodModalType === "restricted") {
      setFormData({ ...formData, restrictedFoods: selectedDishes });
    } else if (foodModalType === "recommended") {
      setFormData({ ...formData, recommendedFoods: selectedDishes });
    }
    setIsFoodModalOpen(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create New Medical Condition</h2>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter condition name"
                  className={`w-full border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className={`w-full border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restricted Foods
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.restrictedFoods.map((foodId) => {
                    const dish = dishes.find((d) => d._id === foodId);
                    return dish ? (
                      <div
                        key={foodId}
                        className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {dish.name}
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              restrictedFoods: formData.restrictedFoods.filter(
                                (id) => id !== foodId
                              ),
                            })
                          }
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("restricted")}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 w-full"
                >
                  Add Restricted Foods
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommended Foods
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.recommendedFoods.map((foodId) => {
                    const dish = dishes.find((d) => d._id === foodId);
                    return dish ? (
                      <div
                        key={foodId}
                        className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {dish.name}
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              recommendedFoods: formData.recommendedFoods.filter(
                                (id) => id !== foodId
                              ),
                            })
                          }
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("recommended")}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 w-full"
                >
                  Add Recommended Foods
                </button>
                {errors.foodConflict && (
                  <p className="text-red-500 text-sm mt-1">{errors.foodConflict}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nutritional Constraints (Max Values)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Calories (kcal)</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.nutritionalConstraints.calories}
                      onChange={handleChange}
                      placeholder="Max calories"
                      className={`w-full border ${
                        errors.calories ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                    {errors.calories && (
                      <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Protein (g)</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.nutritionalConstraints.protein}
                      onChange={handleChange}
                      placeholder="Max protein"
                      className={`w-full border ${
                        errors.protein ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                    {errors.protein && (
                      <p className="text-red-500 text-sm mt-1">{errors.protein}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Carbs (g)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.nutritionalConstraints.carbs}
                      onChange={handleChange}
                      placeholder="Max carbs"
                      className={`w-full border ${
                        errors.carbs ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                    {errors.carbs && <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.nutritionalConstraints.fat}
                      onChange={handleChange}
                      placeholder="Max fat"
                      className={`w-full border ${
                        errors.fat ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                    {errors.fat && <p className="text-red-500 text-sm mt-1">{errors.fat}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Create Medical Condition
            </button>
          </div>
        </form>
      )}

      {/* Food Selection Modal */}
      {isFoodModalOpen && (
        <FoodSelectionModal
          isOpen={isFoodModalOpen}
          onClose={() => setIsFoodModalOpen(false)}
          onSelect={handleFoodSelect}
          availableDishes={dishes}
          selectedDishes={
            foodModalType === "restricted" ? formData.restrictedFoods : formData.recommendedFoods
          }
          conflictingDishes={
            foodModalType === "restricted" ? formData.recommendedFoods : formData.restrictedFoods
          }
        />
      )}
    </div>
  );
};

export default AddMedicalCondition;
