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
import MainLayoutWrapper from "../../components/layout/MainLayoutWrapper";
import { userSelector } from "../../redux/selectors/selector";
import mealPlanService from "../../services/mealPlanService";
import MealDays from "./MealDays";
import CreateMealPlanForm from "./CreateMealPlanForm";
import MealPlanAimChart from "./MealPlanAimChart";
import { useSelector } from "react-redux";
import { ScreensName } from "../../constants/ScreensName";
import { useTheme } from "../../contexts/ThemeContext";
import ShowToast from "../../components/common/CustomToast";
import FontAwesomeIcon from "../../components/common/VectorIcons/FontAwesomeIcon";
import { createPayment } from "../../services/paymentService";
import { useFocusEffect } from "@react-navigation/native";

const MealPlan = ({ navigation }) => {
  const user = useSelector(userSelector);
  const { theme } = useTheme();

  const [userMealPlan, setUserMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);

  const fetchUserMealPlan = async () => {
    try {
      setLoading(true);
      const response = await mealPlanService.getUserMealPlan(user._id);
      if (response.success && response.data) {
        setUserMealPlan(response.data);
        setShowCreateForm(false); // Hide form if MealPlan exists
      } else {
        setUserMealPlan(null);
        setShowCreateForm(true); // Show form if no MealPlan
      }
    } catch (error) {
      // Log error instead of showing toast, including 404
      console.log("❌ No MealPlan found or error occurred:", error.message);
      setUserMealPlan(null);
      setShowCreateForm(true); // Show form on error (including 404)
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?._id) {
        fetchUserMealPlan();
      }
    }, [user?._id])
  );

  const handleCreateSuccess = () => {
    fetchUserMealPlan();
    setShowCreateForm(false);
    ShowToast("success", "🔔 MealPlan created successfully!");
  };

  const handleToggleMealPlanStatus = async () => {
    if (!userMealPlan) return;

    const newIsPause = !userMealPlan.isPause;

    try {
      setProcessingAction(true);
      setUserMealPlan((prev) => ({ ...prev, isPause: newIsPause }));
      const response = await mealPlanService.toggleMealPlanStatus(
        userMealPlan._id,
        newIsPause
      );

      if (response.success) {
        ShowToast(
          "success",
          `🔔 MealPlan has been ${
            newIsPause ? "paused" : "resumed"
          } successfully!`
        );
        await fetchUserMealPlan();
      } else {
        setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
        ShowToast("error", `❌ Error: ${response.message}`);
      }
    } catch (error) {
      setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
      ShowToast(
        "error",
        "❌ An unexpected error occurred while toggling MealPlan status"
      );
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
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]
      );
    });

    if (!confirmed) return;

    try {
      setProcessingAction(true);
      const response = await mealPlanService.deleteMealPlan(userMealPlan._id);

      if (response.success) {
        setUserMealPlan(null);
        setShowCreateForm(true); // Show form immediately after deletion
        await fetchUserMealPlan(); // Refresh data
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
    console.log("Nutrition Targets Calculated:", targets);
  };

  const handleTakeSurvey = () => {
    navigation.navigate(ScreensName.survey); // Navigate to Survey screen
  };

  const handlePayment = async () => {
    const response = await createPayment(
      user?._id,
      userMealPlan?._id,
      userMealPlan?.price || 150000
    );

    if (response.status === 200) {
      Linking.openURL(response?.data?.paymentUrl).catch((err) =>
        console.error("Couldn't load page", err)
      );
    }
  };

  if (loading) {
    return (
      <MainLayoutWrapper>
        <SafeAreaView className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator
            size="large"
            color={theme.primaryColor || "#16a34a"}
          />
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
                        {userMealPlan.title ||
                          userMealPlan.name ||
                          "Untitled Meal Plan"}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        From{" "}
                        {userMealPlan.startDate
                          ? new Date(userMealPlan.startDate)
                              .toISOString()
                              .split("T")[0]
                          : new Date(userMealPlan.createdAt)
                              .toISOString()
                              .split("T")[0]}{" "}
                        • {userMealPlan.duration || "N/A"} Days
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {userMealPlan.type === "fixed"
                          ? "Fixed Plan"
                          : "Custom Plan"}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`px-3 py-1 rounded-full ${
                          userMealPlan.isPause
                            ? "bg-yellow-100"
                            : "bg-green-100"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            userMealPlan.isPause
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {userMealPlan.isPause ? "Inactive" : "Active"}
                        </Text>
                      </View>
                      {/* Compact Action Buttons */}
                      <TouchableOpacity
                        onPress={handleToggleMealPlanStatus}
                        disabled={
                          processingAction || userMealPlan.isPause === undefined
                        }
                        className={`px-3 py-1 rounded-lg items-center justify-center ${
                          userMealPlan.isPause
                            ? "bg-green-600"
                            : "bg-yellow-400"
                        } ${
                          processingAction || userMealPlan.isPause === undefined
                            ? "opacity-50"
                            : "opacity-100"
                        }`}
                      >
                        <View className="flex-row items-center gap-1">
                          {userMealPlan.isPause ? (
                            <Entypo
                              name="controller-play"
                              size={14}
                              color="white"
                            />
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
                          <MaterialIcons
                            name="delete"
                            size={14}
                            color="white"
                          />
                          <Text className="text-white text-xs">Delete</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {!userMealPlan.paymentId && (
                  <TouchableOpacity
                    onPress={handlePayment}
                    className="my-4 bg-custom-green py-3 px-6 rounded-lg shadow-sm"
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <FontAwesomeIcon
                        name="credit-card"
                        size={16}
                        color="white"
                      />
                      <Text className="text-white text-base font-bold text-center">
                        Checkout & Purchase Plan
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Chart Section */}
                {userMealPlan._id && (
                  <View className="mb-4 border-t border-gray-200 pt-4">
                    {user.userPreferenceId ? (
                      <MealPlanAimChart
                        mealPlanId={userMealPlan._id}
                        userId={user.userPreferenceId}
                        duration={userMealPlan.duration || 7}
                        onNutritionTargetsCalculated={
                          handleNutritionTargetsCalculated
                        }
                      />
                    ) : (
                      <View className="p-4 bg-gray-50 rounded-lg">
                        <Text className="text-base text-gray-600 mb-4">
                          You can to complete the survey so we can calculate
                          nutrition targets tailored for you.
                        </Text>
                        <TouchableOpacity
                          onPress={handleTakeSurvey}
                          className="bg-custom-green py-3 px-6 rounded-lg"
                        >
                          <Text className="text-white text-base font-bold text-center">
                            Take survey now?
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Meal Days Section */}
                <View className="flex-1">
                  <MealDays
                    mealPlanId={userMealPlan._id}
                    nutritionTargets={nutritionTargets}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1 bg-white p-6 rounded-lg shadow-md">
              {showCreateForm && (
                <View className="w-full">
                  <Text className="text-xl font-bold text-gray-800 mb-4">
                    Create New Meal Plan
                  </Text>
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
