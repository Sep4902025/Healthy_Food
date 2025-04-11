import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link } from "@react-navigation/native";
import mealPlanService from "../../services/mealPlanService";
import quizService from "../../services/quizService";
import CustomPieChart from "./CustomPieChart";
import { useTheme } from "../../contexts/ThemeContext";

const MealPlanAimChart = ({
  mealPlanId,
  userId,
  duration = 7,
  onNutritionTargetsCalculated = () => {},
  isMealPlanExpired,
  isMealPlanPaused,
  startDate,
}) => {
  const { theme } = useTheme();
  const [userPreference, setUserPreference] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSurvey, setNeedsSurvey] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const mealPlanData = await mealPlanService.getMealPlanById(mealPlanId);
        if (!isMounted) return;
        if (!mealPlanData.success) {
          throw new Error(mealPlanData.message || "Unable to fetch MealPlan data");
        }
        setMealPlan(mealPlanData.data);
        const userData = await quizService.getUserPreferenceByUserPreferenceId(userId);
        if (!isMounted) return;
        if (!userData.success || !userData.data) {
          setNeedsSurvey(true);
        } else {
          setUserPreference(userData.data);
          setNeedsSurvey(false);
        }
      } catch (error) {
        setError(error.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };
    if (mealPlanId && userId) fetchData();
    return () => {
      isMounted = false;
    };
  }, [mealPlanId, userId]);

  const calculateNutritionTargets = useCallback((preferences) => {
    if (!preferences) return null;
    const convertAge = (ageRange) => {
      const ageMap = { "18-25": 22, "26-35": 30, "36-45": 40, "46+": 50 };
      return ageMap[ageRange] || 30;
    };
    const age = convertAge(preferences.age);
    const { height, weight, activityLevel, gender } = preferences;
    if (!age || !weight || !height || !activityLevel || !gender) {
      return null;
    }
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
      fat: {
        target: Math.round(fat),
        min: Math.round(fat - 10),
        max: Math.round(fat + 10),
      },
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
    onNutritionTargetsCalculated(targets);
  }, [
    userPreference,
    mealPlan,
    calculateNutritionTargets,
    onNutritionTargetsCalculated,
    calculationComplete,
  ]);

  const chartData = useMemo(() => {
    if (!nutritionTargets) return [];
    return [
      {
        x: "Protein",
        y: nutritionTargets.protein.target,
        color: theme.mp_proteinColor || "#ef4444",
      },
      { x: "Carbs", y: nutritionTargets.carbs.target, color: theme.mp_carbsColor || "#3b82f6" },
      { x: "Fat", y: nutritionTargets.fat.target, color: theme.mp_fatColor || "#facc15" },
    ].filter((item) => typeof item.y === "number" && item.y > 0);
  }, [nutritionTargets, theme]);

  const handleOpenModal = useCallback(() => setShowModal(true), []);
  const handleCloseModal = useCallback(() => setShowModal(false), []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={theme.mp_primaryColor || "#16a34a"} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-error dark:text-dark-error text-center">{error}</Text>
      </View>
    );
  }

  if (needsSurvey || !nutritionTargets) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-center text-text dark:text-dark-text mb-4">
          {needsSurvey
            ? "Complete the survey to get personalized nutrition targets."
            : "Unable to calculate nutrition targets. Please complete the survey."}
        </Text>
        <Link to={{ screen: "Survey" }}>
          <TouchableOpacity className="bg-primary dark:bg-dark-primary px-4 py-3 rounded-lg">
            <Text className="text-white font-medium">Take the Survey Now</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const weightToLose = userPreference ? userPreference.weight - userPreference.weightGoal : 0;
  const weeksToGoal = Math.ceil(weightToLose / 0.5);

  return (
    <View className="flex-col items-center relative">
      <TouchableOpacity onPress={handleOpenModal} className="absolute top-0 right-0 p-2">
        <Text className="text-text-secondary dark:text-dark-text-secondary text-lg">❓</Text>
      </TouchableOpacity>
      <View className="items-center">
        {chartData.length > 0 ? (
          <>
            <View className="relative flex items-center justify-center">
              <CustomPieChart
                data={chartData}
                width={100}
                height={100}
                innerRadius={25}
                outerRadius={35}
              />
              <View className="absolute flex items-center justify-center">
                <Text className="text-lg font-bold text-text dark:text-dark-text">
                  {nutritionTargets.calories.target}
                </Text>
                <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  kcal
                </Text>
              </View>
            </View>
            <View className="flex-row mt-2 gap-2 flex-wrap justify-center">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-400 mr-1 rounded-full" />
                <Text className="text-xs text-text dark:text-dark-text">
                  Protein {nutritionTargets.protein.target}g
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-400 mr-1 rounded-full" />
                <Text className="text-xs text-text dark:text-dark-text">
                  Carbs {nutritionTargets.carbs.target}g
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-yellow-400 mr-1 rounded-full" />
                <Text className="text-xs text-text dark:text-dark-text">
                  Fat {nutritionTargets.fat.target}g
                </Text>
              </View>
            </View>
            {isMealPlanExpired && (
              <View className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg w-full">
                <Text className="text-red-700 dark:text-red-300">
                  ⚠️ This MealPlan expired on{" "}
                  {new Date(
                    new Date(startDate).setDate(new Date(startDate).getDate() + duration)
                  ).toLocaleDateString()}
                  . Please delete it to create a new one.
                </Text>
              </View>
            )}
            {isMealPlanPaused && !isMealPlanExpired && (
              <View className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg w-full">
                <Text className="text-yellow-700 dark:text-yellow-300">
                  ⚠️ This MealPlan is currently paused. Please resume it to make changes.
                </Text>
              </View>
            )}
          </>
        ) : (
          <Text className="text-center text-text-secondary dark:text-dark-text-secondary">
            No data to display
          </Text>
        )}
      </View>
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-surface dark:bg-dark-surface p-6 rounded-lg max-w-md shadow-lg">
            <Text className="text-lg font-semibold text-text dark:text-dark-text mb-4">
              Goal Information
            </Text>
            <View className="space-y-3">
              <View>
                <Text className="text-text dark:text-dark-text">
                  <Text className="font-bold">Current Weight: </Text>
                  {userPreference?.weight ? `${userPreference.weight} kg` : "No data available"}
                </Text>
                <Text className="text-text dark:text-dark-text">
                  <Text className="font-bold">Weight Goal: </Text>
                  {userPreference?.weightGoal
                    ? `${userPreference.weightGoal} kg`
                    : "No data available"}
                </Text>
                <Text className="text-text dark:text-dark-text">
                  <Text className="font-bold">Plan Duration: </Text>
                  {duration ? `${duration} days` : "N/A"}
                </Text>
              </View>
              {weightToLose > 0 && (
                <Text className="text-text dark:text-dark-text">
                  To achieve your goal of losing {weightToLose} kg, maintain a proper diet for about{" "}
                  <Text className="font-bold">{weeksToGoal} weeks</Text>.
                </Text>
              )}
              <Text className="text-text dark:text-dark-text">
                Follow this plan for {duration || "N/A"} days, then consult a nutritionist for
                long-term support!
              </Text>
              <View>
                <Text className="font-bold text-text dark:text-dark-text">Nutrition Targets:</Text>
                <Text className="text-text dark:text-dark-text">
                  Calories: {nutritionTargets.calories.target} kcal (±10%)
                </Text>
                <Text className="text-text dark:text-dark-text">
                  Protein: {nutritionTargets.protein.target}g (±15g)
                </Text>
                <Text className="text-text dark:text-dark-text">
                  Carbs: {nutritionTargets.carbs.target}g (±15g)
                </Text>
                <Text className="text-text dark:text-dark-text">
                  Fat: {nutritionTargets.fat.target}g (±10g)
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="mt-4 bg-primary dark:bg-dark-primary py-3 rounded-lg"
              onPress={handleCloseModal}
            >
              <Text className="text-white text-center font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MealPlanAimChart;
