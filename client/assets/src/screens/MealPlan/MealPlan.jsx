import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import MainLayoutWrapper from "../../components/layout/MainLayoutWrapper";
import { userSelector } from "../../redux/selectors/selector";
import mealPlanService from "../../services/mealPlanService";
import MealDays from "./MealDays";
import CreateMealPlanForm from "./CreateMealPlanForm";
import MealPlanAimChart from "./MealPlanAimChart";
import { useSelector } from "react-redux";

const MealPlan = () => {
  const user = useSelector(userSelector);
  console.log("USSSERRR", user);

  const [userMealPlan, setUserMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);

  const fetchUserMealPlan = async () => {
    try {
      setLoading(true);
      const response = await mealPlanService.getUserMealPlan(user._id);
      console.log("User Meal Plan Response:", response); // Debug API response
      if (response.success) {
        setUserMealPlan(response.data);
        console.log("Set userMealPlan:", response.data);
      } else {
        setUserMealPlan(null);
      }
    } catch (error) {
      console.error("❌ Error fetching MealPlan:", error);
      setUserMealPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMealPlan();
  }, [user._id]);

  const handleCreateSuccess = () => {
    fetchUserMealPlan();
    setShowCreateForm(false);
  };

  const handleToggleMealPlanStatus = async () => {
    if (!userMealPlan) return;

    const newIsPause = !userMealPlan.isPause;

    try {
      setProcessingAction(true);
      setUserMealPlan((prev) => ({ ...prev, isPause: newIsPause }));
      const response = await mealPlanService.toggleMealPlanStatus(userMealPlan._id, newIsPause);

      if (response.success) {
        Alert.alert(
          "Success",
          `🔔 MealPlan has been ${newIsPause ? "paused" : "resumed"} successfully!`
        );
        await fetchUserMealPlan();
      } else {
        setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
        Alert.alert("Error", `❌ Error: ${response.message}`);
      }
    } catch (error) {
      setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
      Alert.alert("Error", "❌ An unexpected error occurred while changing the MealPlan status");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteMealPlan = async () => {
    if (!userMealPlan) return;

    const confirmed = await new Promise((resolve) => {
      Alert.alert(
        "Confirm Delete",
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
        Alert.alert("Success", "🗑️ MealPlan has been deleted successfully!");
        setUserMealPlan(null);
        setShowCreateForm(true);
      } else {
        Alert.alert("Error", `❌ Error: ${response.message}`);
      }
    } catch (error) {
      Alert.alert("Error", "❌ An error occurred while deleting the MealPlan");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleTakeSurvey = () => {
    console.log("Take Survey pressed");
    setShowCreateForm(true); // For now, show the create form as a placeholder
  };

  const handleNutritionTargetsCalculated = (targets) => {
    setNutritionTargets(targets);
    console.log("Nutrition Targets Calculated:", targets); // Debug nutrition targets
  };

  if (loading) {
    return (
      <MainLayoutWrapper>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-base text-green-600">Loading...</Text>
        </SafeAreaView>
      </MainLayoutWrapper>
    );
  }

  return (
    <MainLayoutWrapper>
      <SafeAreaView className="flex-1">
        <View className="flex-1 p-4">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => console.log("Go back")}>
              <Ionicons name="arrow-back" size={24} color="#16a34a" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-green-600 ml-2">Meal Plan</Text>
          </View>

          {userMealPlan ? (
            <View className="bg-white p-4 rounded-lg shadow-md flex-1">
              <View className="flex justify-between items-center gap-2">
                {/* Meal Plan Details */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-semibold text-gray-800">
                      {userMealPlan.title}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        userMealPlan.isPause ? "bg-yellow-100" : "bg-green-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          userMealPlan.isPause ? "text-yellow-600" : "text-green-600"
                        }`}
                      >
                        {userMealPlan.isPause ? "Inactive" : "Active"}
                      </Text>
                    </View>
                  </View>

                  {/* Start Date and Duration */}
                  <Text className="text-sm text-gray-600">
                    From {new Date(userMealPlan.startDate).toLocaleDateString()} •{" "}
                    {userMealPlan.duration} Days
                  </Text>

                  {/* Type (optional) */}
                  <Text className="text-xs text-gray-500 mt-1">
                    {userMealPlan.type === "fixed" ? "Fixed Plan" : "Custom Plan"}
                  </Text>
                </View>

                {/* Meal Plan Aim Chart */}
                <MealPlanAimChart
                  mealPlanId={userMealPlan._id}
                  duration={userMealPlan.duration}
                  onNutritionTargetsCalculated={handleNutritionTargetsCalculated}
                />
                {/* Action Buttons */}
                <View className="flex-row gap-2 mb-4">
                  <TouchableOpacity
                    onPress={handleToggleMealPlanStatus}
                    disabled={processingAction}
                    className={`py-2 px-4 rounded-lg items-center ${
                      userMealPlan.isPause ? "bg-green-600" : "bg-yellow-600"
                    } ${processingAction ? "opacity-50" : "opacity-100"}`}
                  >
                    <Text className="text-white text-sm">
                      {userMealPlan.isPause ? "▶️ Continue" : "⏸️ Pause"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteMealPlan}
                    disabled={processingAction}
                    className={`py-2 px-4 rounded-lg items-center bg-red-600 ${
                      processingAction ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <Text className="text-white text-sm">🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Meal Days */}
              <MealDays mealPlanId={userMealPlan._id} nutritionTargets={nutritionTargets} />
            </View>
          ) : (
            <View className="flex-1 justify-center items-center bg-white p-4 rounded-lg shadow-md">
              {!showCreateForm ? (
                <View className="items-center">
                  <Text className="text-gray-600 text-center mb-4">
                    Complete the survey to calculate your nutrition targets.
                  </Text>
                  <View className="flex-row items-center space-x-3">
                    <TouchableOpacity
                      onPress={handleTakeSurvey}
                      className="bg-blue-600 px-4 py-2 rounded"
                    >
                      <Text className="text-white font-semibold">Take Survey</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleToggleMealPlanStatus}
                      disabled={true}
                      className="bg-yellow-600 px-4 py-2 rounded opacity-50"
                    >
                      <Text className="text-white font-semibold">Pause</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeleteMealPlan}
                      disabled={true}
                      className="bg-red-600 px-4 py-2 rounded opacity-50"
                    >
                      <Text className="text-white font-semibold">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="w-full">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-medium">Create New Meal Plan</Text>
                    <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                      <Text className="text-sm text-gray-600">❌ Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  <CreateMealPlanForm
                    userId={user._id}
                    userRole={user.role}
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
