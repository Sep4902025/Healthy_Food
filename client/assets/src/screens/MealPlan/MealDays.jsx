import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Modal,
} from "react-native";
import Meals from "./Meals";
import { Dimensions } from "react-native";
import mealPlanService from "../../services/mealPlanService";
import dishesService from "../../services/dishService";
import CustomPieChart from "./CustomPieChart"; // Import CustomPieChart

const screenWidth = Dimensions.get("window").width;

const NutritionAdviceModal = ({ isOpen, onClose, nutritionData, nutritionTargets }) => {
  if (!isOpen || !nutritionData || !nutritionTargets) return null;

  const proteinDiff = nutritionData.protein - nutritionTargets.protein.target;
  const carbsDiff = nutritionData.carbs - nutritionTargets.carbs.target;
  const fatDiff = nutritionData.fat - nutritionTargets.fat.target;
  const caloriesDiff = nutritionData.calories - nutritionTargets.calories.target;

  const generateAdvice = () => {
    const advice = [];
    if (caloriesDiff < 0)
      advice.push(`Increase by ${Math.abs(Math.round(caloriesDiff))} kcal to meet your goal.`);
    else if (caloriesDiff > 0)
      advice.push(`Reduce by ${Math.round(caloriesDiff)} kcal to align with your goal.`);
    if (proteinDiff < -5)
      advice.push(`Add ${Math.abs(Math.round(proteinDiff))}g of protein (lean meat, eggs, tofu).`);
    else if (proteinDiff > 15)
      advice.push(`Reduce by ${Math.round(proteinDiff)}g of protein to align with your goal.`);
    if (carbsDiff < -10)
      advice.push(`Add ${Math.abs(Math.round(carbsDiff))}g of carbs (brown rice, sweet potatoes).`);
    else if (carbsDiff > 15)
      advice.push(`Reduce by ${Math.round(carbsDiff)}g of carbs to align with your goal.`);
    if (fatDiff < -5)
      advice.push(`Add ${Math.abs(Math.round(fatDiff))}g of fats (avocados, olive oil, nuts).`);
    else if (fatDiff > 10)
      advice.push(`Reduce by ${Math.round(fatDiff)}g of fat to align with your goal.`);

    return advice.length > 0 ? advice : ["Your nutrition levels are well-balanced!"];
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 justify-center bg-black/50">
        <View className="bg-white p-4 m-4 rounded-lg">
          <Text className="text-xl font-bold mb-4">Nutrition Advice</Text>
          {["calories", "protein", "carbs", "fat"].map((nutrient) => (
            <View key={nutrient} className="mb-4">
              <Text className="font-medium">
                {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}:
              </Text>
              <Text>
                {Math.round(nutritionData[nutrient])} / {nutritionTargets[nutrient].target}
                {nutrient === "calories" ? " kcal" : "g"}
              </Text>
              <View className="w-full h-1 bg-gray-200 rounded">
                <View
                  className="h-1 rounded"
                  style={{
                    width: `${Math.min(
                      100,
                      (nutritionData[nutrient] / nutritionTargets[nutrient].target) * 100
                    )}%`,
                    backgroundColor:
                      nutritionData[nutrient] < nutritionTargets[nutrient].min
                        ? "#eab308"
                        : nutritionData[nutrient] > nutritionTargets[nutrient].max
                        ? "#ef4444"
                        : "#16a34a",
                  }}
                />
              </View>
            </View>
          ))}
          <Text className="font-medium mb-2">Suggestions:</Text>
          {generateAdvice().map((advice, index) => (
            <Text key={index} className="text-sm text-gray-700">
              • {advice}
            </Text>
          ))}
          <TouchableOpacity
            className="bg-blue-600 p-2 rounded-lg items-center mt-4"
            onPress={onClose}
          >
            <Text className="text-white">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MealDays = ({ mealPlanId, nutritionTargets }) => {
  const [mealDays, setMealDays] = useState([]);
  const [mealDayNutrition, setMealDayNutrition] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealDay, setSelectedMealDay] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showNutritionAdvice, setShowNutritionAdvice] = useState(false);
  const [selectedDayNutrition, setSelectedDayNutrition] = useState(null);
  const firstLoad = useRef(true);

<<<<<<< HEAD
  console.log("MealPlanId:", mealPlanId); // Debug mealPlanId
  console.log("MealDays State:", mealDays); // Debug mealDays state

=======
>>>>>>> 168395b (App v3)
  const fetchMealDays = async () => {
    if (!mealPlanId) {
      console.log("No mealPlanId provided, skipping fetch.");
      setLoading(false);
      return;
    }

    if (!firstLoad.current && mealDays.length === 0) setLoading(true);

    try {
      console.log("Fetching meal days for mealPlanId:", mealPlanId);
      const data = await mealPlanService.getMealDaysByMealPlan(mealPlanId);
      console.log("API Response:", data); // Debug API response

      if (data.success) {
        // Ensure data.data is an array
        const mealDaysData = Array.isArray(data.data) ? data.data : [];
        setMealDays(mealDaysData);
<<<<<<< HEAD
        console.log("Set mealDays:", mealDaysData);
=======
>>>>>>> 168395b (App v3)
        fetchAllMealDaysNutrition(mealDaysData);
      } else {
        console.log("API Error:", data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error("Error fetching meal days:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      firstLoad.current = false;
    }
  };

  const fetchAllMealDaysNutrition = async (days) => {
    const nutritionData = {};
    for (const mealDay of days) {
      const mealsResponse = await mealPlanService.getMealsByMealDay(mealPlanId, mealDay._id);
      if (mealsResponse.success) {
        let totalCalories = 0,
          totalProtein = 0,
          totalCarbs = 0,
          totalFat = 0;
        for (const meal of mealsResponse.data) {
          if (meal.dishes) {
            for (const dish of meal.dishes) {
              totalCalories += Number(dish.calories || 0);
              const dishResponse = await dishesService.getDishById(dish.dishId);
              if (dishResponse.success) {
                totalProtein += Number(dishResponse.data.protein || 0);
                totalCarbs += Number(dishResponse.data.carbs || 0);
                totalFat += Number(dishResponse.data.fat || 0);
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
    }
    setMealDayNutrition(nutritionData);
  };

  useEffect(() => {
    fetchMealDays();
  }, [mealPlanId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const evaluateNutritionStatus = (nutrition) => {
    if (!nutrition || !nutritionTargets) return "neutral";
    const { calories, protein, carbs, fat } = nutrition;
    const allInRange =
      calories >= nutritionTargets.calories.min &&
      calories <= nutritionTargets.calories.max &&
      protein >= nutritionTargets.protein.min &&
      protein <= nutritionTargets.protein.max &&
      carbs >= nutritionTargets.carbs.min &&
      carbs <= nutritionTargets.carbs.max &&
      fat >= nutritionTargets.fat.min &&
      fat <= nutritionTargets.fat.max;

    if (
      calories > nutritionTargets.calories.max ||
      protein > nutritionTargets.protein.max ||
      carbs > nutritionTargets.carbs.max ||
      fat > nutritionTargets.fat.max
    )
      return "exceeded";
    return allInRange ? "optimal" : "insufficient";
  };

  const getNutritionStatusColor = (mealDayId) => {
    const nutrition = mealDayNutrition[mealDayId];
    if (!nutrition || !nutritionTargets) return "#e5e7eb";
    const status = evaluateNutritionStatus(nutrition);
    return status === "exceeded" ? "#ef4444" : status === "optimal" ? "#16a34a" : "#eab308";
  };

  const handleMealDaySelect = (mealDay) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setSelectedMealDay(mealDay);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const handleMealsClose = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setSelectedMealDay(null);
      fetchMealDays();
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const renderNutritionChart = (mealDayId) => {
    const nutrition = mealDayNutrition[mealDayId];
    if (!nutrition) return null;

    const chartData = [
      { x: "Protein", y: nutrition.protein, color: "#ef4444" },
      { x: "Carbs", y: nutrition.carbs, color: "#3b82f6" },
      { x: "Fat", y: nutrition.fat, color: "#facc15" },
    ].filter((item) => item.y > 0);

    return (
      <View className="items-center">
        <View className="relative flex items-center justify-center">
          <CustomPieChart
            data={chartData}
            width={80}
            height={80}
            innerRadius={20}
            outerRadius={30}
          />
          <View className="absolute flex items-center justify-center">
            <Text className="text-sm font-bold">{Math.round(nutrition.calories)}</Text>
            <Text className="text-xs text-gray-500">kcal</Text>
          </View>
        </View>
        <View className="flex-row flex-wrap justify-center mt-1">
          <View className="flex-row items-center gap-1 mr-1">
            <View className="w-2 h-2 rounded-full bg-red-500" />
            <Text className="text-xs">Protein: {Math.round(nutrition.protein)}g</Text>
          </View>
          <View className="flex-row items-center gap-1 mr-1">
            <View className="w-2 h-2 rounded-full bg-blue-500" />
            <Text className="text-xs">Carbs: {Math.round(nutrition.carbs)}g</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-yellow-400" />
            <Text className="text-xs">Fat: {Math.round(nutrition.fat)}g</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const borderColor = getNutritionStatusColor(item._id);
    return (
      <TouchableOpacity
        className="flex-1 m-2 p-4 border-2 rounded-lg bg-white shadow-md"
        style={{ borderColor }}
        onPress={() => handleMealDaySelect(item)}
      >
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg font-bold">Day {index + 1}</Text>
          {mealDayNutrition[item._id] && (
            <TouchableOpacity
              className="bg-blue-100 p-1 rounded"
              onPress={() => {
                setSelectedDayNutrition(mealDayNutrition[item._id]);
                setShowNutritionAdvice(true);
              }}
            >
              <Text className="text-blue-600 text-xs">Suggest</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-xs text-gray-600 mb-2">{formatDate(item.date)}</Text>
        {renderNutritionChart(item._id)}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white p-2">
      {loading && mealDays.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center text-red-500">{error}</Text>
        </View>
      ) : (
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          {!selectedMealDay ? (
            <FlatList
              data={mealDays}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center p-4">
                  <Text className="text-center text-gray-600">No meal days available.</Text>
                </View>
              }
            />
          ) : (
            <Meals
              mealPlanId={mealPlanId}
              mealDayId={selectedMealDay._id}
              onBack={handleMealsClose}
              onNutritionChange={() => fetchAllMealDaysNutrition(mealDays)}
              date={formatDate(selectedMealDay.date)}
            />
          )}
        </Animated.View>
      )}
      <NutritionAdviceModal
        isOpen={showNutritionAdvice}
        onClose={() => setShowNutritionAdvice(false)}
        nutritionData={selectedDayNutrition}
        nutritionTargets={nutritionTargets}
      />
    </View>
  );
};

export default MealDays;
