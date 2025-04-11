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
import mealPlanService from "../../services/mealPlanService";
import dishesService from "../../services/dishService";
import CustomPieChart from "./CustomPieChart";
import { useTheme } from "../../contexts/ThemeContext";

const NutritionAdviceModal = ({ isOpen, onClose, nutritionData, nutritionTargets }) => {
  const { theme } = useTheme();
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
        <View className="bg-surface dark:bg-dark-surface p-4 m-4 rounded-lg max-w-md">
          <Text className="text-xl font-bold text-text dark:text-dark-text mb-4">
            Nutrition Advice
          </Text>
          {["calories", "protein", "carbs", "fat"].map((nutrient) => (
            <View key={nutrient} className="mb-4">
              <View className="flex-row justify-between">
                <Text className="font-medium text-text dark:text-dark-text">
                  {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}:
                </Text>
                <Text className="text-text dark:text-dark-text">
                  {Math.round(nutritionData[nutrient])} / {nutritionTargets[nutrient].target}
                  {nutrient === "calories" ? " kcal" : "g"}
                </Text>
              </View>
              <View className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (nutritionData[nutrient] / nutritionTargets[nutrient].target) * 100
                    )}%`,
                    backgroundColor:
                      nutritionData[nutrient] < nutritionTargets[nutrient].min
                        ? theme.warningColor || "#eab308"
                        : nutritionData[nutrient] > nutritionTargets[nutrient].max
                        ? theme.errorColor || "#ef4444"
                        : theme.successColor || "#16a34a",
                  }}
                />
              </View>
            </View>
          ))}
          <Text className="font-medium text-text dark:text-dark-text mb-2">Suggestions:</Text>
          {generateAdvice().map((advice, index) => (
            <Text key={index} className="text-sm text-text-secondary dark:text-dark-text-secondary">
              • {advice}
            </Text>
          ))}
          <TouchableOpacity
            className="bg-primary dark:bg-dark-primary p-3 rounded-lg mt-4"
            onPress={onClose}
          >
            <Text className="text-white text-center font-medium">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MealDays = ({ mealPlanId, nutritionTargets }) => {
  const { theme } = useTheme();
  const [mealDays, setMealDays] = useState([]);
  const [mealDayNutrition, setMealDayNutrition] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealDay, setSelectedMealDay] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showNutritionAdvice, setShowNutritionAdvice] = useState(false);
  const [selectedDayNutrition, setSelectedDayNutrition] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false); // Thêm trạng thái chuyển đổi
  const firstLoad = useRef(true);

  const fetchMealDays = async () => {
    if (!mealPlanId) {
      setLoading(false);
      return;
    }
    if (!firstLoad.current && mealDays.length === 0) setLoading(true);
    try {
      const data = await mealPlanService.getMealDaysByMealPlan(mealPlanId);
      if (data.success) {
        const mealDaysData = Array.isArray(data.data) ? data.data : [];
        setMealDays(mealDaysData);
        fetchAllMealDaysNutrition(mealDaysData);
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
    if (!nutrition || !nutritionTargets) return theme.borderColor || "#e5e7eb";
    const status = evaluateNutritionStatus(nutrition);
    return status === "exceeded"
      ? theme.errorColor || "#ef4444"
      : status === "optimal"
      ? theme.successColor || "#16a34a"
      : theme.warningColor || "#eab308";
  };

  const getStatusIcon = (mealDayId) => {
    const nutrition = mealDayNutrition[mealDayId];
    if (!nutrition) return null;
    const status = evaluateNutritionStatus(nutrition);
    return status === "exceeded" ? (
      <Text className=" ml-2 text-red-500">❗</Text>
    ) : status === "optimal" ? (
      <Text className="ml-2 text-green-500">✅</Text>
    ) : (
      <Text className="ml-2 text-yellow-500">⚠️</Text>
    );
  };

  const handleMealDaySelect = (mealDay) => {
    setIsTransitioning(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedMealDay(mealDay);
      setIsTransitioning(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleMealsClose = () => {
    setIsTransitioning(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedMealDay(null);
      fetchMealDays();
      setIsTransitioning(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderNutritionChart = (mealDayId) => {
    const nutrition = mealDayNutrition[mealDayId];
    if (!nutrition) return null;
    if (nutrition.protein === 0 && nutrition.carbs === 0 && nutrition.fat === 0) {
      return (
        <View className="items-center">
          <Text className="text-lg font-bold text-text dark:text-dark-text">
            {Math.round(nutrition.calories)}
          </Text>
          <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">kcal</Text>
        </View>
      );
    }

    const chartData = [
      { x: "Protein", y: nutrition.protein, color: theme.proteinColor || "#ef4444" },
      { x: "Carbs", y: nutrition.carbs, color: theme.carbsColor || "#3b82f6" },
      { x: "Fat", y: nutrition.fat, color: theme.fatColor || "#facc15" },
    ].filter((item) => item.y > 0);

    return (
      <View className="items-center">
        <View className="relative flex items-center justify-center">
          <CustomPieChart
            data={chartData}
            width={80}
            height={80}
            innerRadius={25}
            outerRadius={35}
          />
          <View className="absolute flex items-center justify-center">
            <Text className="text-sm font-bold text-text dark:text-dark-text">
              {Math.round(nutrition.calories)}
            </Text>
            <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">kcal</Text>
          </View>
        </View>
        <View className="flex-row flex-wrap justify-center mt-2 gap-2">
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-red-500" />
            <Text className="text-xs text-text dark:text-dark-text">
              Protein: {Math.round(nutrition.protein)}g
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-blue-500" />
            <Text className="text-xs text-text dark:text-dark-text">
              Carbs: {Math.round(nutrition.carbs)}g
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-yellow-400" />
            <Text className="text-xs text-text dark:text-dark-text">
              Fat: {Math.round(nutrition.fat)}g
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const borderColor = getNutritionStatusColor(item._id);
    return (
      <TouchableOpacity
        className="flex-1 m-2 p-4 border-2 rounded-lg bg-surface dark:bg-dark-surface"
        style={{ borderColor }}
        onPress={() => handleMealDaySelect(item)}
      >
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-text dark:text-dark-text">Day {index + 1}</Text>
            {getStatusIcon(item._id)}
          </View>
          {mealDayNutrition[item._id] && (
            <TouchableOpacity
              className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded"
              onPress={() => {
                setSelectedDayNutrition(mealDayNutrition[item._id]);
                setShowNutritionAdvice(true);
              }}
            >
              <Text className="text-blue-600 dark:text-blue-300 text-xs">Suggest</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
          {formatDate(item.date)}
        </Text>
        {renderNutritionChart(item._id)}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background p-2">
      {(loading && mealDays.length === 0) || isTransitioning ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.primaryColor || "#16a34a"} />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center text-error dark:text-dark-error">{error}</Text>
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
                  <Text className="text-center text-text-secondary dark:text-dark-text-secondary">
                    No meal days available.
                  </Text>
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
