import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link } from "@react-navigation/native";
import mealPlanService from "../../services/mealPlanService";
import quizService from "../../services/quizService";
import CustomPieChart from "./CustomPieChart";

const MealPlanAimChart = ({
  mealPlanId,
  userId,
  duration = 7,
  onNutritionTargetsCalculated = () => {},
}) => {
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
        console.error("Error fetching data:", error);
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
      console.log("Missing required fields for nutrition calculation:", {
        age,
        height,
        weight,
        activityLevel,
        gender,
      });
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

    if (onNutritionTargetsCalculated) {
      onNutritionTargetsCalculated(targets);
    }
  }, [
    userPreference,
    mealPlan,
    calculateNutritionTargets,
    onNutritionTargetsCalculated,
    calculationComplete,
  ]);

  const chartData = useMemo(() => {
    if (!nutritionTargets) return [];

    const data = [
      { x: "Protein", y: nutritionTargets.protein.target, color: "#ef4444" },
      { x: "Carbs", y: nutritionTargets.carbs.target, color: "#3b82f6" },
      { x: "Fat", y: nutritionTargets.fat.target, color: "#facc15" },
    ];

    return data.filter((item) => typeof item.y === "number" && item.y > 0);
  }, [nutritionTargets]);

  const handleOpenModal = useCallback(() => setShowModal(true), []);
  const handleCloseModal = useCallback(() => setShowModal(false), []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  if (needsSurvey || !nutritionTargets) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center mb-4">
          {needsSurvey
            ? "You need to complete the survey so we can calculate nutrition targets tailored for you."
            : "Unable to calculate nutrition targets due to missing information. Please complete the survey."}
        </Text>
        <Link to={{ screen: "Survey" }}>
          <TouchableOpacity className="h-full px-4 py-2 bg-blue-500 rounded">
            <Text className="text-white">Take the Survey Now</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const weightToLose = userPreference ? userPreference.weight - userPreference.weightGoal : 0;
  const weeksToGoal = Math.ceil(weightToLose / 0.5);

  return (
    <View className="flex-col relative">
      <TouchableOpacity onPress={handleOpenModal} className="absolute top-0 right-0 p-2">
        <Text className="text-gray-500 text-lg">❓</Text>
      </TouchableOpacity>

      <View className="w-full h-32 items-center relative">
        {chartData.length > 0 ? (
          <>
            <View className="relative flex items-center justify-center">
              <CustomPieChart
                data={chartData}
                width={100}
                height={100}
                innerRadius={40}
                outerRadius={30}
              />
              <View className="absolute flex items-center justify-center">
                <Text className="text-lg font-bold">{nutritionTargets.calories.target}</Text>
                <Text className="text-xs text-gray-500">kcal</Text>
              </View>
            </View>
            <View className="flex-row mt-1 gap-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-400 mr-1" />
                <Text className="text-xs">Protein {nutritionTargets.protein.target}g</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-400 mr-1" />
                <Text className="text-xs">Carbs {nutritionTargets.carbs.target}g</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-yellow-400 mr-1" />
                <Text className="text-xs">Fat {nutritionTargets.fat.target}g</Text>
              </View>
            </View>
          </>
        ) : (
          <Text className="text-center text-gray-500">No data to display</Text>
        )}
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white p-6 rounded-lg max-w-md shadow-lg">
            <Text className="text-lg font-semibold mb-4 text-gray-800">Goal Information</Text>
            <View className="space-y-3">
              <View>
                <Text>
                  <Text className="font-bold">Current Weight:</Text>{" "}
                  {userPreference?.weight ? `${userPreference.weight} kg` : "No data available"}
                </Text>
                <Text>
                  <Text className="font-bold">Weight Goal:</Text>{" "}
                  {userPreference?.weightGoal
                    ? `${userPreference.weightGoal} kg`
                    : "No data available"}
                </Text>
                <Text>
                  <Text className="font-bold">Plan Duration:</Text>{" "}
                  {duration ? `${duration} days` : "N/A"}
                </Text>
              </View>

              {weightToLose > 0 && (
                <Text>
                  To achieve your goal of losing {weightToLose} kg, you need to maintain a proper
                  diet for about <Text className="font-bold">{weeksToGoal} weeks</Text>.
                </Text>
              )}
              <Text>
                Try this plan for the first {duration || "N/A"} days. After that, contact a
                nutritionist for long-term support!
              </Text>

              <View>
                <Text className="font-bold">Nutrition Targets:</Text>
                <Text>Calories: {nutritionTargets.calories.target} kcal (±10%)</Text>
                <Text>Protein: {nutritionTargets.protein.target}g (±15g)</Text>
                <Text>Carbs: {nutritionTargets.carbs.target}g (±15g)</Text>
                <Text>Fat: {nutritionTargets.fat.target}g (±10g)</Text>
              </View>
            </View>

            <TouchableOpacity className="mt-4 bg-blue-500 py-2 rounded" onPress={handleCloseModal}>
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MealPlanAimChart;
