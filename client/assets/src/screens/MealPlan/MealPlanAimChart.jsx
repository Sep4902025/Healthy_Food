import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import mealPlanService from "../../services/mealPlanService";
import quizService from "../../services/quizService";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const MealPlanAimChart = ({ mealPlanId, duration, onNutritionTargetsCalculated }) => {
  const [userPreference, setUserPreference] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSurvey, setNeedsSurvey] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const mealPlanData = await mealPlanService.getMealPlanById(mealPlanId);
        if (!mealPlanData.success) throw new Error(mealPlanData.message);
        setMealPlan(mealPlanData.data);

        const userData = await quizService.getUserPreference(mealPlanData.data.userId);
        if (!userData.success || !userData.data) {
          setNeedsSurvey(true);
        } else {
          setUserPreference(userData.data);
          setNeedsSurvey(false);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (mealPlanId) fetchData();
  }, [mealPlanId]);

  const calculateNutritionTargets = useCallback((preferences) => {
    if (!preferences) return null;

    const convertAge = (ageRange) =>
      ({ "18-25": 22, "26-35": 30, "36-45": 40, "46+": 50 }[ageRange] || 30);
    const age = convertAge(preferences.age);
    const { height, weight, activityLevel, gender } = preferences;

    if (!age || !weight || !height || !activityLevel || !gender) return null;

    const BMR =
      gender === "female"
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;
    const TDEE = BMR * activityLevel;
    const dailyCalories = TDEE;

    const protein = weight * 1.5;
    const fat = weight * 0.8;
    const carbs = (dailyCalories - (protein * 4 + fat * 9)) / 4;

    return {
      calories: {
        target: Math.round(dailyCalories),
        min: Math.round(dailyCalories * 0.9),
        max: Math.round(dailyCalories * 1.1),
      },
      protein: {
        target: Math.round(protein),
        min: Math.round(protein - 15),
        max: Math.round(protein + 15),
      },
      carbs: {
        target: Math.round(carbs),
        min: Math.round(carbs - 15),
        max: Math.round(carbs + 15),
      },
      fat: { target: Math.round(fat), min: Math.round(fat - 10), max: Math.round(fat + 10) },
    };
  }, []);

  useEffect(() => {
    if (!userPreference || !mealPlan || calculationComplete) return;
    const targets = calculateNutritionTargets(userPreference);
    if (!targets) {
      setNeedsSurvey(true);
      return;
    }
    setNutritionTargets(targets);
    setCalculationComplete(true);
    if (onNutritionTargetsCalculated) onNutritionTargetsCalculated(targets);
  }, [userPreference, mealPlan, calculateNutritionTargets, onNutritionTargetsCalculated]);

  const chartData = nutritionTargets
    ? [
        { name: "Protein", value: nutritionTargets.protein.target, fill: "#ef4444" },
        { name: "Carbs", value: nutritionTargets.carbs.target, fill: "#3b82f6" },
        { name: "Fat", value: nutritionTargets.fat.target, fill: "#facc15" },
      ].filter((item) => item.value > 0)
    : [];

  if (loading) return <Text className="text-center">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500">{error}</Text>;
  if (needsSurvey) {
    return (
      <View className="items-center">
        <Text className="text-center mb-3">
          Complete the survey to calculate your nutrition targets.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 p-3 rounded-lg"
          onPress={() => navigation.navigate("Survey")}
        >
          <Text className="text-white">Take Survey</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const weightToLose = userPreference ? userPreference.weight - userPreference.weightGoal : 0;
  const weeksToGoal = Math.ceil(weightToLose / 0.5);

  return (
    <View className="items-center relative">
      <TouchableOpacity className="absolute top-0 right-0 p-2" onPress={() => setShowModal(true)}>
        <Text>❓</Text>
      </TouchableOpacity>
      <PieChart
        width={80}
        height={80}
        data={chartData}
        chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="0"
        center={[40, 40]}
        hasLegend={false}
        absolute
      />
      <View className="absolute top-6 items-center">
        <Text className="text-lg font-bold">{nutritionTargets?.calories.target}</Text>
        <Text className="text-xs text-gray-500">kcal</Text>
      </View>
      <View className="flex-row flex-wrap justify-center mt-1">
        <Text className="text-xs mx-1 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
          P: {nutritionTargets?.protein.target}g
        </Text>
        <Text className="text-xs mx-1 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
          C: {nutritionTargets?.carbs.target}g
        </Text>
        <Text className="text-xs mx-1 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />
          F: {nutritionTargets?.fat.target}g
        </Text>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white p-4 m-4 rounded-lg">
            <Text className="text-lg font-bold mb-3">Goal Information</Text>
            <Text>Current Weight: {userPreference?.weight || "N/A"} kg</Text>
            <Text>Weight Goal: {userPreference?.weightGoal || "N/A"} kg</Text>
            <Text>Plan Duration: {duration} days</Text>
            {weightToLose > 0 && (
              <Text>
                To lose {weightToLose} kg, maintain diet for ~{weeksToGoal} weeks.
              </Text>
            )}
            <Text>Nutrition Targets:</Text>
            <Text>• Calories: {nutritionTargets?.calories.target} kcal (±10%)</Text>
            <Text>• Protein: {nutritionTargets?.protein.target}g (±15g)</Text>
            <Text>• Carbs: {nutritionTargets?.carbs.target}g (±15g)</Text>
            <Text>• Fat: {nutritionTargets?.fat.target}g (±10g)</Text>
            <TouchableOpacity
              className="bg-blue-600 p-2 rounded-lg items-center mt-3"
              onPress={() => setShowModal(false)}
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MealPlanAimChart;
