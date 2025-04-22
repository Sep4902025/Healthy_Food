import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import mealPlanService from "../../../services/mealPlanServices";
import dishService from "../../../services/nutritionist/dishesServices";
import Meals from "./Meals";

const NutritionAdviceModal = ({ isOpen, onClose, nutritionData, nutritionTargets }) => {
  if (!isOpen || !nutritionData || !nutritionTargets) return null;

  // Calculate differences
  const proteinDiff = nutritionData.protein - nutritionTargets.protein.target;
  const carbsDiff = nutritionData.carbs - nutritionTargets.carbs.target;
  const fatDiff = nutritionData.fat - nutritionTargets.fat.target;
  const caloriesDiff = nutritionData.calories - nutritionTargets.calories.target;

  // Generate advice based on differences
  const generateAdvice = () => {
    const advice = [];

    if (caloriesDiff < 0) {
      advice.push(`Increase by ${Math.abs(Math.round(caloriesDiff))} kcal to meet your goal.`);
    } else if (caloriesDiff > 0) {
      advice.push(`Reduce by ${Math.round(caloriesDiff)} kcal to align with your goal.`);
    }

    if (proteinDiff < -5) {
      advice.push(
        `Add ${Math.abs(
          Math.round(proteinDiff)
        )}g of protein from foods like lean meat, eggs, or tofu.`
      );
    } else if (proteinDiff > 15) {
      advice.push(`Reduce by ${Math.round(proteinDiff)}g of protein to align with your goal.`);
    }

    if (carbsDiff < -10) {
      advice.push(
        `Add ${Math.abs(
          Math.round(carbsDiff)
        )}g of carbs from brown rice, sweet potatoes, or whole grains.`
      );
    } else if (carbsDiff > 15) {
      advice.push(`Reduce by ${Math.round(carbsDiff)}g of carbs to align with your goal.`);
    }

    if (fatDiff < -5) {
      advice.push(
        `Add ${Math.abs(Math.round(fatDiff))}g of healthy fats from avocados, olive oil, or nuts.`
      );
    } else if (fatDiff > 10) {
      advice.push(`Reduce by ${Math.round(fatDiff)}g of fat to align with your goal.`);
    }

    return advice.length > 0
      ? advice
      : ["Your nutrition levels are well-balanced with your goals!"];
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4 text-custom-green">Nutrition Advice</h3>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Calories:</span>
            <span>
              {Math.round(nutritionData.calories)} / {nutritionTargets.calories.target} kcal
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                nutritionData.calories < nutritionTargets.calories.min
                  ? "bg-yellow-500"
                  : nutritionData.calories > nutritionTargets.calories.max
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (nutritionData.calories / nutritionTargets.calories.target) * 100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Protein:</span>
            <span>
              {Math.round(nutritionData.protein)} / {nutritionTargets.protein.target}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                nutritionData.protein < nutritionTargets.protein.min
                  ? "bg-yellow-500"
                  : nutritionData.protein > nutritionTargets.protein.max
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (nutritionData.protein / nutritionTargets.protein.target) * 100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Carbs:</span>
            <span>
              {Math.round(nutritionData.carbs)} / {nutritionTargets.carbs.target}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                nutritionData.carbs < nutritionTargets.carbs.min
                  ? "bg-yellow-500"
                  : nutritionData.carbs > nutritionTargets.carbs.max
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (nutritionData.carbs / nutritionTargets.carbs.target) * 100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Fat:</span>
            <span>
              {Math.round(nutritionData.fat)} / {nutritionTargets.fat.target}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                nutritionData.fat < nutritionTargets.fat.min
                  ? "bg-yellow-500"
                  : nutritionData.fat > nutritionTargets.fat.max
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(100, (nutritionData.fat / nutritionTargets.fat.target) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2">Suggestions:</h4>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {generateAdvice().map((advice, index) => (
              <li key={index}>{advice}</li>
            ))}
          </ul>
        </div>

        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const MealDays = ({ mealPlanId, nutritionTargets }) => {
  const [mealDays, setMealDays] = useState([]);
  const [mealDayNutrition, setMealDayNutrition] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealDay, setSelectedMealDay] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNutritionAdvice, setShowNutritionAdvice] = useState(false);
  const [selectedDayNutrition, setSelectedDayNutrition] = useState(null);
  const firstLoad = useRef(true);
  const mealDaysRef = useRef([]);

  const fetchMealDays = async () => {
    if (!mealPlanId) return;

    if (!firstLoad.current) {
      if (mealDays.length === 0) {
        setLoading(true);
      }
    }

    setError(null);
    try {
      const data = await mealPlanService.getMealDaysByMealPlan(mealPlanId);
      if (data.success) {
        const newData =
          JSON.stringify(mealDaysRef.current) !== JSON.stringify(data.data)
            ? data.data
            : mealDaysRef.current;
        setMealDays(newData);
        mealDaysRef.current = newData;

        // Fetch nutrition data for each meal day
        fetchAllMealDaysNutrition(newData);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
      firstLoad.current = false;
    }
  };

  // Fetch nutrition data for all meal days
  const fetchAllMealDaysNutrition = async (days) => {
    const nutritionData = {};

    for (const mealDay of days) {
      try {
        const mealsResponse = await mealPlanService.getMealsByMealDay(mealPlanId, mealDay._id);
        if (mealsResponse.success) {
          // Calculate total nutrition for this meal day
          let totalCalories = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;

          // Iterate through each meal in the day
          for (const meal of mealsResponse.data) {
            if (meal.dishes && meal.dishes.length > 0) {
              // Iterate through each dish in the meal
              for (const dish of meal.dishes) {
                // Get calories from the response data
                totalCalories += Number(dish.calories || 0);

                try {
                  // Call API to get detailed dish information
                  const dishResponse = await dishService.getDishById(dish.dishId);
                  if (dishResponse.success) {
                    const dishDetails = dishResponse.data;
                    // Get nutrition info from API
                    totalProtein += Number(dishDetails.protein || 0);
                    totalCarbs += Number(dishDetails.carbs || 0);
                    totalFat += Number(dishDetails.fat || 0);
                  }
                } catch (dishErr) {
                  console.error(`Error fetching dish info for ${dish.dishId}:`, dishErr);
                }
              }
            }
          }

          nutritionData[mealDay._id] = {
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
          };
        }
      } catch (err) {
        console.error(`Error fetching nutrition data for day ${mealDay._id}:`, err);
      }
    }

    setMealDayNutrition(nutritionData);
  };

  useEffect(() => {
    fetchMealDays();
    setSelectedMealDay(null);
  }, [mealPlanId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Evaluate nutrition status against targets
  const evaluateNutritionStatus = (nutrition) => {
    if (!nutrition || !nutritionTargets) return "neutral";

    const { calories, protein, carbs, fat } = nutrition;
    const caloriesInRange =
      calories >= nutritionTargets.calories.min && calories <= nutritionTargets.calories.max;
    const proteinInRange =
      protein >= nutritionTargets.protein.min && protein <= nutritionTargets.protein.max;
    const carbsInRange = carbs >= nutritionTargets.carbs.min && carbs <= nutritionTargets.carbs.max;
    const fatInRange = fat >= nutritionTargets.fat.min && fat <= nutritionTargets.fat.max;

    // If any are too high, it's red
    if (
      calories > nutritionTargets.calories.max ||
      protein > nutritionTargets.protein.max ||
      carbs > nutritionTargets.carbs.max ||
      fat > nutritionTargets.fat.max
    ) {
      return "exceeded";
    }

    // If all in range, it's green
    if (caloriesInRange && proteinInRange && carbsInRange && fatInRange) {
      return "optimal";
    }

    // Otherwise, it's yellow (something is too low)
    return "insufficient";
  };

  // Get border color based on nutrition status
  const getNutritionStatusColor = (mealDayId) => {
    const nutrition = mealDayNutrition[mealDayId];
    if (!nutrition || !nutritionTargets) return "border-gray-200";

    const status = evaluateNutritionStatus(nutrition);

    switch (status) {
      case "exceeded":
        return "border-red-500";
      case "optimal":
        return "border-green-500";
      case "insufficient":
        return "border-yellow-500";
      default:
        return "border-gray-200";
    }
  };

  // Handle day selection with transition effect
  const handleMealDaySelect = (mealDay) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMealDay(mealDay);
      setIsTransitioning(false);
    }, 150);
  };

  // Handle closing Meals with transition effect
  const handleMealsClose = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMealDay(null);
      setIsTransitioning(false);
      // Refresh nutrition data when closing meals view
      fetchMealDays();
    }, 150);
  };

  // Open nutrition advice modal
  const handleOpenNutritionAdvice = (mealDayId) => {
    setSelectedDayNutrition(mealDayNutrition[mealDayId]);
    setShowNutritionAdvice(true);
  };

  // Render nutrition circular chart using Recharts
  const renderNutritionChart = (mealDayId) => {
    const nutrition = mealDayNutrition[mealDayId];
    if (!nutrition) return null;

    const { calories, protein, carbs, fat } = nutrition;

    // Skip chart if all values are 0
    if (protein === 0 && carbs === 0 && fat === 0) {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="text-lg font-bold">{Math.round(calories)}</div>
          <div className="text-xs text-gray-500">kcal</div>
        </div>
      );
    }

    // Data for pie chart
    const nutritionData = [
      { name: "Protein", value: protein, color: "#ef4444" }, // Red
      { name: "Carbs", value: carbs, color: "#3b82f6" }, // Blue
      { name: "Fat", value: fat, color: "#facc15" }, // Yellow
    ].filter((item) => item.value > 0);

    return (
      <div className="flex flex-col items-center relative">
        <div className="w-20 h-20 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nutritionData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={35}
                paddingAngle={2}
                dataKey="value"
              >
                {nutritionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Calories in the center of the circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{Math.round(calories)}</div>
              <div className="text-xs text-gray-500">kcal</div>
            </div>
          </div>
        </div>

        <div className="flex text-xs mt-1 space-x-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-400 mr-1"></div>
            <span>Protein {Math.round(protein)}g</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 mr-1"></div>
            <span>Carbs {Math.round(carbs)}g</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 mr-1"></div>
            <span>Fat {Math.round(fat)}g</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg w-full relative">
      {/* Fixed height container */}
      <div className="h-[500px] relative">
        {loading && mealDays.length === 0 ? (
          <p className="text-center text-gray-500 absolute inset-0 flex items-center justify-center">
            Loading meal days...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 absolute inset-0 flex items-center justify-center">
            {error}
          </p>
        ) : (
          <>
            {/* Use fade effect for transition between sections */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isTransitioning ? "opacity-0" : "opacity-100"
              } h-full`}
            >
              {!selectedMealDay ? (
                <div className="h-[490px] overflow-y-auto p-4 border border-gray-200 rounded-lg">
                  {mealDays.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mealDays.map((mealDay, index) => {
                        const borderColorClass = getNutritionStatusColor(mealDay._id);
                        const nutrition = mealDayNutrition[mealDay._id];
                        const nutritionStatus = nutrition
                          ? evaluateNutritionStatus(nutrition)
                          : "neutral";

                        let statusIcon = null;
                        if (nutrition) {
                          switch (nutritionStatus) {
                            case "exceeded":
                              statusIcon = (
                                <span title="Exceeded target" className="text-red-500">
                                  ❗
                                </span>
                              );
                              break;
                            case "optimal":
                              statusIcon = (
                                <span title="Target met" className="text-green-500">
                                  ✅
                                </span>
                              );
                              break;
                            case "insufficient":
                              statusIcon = (
                                <span title="Below target" className="text-yellow-500">
                                  ⚠️
                                </span>
                              );
                              break;
                          }
                        }

                        return (
                          <div
                            key={mealDay._id}
                            className={`border-2 ${borderColorClass} rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm`}
                            onClick={() => handleMealDaySelect(mealDay)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold">
                                Day {index + 1} {statusIcon}
                              </h3>
                              {nutrition && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenNutritionAdvice(mealDay._id);
                                  }}
                                  className="text-sm px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                >
                                  Suggest
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{formatDate(mealDay.date)}</p>

                            {/* Nutrition Chart */}
                            <div className="mb-4">{renderNutritionChart(mealDay._id)}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-10">
                      No meal days have been set for this plan.
                    </p>
                  )}
                </div>
              ) : (
                <div className="h-full">
                  <Meals
                    mealPlanId={mealPlanId}
                    mealDayId={selectedMealDay._id}
                    onBack={handleMealsClose}
                    onNutritionChange={() => fetchAllMealDaysNutrition(mealDays)}
                    date={formatDate(selectedMealDay.date)} // Pass the formatted date
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Nutrition advice modal */}
      <NutritionAdviceModal
        isOpen={showNutritionAdvice}
        onClose={() => setShowNutritionAdvice(false)}
        nutritionData={selectedDayNutrition}
        nutritionTargets={nutritionTargets}
      />
    </div>
  );
};

export default MealDays;
