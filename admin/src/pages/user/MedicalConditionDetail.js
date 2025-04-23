import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import medicalConditionService from "../../services/nutritionist/medicalConditionServices";
import dishesService from "../../services/nutritionist/dishesServices";
import recipesService from "../../services/nutritionist/recipesServices";
import { toast } from "react-toastify";
import { Flame, Dumbbell, Wheat, Droplet, ArrowLeft } from "lucide-react";

const MedicalConditionDetail = () => {
  const { conditionId } = useParams();
  const navigate = useNavigate();
  const [condition, setCondition] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dishes with nutrition data (optional, only if needed for other purposes)
  const fetchDishes = async () => {
    try {
      const response = await dishesService.getAllDishes(1, 1000);
      if (response?.success) {
        const dishesData = Array.isArray(response.data.items) ? response.data.items : [];
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
      } else {
        toast.error("Failed to fetch dishes: " + response?.message);
      }
    } catch (error) {
      toast.error("Error fetching dishes: " + error.message);
    }
  };

  // Fetch condition details
  const fetchConditionDetails = async () => {
    setLoading(true);
    try {
      const response = await medicalConditionService.getMedicalConditionById(conditionId);
      if (!response.success) {
        toast.error(response.message || "Failed to load condition details!");
        navigate("/medical");
        return;
      }

      const conditionData = response.data;
      // Use the recommendedFoods and restrictedFoods directly from the API response
      const recommendedFoods = conditionData.recommendedFoods || [];
      const foodsToAvoid = conditionData.restrictedFoods || conditionData.foodsToAvoid || [];

      // Optionally enrich with nutrition data from recipes if needed
      const enrichedRecommendedFoods = await Promise.all(
        recommendedFoods.map(async (food) => {
          if (food.recipeId) {
            try {
              const recipeResponse = await recipesService.getRecipeById(food._id, food.recipeId);
              if (recipeResponse.success && recipeResponse.data?.status === "success") {
                const recipe = recipeResponse.data.data;
                const nutritions = calculateNutritionFromRecipe(recipe);
                return { ...food, nutritions };
              }
            } catch (error) {
              console.error(`Error fetching recipe for dish ${food._id}:`, error);
            }
          }
          return {
            ...food,
            nutritions: food.calories
              ? {
                  calories: food.calories.toFixed(2),
                  protein: food.protein.toFixed(2),
                  carbs: food.carbs.toFixed(2),
                  fat: food.fat.toFixed(2),
                }
              : { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" },
          };
        })
      );

      const enrichedFoodsToAvoid = await Promise.all(
        foodsToAvoid.map(async (food) => {
          if (food.recipeId) {
            try {
              const recipeResponse = await recipesService.getRecipeById(food._id, food.recipeId);
              if (recipeResponse.success && recipeResponse.data?.status === "success") {
                const recipe = recipeResponse.data.data;
                const nutritions = calculateNutritionFromRecipe(recipe);
                return { ...food, nutritions };
              }
            } catch (error) {
              console.error(`Error fetching recipe for dish ${food._id}:`, error);
            }
          }
          return {
            ...food,
            nutritions: food.calories
              ? {
                  calories: food.calories.toFixed(2),
                  protein: food.protein.toFixed(2),
                  carbs: food.carbs.toFixed(2),
                  fat: food.fat.toFixed(2),
                }
              : { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" },
          };
        })
      );

      setCondition({
        ...conditionData,
        recommendedFoods: enrichedRecommendedFoods,
        foodsToAvoid: enrichedFoodsToAvoid,
      });
    } catch (error) {
      console.error("Error fetching condition details:", error);
      toast.error("Error loading Health condition details!");
      navigate("/medical");
    } finally {
      setLoading(false);
    }
  };

  const calculateNutritionFromRecipe = (recipe) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
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

  const handleFoodClick = (dish) => {
    if (dish._id && dish.recipeId) {
      navigate(`/${dish._id}/recipes/${dish.recipeId}`);
    } else {
      toast.error("Recipe details unavailable for this dish.");
    }
  };

  useEffect(() => {
    fetchConditionDetails();
    fetchDishes(); // Optional: fetch dishes if needed for other features
  }, [conditionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-gray-600">Loading condition details...</p>
      </div>
    );
  }

  if (!condition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-gray-600">Condition not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#40B491] to-[#2e8b6e] text-white py-12 px-6">
        <div className="container mx-auto">
          <button
            onClick={() => navigate("/medical")}
            className="flex items-center text-white hover:text-gray-200 transition duration-200 mb-6"
          >
            <ArrowLeft className="w-6 h-6 mr-2" /> Back to Health Conditions
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Syne'] mb-4">{condition.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto py-12 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div
            className="text-gray-700 text-lg mb-8 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: condition.description.replace(/\n/g, '<br />') }}
          />

          {/* Recommended Foods */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-green-700 mb-6">Recommended Foods</h2>
            {condition.recommendedFoods && condition.recommendedFoods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {condition.recommendedFoods.map((food, index) => (
                  <div
                    key={food._id || index}
                    className="bg-gray-50 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition duration-300 border border-gray-200"
                    onClick={() => handleFoodClick(food)}
                  >
                    <img
                      src={food.imageUrl || "https://via.placeholder.com/120"}
                      alt={food.name || "Unknown food"}
                      className="w-24 h-24 rounded-full object-cover mb-3 shadow-sm"
                    />
                    <p className="text-gray-800 text-base font-medium text-center mb-2">
                      {food.name || "Unknown food"}
                    </p>
                    {food.nutritions ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between w-full">
                          <span className="flex items-center">
                            <Flame className="w-4 h-4 mr-1" /> {food.nutritions.calories} kcal
                          </span>
                          <span className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-1" /> {food.nutritions.protein}g
                          </span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="flex items-center">
                            <Wheat className="w-4 h-4 mr-1" /> {food.nutritions.carbs}g
                          </span>
                          <span className="flex items-center">
                            <Droplet className="w-4 h-4 mr-1" /> {food.nutritions.fat}g
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No nutrition data</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">No recommended foods specified.</p>
            )}
          </div>

          {/* Restricted Foods */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-red-700 mb-6">Restricted Foods</h2>
            {condition.foodsToAvoid && condition.foodsToAvoid.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {condition.foodsToAvoid.map((food, index) => (
                  <div
                    key={food._id || index}
                    className="bg-gray-50 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition duration-300 border border-gray-200"
                    onClick={() => handleFoodClick(food)}
                  >
                    <img
                      src={food.imageUrl || "https://via.placeholder.com/120"}
                      alt={food.name || "Unknown food"}
                      className="w-24 h-24 rounded-full object-cover mb-3 shadow-sm"
                    />
                    <p className="text-gray-800 text-base font-medium text-center mb-2">
                      {food.name || "Unknown food"}
                    </p>
                    {food.nutritions ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between w-full">
                          <span className="flex items-center">
                            <Flame className="w-4 h-4 mr-1" /> {food.nutritions.calories} kcal
                          </span>
                          <span className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-1" /> {food.nutritions.protein}g
                          </span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="flex items-center">
                            <Wheat className="w-4 h-4 mr-1" /> {food.nutritions.carbs}g
                          </span>
                          <span className="flex items-center">
                            <Droplet className="w-4 h-4 mr-1" /> {food.nutritions.fat}g
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No nutrition data</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">No restricted foods specified.</p>
            )}
          </div>

          <button
            onClick={() => navigate("/medical")}
            className="mt-6 bg-[#40B491] hover:bg-[#359c7a] text-white px-8 py-3 rounded-full font-semibold transition duration-300 shadow-md"
          >
            Back to Health Conditions
          </button>
        </div>
      </section>
    </div>
  );
};

export default MedicalConditionDetail;