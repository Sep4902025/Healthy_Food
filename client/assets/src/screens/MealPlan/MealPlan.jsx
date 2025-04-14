import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { userSelector } from "../../redux/selectors/selector";
import mealPlanService from "../../services/mealPlanService";
import MealDays from "./MealDays";
import CreateMealPlanForm from "./CreateMealPlanForm";
import MealPlanAimChart from "./MealPlanAimChart";
import { ScreensName } from "../../constants/ScreensName";
import { useTheme } from "../../contexts/ThemeContext";
import ShowToast from "../../components/common/CustomToast";
import FontAwesomeIcon from "../../components/common/VectorIcons/FontAwesomeIcon";
import { createPayment } from "../../services/paymentService";
import MainLayoutWrapper from "../../components/layout/MainLayoutWrapper";

const MealPlan = ({ navigation }) => {
  const user = useSelector(userSelector);
  const { theme } = useTheme();

  const [userMealPlan, setUserMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [isMealPlanExpired, setIsMealPlanExpired] = useState(false);

  const fetchUserMealPlan = async () => {
    try {
      setLoading(true);
      const response = await mealPlanService.getUserMealPlan(user?._id);
      if (response.success && response.data) {
        const mealPlan = response.data;
        setUserMealPlan(mealPlan);
        setShowCreateForm(false);
        const startDate = new Date(mealPlan.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + mealPlan.duration);
        const currentDate = new Date();
        setIsMealPlanExpired(currentDate > endDate);
      } else {
        setUserMealPlan(null);
        setShowCreateForm(true);
        setIsMealPlanExpired(false);
      }
    } catch (error) {
      console.log("❌ Error fetching MealPlan:", error.message);
      setUserMealPlan(null);
      setShowCreateForm(true);
      setIsMealPlanExpired(false);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?._id) fetchUserMealPlan();
    }, [user?._id])
  );

  const handleCreateSuccess = () => {
    fetchUserMealPlan();
    setShowCreateForm(false);
    ShowToast("success", "🔔 MealPlan created successfully!");
  };

  const handleToggleMealPlanStatus = async () => {
    if (!userMealPlan || isMealPlanExpired) {
      ShowToast("error", "❌ Cannot toggle status: Meal plan is expired or invalid.");
      return;
    }
    const newIsPause = !userMealPlan.isPause;
    try {
      setProcessingAction(true);
      setUserMealPlan((prev) => ({ ...prev, isPause: newIsPause }));
      const response = await mealPlanService.toggleMealPlanStatus(userMealPlan._id, newIsPause);
      if (response.success) {
        ShowToast("success", `🔔 MealPlan ${newIsPause ? "paused" : "resumed"} successfully!`);
        await fetchUserMealPlan();
      } else {
        setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
      }
    } catch (error) {
      setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
      ShowToast("error", "❌ An unexpected error occurred while toggling MealPlan status");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteMealPlan = async () => {
    if (!userMealPlan) return;
    const confirmed = await new Promise((resolve) => {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this MealPlan? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Delete", style: "destructive", onPress: () => resolve(true) },
        ]
      );
    });
    if (!confirmed) return;
    try {
      setProcessingAction(true);
      const response = await mealPlanService.deleteMealPlan(userMealPlan._id);
      if (response.success) {
        setUserMealPlan(null);
        setShowCreateForm(true);
        setIsMealPlanExpired(false);
        ShowToast("success", "🗑️ MealPlan deleted successfully!");
      } else {
        ShowToast("error", `❌ Error: ${response.message}`);
      }
    } catch (error) {
      ShowToast("error", "❌ An error occurred while deleting the MealPlan");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleNutritionTargetsCalculated = (targets) => {
    setNutritionTargets(targets);
  };

  const handleTakeSurvey = () => {
    navigation.navigate(ScreensName.survey);
  };

  if (loading) {
    return (
      <MainLayoutWrapper>
        <SafeAreaView className="flex-1 justify-center items-center bg-background dark:bg-dark-background">
          <ActivityIndicator size="large" color={theme.mp_primaryColor || "#16a34a"} />
          <Text className="mt-2 text-base text-text dark:text-dark-text">Loading...</Text>
        </SafeAreaView>
      </MainLayoutWrapper>
    );
  }

  return (
    <MainLayoutWrapper>
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background">
        <View className="flex-1 p-4">
          {userMealPlan ? (
            <View className="flex-1 dark:bg-dark-surface rounded-lg p-4">
              <View className="mb-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text dark:text-dark-text mb-1">
                      {userMealPlan.title || "Untitled Meal Plan"}
                    </Text>
                    <Text className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                      From {new Date(userMealPlan.startDate).toISOString().split("T")[0]} •{" "}
                      {userMealPlan.duration} Days
                    </Text>
                    <Text className="text-xs text-text-secondary dark:text-dark-text-secondary">
                      {userMealPlan.type === "fixed" ? "Fixed Plan" : "Custom Plan"}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-3 py-1 rounded-full ${
                        userMealPlan.isPause ? "bg-yellow-400" : "bg-custom-green"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          userMealPlan.isPause ? "text-red-400" : "text-white"
                        }`}
                      >
                        {userMealPlan.isPause ? "Inactive" : "Active"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleToggleMealPlanStatus}
                      disabled={processingAction || isMealPlanExpired}
                      className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${
                        userMealPlan.isPause
                          ? "bg-green-600 dark:bg-green-700"
                          : "bg-yellow-400 dark:bg-yellow-600"
                      } ${processingAction || isMealPlanExpired ? "opacity-50" : "opacity-100"}`}
                    >
                      {userMealPlan.isPause ? (
                        <Entypo name="controller-play" size={14} color="white" />
                      ) : (
                        <AntDesign name="pause" size={14} color="white" />
                      )}
                      <Text className="text-white text-xs">
                        {userMealPlan.isPause ? "Resume" : "Pause"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeleteMealPlan}
                      disabled={processingAction}
                      className={`px-3 py-2 rounded-lg flex-row items-center gap-1 bg-red-500 dark:bg-red-700 ${
                        processingAction ? "opacity-50" : "opacity-100"
                      }`}
                    >
                      {/* <MaterialIcons name="delete" size={14} color="white" /> */}
                      <Text className="text-white text-xs">🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {userMealPlan._id && (
                <View className="mb-4 pt-4">
                  {user?.userPreferenceId ? (
                    <MealPlanAimChart
                      mealPlanId={userMealPlan._id}
                      userId={user?.userPreferenceId}
                      duration={userMealPlan.duration || 7}
                      onNutritionTargetsCalculated={handleNutritionTargetsCalculated}
                      isMealPlanExpired={isMealPlanExpired}
                      isMealPlanPaused={userMealPlan.isPause}
                      startDate={userMealPlan.startDate}
                    />
                  ) : (
                    <View className="p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg">
                      <Text className="text-base text-text dark:text-dark-text mb-4">
                        Complete the survey to get personalized nutrition targets.
                      </Text>
                      <TouchableOpacity
                        onPress={handleTakeSurvey}
                        className="bg-primary dark:bg-dark-primary py-3 px-6 rounded-lg"
                      >
                        <Text className="text-white text-base font-bold text-center">
                          Take Survey Now
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              <View className="flex-1">
                <MealDays mealPlanId={userMealPlan._id} nutritionTargets={nutritionTargets} />
              </View>
            </View>
          ) : (
            <View className="flex-1 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-md">
              {showCreateForm && (
                <View className="w-full">
                  <Text className="text-2xl font-bold text-text dark:text-dark-text mb-4">
                    Create New Meal Plan
                  </Text>
                  <CreateMealPlanForm
                    userId={user?._id}
                    userRole={user?.role}
                    onSuccess={handleCreateSuccess}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </MainLayoutWrapper>
  );
};

export default MealPlan;
