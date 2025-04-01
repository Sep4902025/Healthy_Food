import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import MainLayoutWrapper from "../../components/layout/MainLayoutWrapper";
import { userSelector } from "../../redux/selectors/selector";
import mealPlanService from "../../services/mealPlanService";
import MealDays from "./MealDays";
import CreateMealPlanForm from "./CreateMealPlanForm";
import MealPlanAimChart from "./MealPlanAimChart";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { ScreensName } from "../../constants/ScreensName";
import { useTheme } from "../../contexts/ThemeContext";

const MealPlan = () => {
  const user = useSelector(userSelector);
  console.log("USER", user);

  const navigation = useNavigation();
  const { theme } = useTheme(); // Sử dụng theme để đồng bộ giao diện

  const [userMealPlan, setUserMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);

  const fetchUserMealPlan = async () => {
    try {
      setLoading(true);
      const response = await mealPlanService.getUserMealPlan(user._id);
      console.log("User Meal Plan Response:", response);
      if (response.success && response.data) {
        setUserMealPlan(response.data);
        console.log("Set userMealPlan:", response.data);
      } else {
        setUserMealPlan(null);
        setShowCreateForm(true); // Nếu không có meal plan, hiển thị form ngay
      }
    } catch (error) {
      console.error("❌ Error fetching MealPlan:", error);
      setUserMealPlan(null);
      setShowCreateForm(true); // Nếu có lỗi, cũng hiển thị form
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchUserMealPlan();
    }
  }, [user?._id]);

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
        setShowCreateForm(true); // Hiển thị form ngay sau khi xóa
        navigation.navigate(ScreensName.mealPlan); // Điều hướng để làm mới
      } else {
        Alert.alert("Error", `❌ Error: ${response.message}`);
      }
    } catch (error) {
      Alert.alert("Error", "❌ An error occurred while deleting the MealPlan");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleNutritionTargetsCalculated = (targets) => {
    setNutritionTargets(targets);
    console.log("Nutrition Targets Calculated:", targets);
  };

  if (loading) {
    return (
      <MainLayoutWrapper>
        <SafeAreaView className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color={theme.primaryColor || "#16a34a"} />
          <Text className="mt-2 text-base text-green-600">Loading...</Text>
        </SafeAreaView>
      </MainLayoutWrapper>
    );
  }

  return (
    <MainLayoutWrapper>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {userMealPlan ? (
            <View className="flex-1">
              {/* Main Content (Header, Chart, MealDays) */}
              <View className="flex-1 bg-white p-4 rounded-lg shadow-md">
                {/* Header Section: Meal Plan Details */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <View>
                      <Text className="text-xl font-bold text-gray-800">
                        {userMealPlan.title || userMealPlan.name || "Untitled Meal Plan"}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        From{" "}
                        {userMealPlan.startDate
                          ? new Date(userMealPlan.startDate).toISOString().split("T")[0]
                          : new Date(userMealPlan.createdAt).toISOString().split("T")[0]}{" "}
                        • {userMealPlan.duration || "N/A"} Days
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {userMealPlan.type === "fixed" ? "Fixed Plan" : "Custom Plan"}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`px-3 py-1 rounded-full ${
                          userMealPlan.isPause ? "bg-yellow-100" : "bg-green-100"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            userMealPlan.isPause ? "text-yellow-600" : "text-green-600"
                          }`}
                        >
                          {userMealPlan.isPause ? "Inactive" : "Active"}
                        </Text>
                      </View>
                      {/* Compact Action Buttons */}
                      <TouchableOpacity
                        onPress={handleToggleMealPlanStatus}
                        disabled={processingAction || userMealPlan.isPause === undefined}
                        className={`px-3 py-1 rounded-lg items-center justify-center ${
                          userMealPlan.isPause ? "bg-green-600" : "bg-yellow-400"
                        } ${
                          processingAction || userMealPlan.isPause === undefined
                            ? "opacity-50"
                            : "opacity-100"
                        }`}
                      >
                        <View className="flex-row items-center gap-1">
                          {userMealPlan.isPause ? (
                            <Entypo name="controller-play" size={14} color="white" />
                          ) : (
                            <AntDesign name="pause" size={14} color="white" />
                          )}
                          <Text className="text-white text-xs">
                            {userMealPlan.isPause ? "Resume" : "Pause"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleDeleteMealPlan}
                        disabled={processingAction}
                        className={`px-3 py-1 rounded-lg items-center justify-center bg-red-600 ${
                          processingAction ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="delete" size={14} color="white" />
                          <Text className="text-white text-xs">Delete</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Chart Section */}
                {userMealPlan._id && (
                  <View className="mb-4 border-t border-gray-200 pt-4">
                    <MealPlanAimChart
                      mealPlanId={userMealPlan._id}
                      userId={user.userPreferenceId}
                      duration={userMealPlan.duration || 7}
                      onNutritionTargetsCalculated={handleNutritionTargetsCalculated}
                    />
                  </View>
                )}

                {/* Meal Days Section */}
                <View className="flex-1">
                  <MealDays mealPlanId={userMealPlan._id} nutritionTargets={nutritionTargets} />
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1 bg-white p-6 rounded-lg shadow-md">
              {showCreateForm && (
                <View className="w-full">
                  <Text className="text-xl font-bold text-gray-800 mb-4">Create New Meal Plan</Text>
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
