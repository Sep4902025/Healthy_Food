import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For back arrow icon
import AddDishToMeal from "./AddDishToMeal";
import AddMealModal from "./AddMealModal";
import DishCard from "./DishCard";
import ConfirmationDialog from "./ComfirmDialog"; // Note: Typo in import ("ComfirmDialog" should be "ConfirmationDialog")
import HomeService from "../../services/HomeService";
import mealPlanService from "../../services/mealPlanService";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";

const Meals = ({ mealPlanId, mealDayId, onBack, onNutritionChange, date }) => {
  const user = useSelector(userSelector);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDay, setMealDay] = useState(null);
  const [dishDetails, setDishDetails] = useState([]);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState(null);
  const [deletingDishId, setDeletingDishId] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1)); // Use Animated.Value for opacity transition
  const [mealPlanType, setMealPlanType] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);

  const dataLoaded = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!dataLoaded.current) {
        setLoading(true);
      }

      try {
        const [mealPlanResponse, mealDayResponse, mealsResponse] = await Promise.all([
          mealPlanService.getMealPlanById(mealPlanId),
          mealPlanService.getMealDayById(mealPlanId, mealDayId),
          mealPlanService.getMealsByMealDay(mealPlanId, mealDayId),
        ]);

        if (mealPlanResponse.success) {
          setMealPlanType(mealPlanResponse.data.type);
        }

        if (mealDayResponse.success) {
          setMealDay(mealDayResponse.data);
        }

        if (mealsResponse.success) {
          setMeals(mealsResponse.data);

          const dishPromises = mealsResponse.data.flatMap((meal) =>
            meal.dishes.map((dish) => HomeService.getDishById(dish.dishId))
          );

          const dishResponses = await Promise.all(dishPromises);
          const dishData = dishResponses
            .map((res) => (res.success ? res.data : null))
            .filter((dish) => dish !== null);

          setDishDetails(dishData);
        } else {
          setError(mealsResponse.message);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
        dataLoaded.current = true;
      }
    };

    fetchData();
  }, [mealPlanId, mealDayId]);

  const refreshMeals = async () => {
    try {
      const response = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
      if (response.success) {
        setMeals(response.data);

        if (selectedMeal) {
          const updatedMeal = response.data.find((m) => m._id === selectedMeal._id);
          if (updatedMeal) {
            setSelectedMeal(updatedMeal);
          }
        }

        if (onNutritionChange) {
          onNutritionChange();
        }
      }
    } catch (err) {
      console.error("Error refreshing meals:", err);
    }
  };

  const handleDishAdded = () => {
    setIsAddingDish(false);
    refreshMeals();
  };

  const handleMealAdded = () => {
    refreshMeals();
  };

  const handleMealSelect = (meal) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setSelectedMeal(meal);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const handleBackToMeals = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setSelectedMeal(null);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const handleRemoveMealFromDay = (mealId) => {
    if (!mealId) return;
    setMealToDelete(mealId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;

    setDeletingMealId(mealToDelete);
    try {
      const response = await mealPlanService.removeMealFromDay(mealPlanId, mealDayId, mealToDelete);

      if (response.success) {
        refreshMeals();
      } else {
        setError("Could not delete meal!");
      }
    } catch (err) {
      console.error("Error deleting meal:", err);
      setError("Could not delete meal!");
    } finally {
      setDeletingMealId(null);
      setShowConfirmDialog(false);
      setMealToDelete(null);
    }
  };

  const cancelDeleteMeal = () => {
    setShowConfirmDialog(false);
    setMealToDelete(null);
  };

  const handleDeleteDish = async (dishId) => {
    if (!selectedMeal || !dishId) return;

    setDeletingDishId(dishId);
    try {
      const response = await mealPlanService.deleteDishFromMeal(
        mealPlanId,
        mealDayId,
        selectedMeal._id,
        dishId
      );

      if (response.success) {
        refreshMeals();
      } else {
        setError("Could not delete dish!");
      }
    } catch (err) {
      console.error("Error deleting dish:", err);
      setError("Could not delete dish!");
    } finally {
      setDeletingDishId(null);
    }
  };

  const handleOpenAddDishModal = () => {
    setIsAddingDish(true);
    setShowAddDishModal(true);
  };

  const handleCloseAddDishModal = () => {
    setShowAddDishModal(false);
    setIsAddingDish(false);
  };

  const getMealTimeStyle = (mealTime) => {
    const time = mealTime.toLowerCase();

    if (
      time.includes("sáng") ||
      time.includes("sang") ||
      time.includes("breakfast") ||
      time.match(/^([0-5]|0[0-9]):/) ||
      time.match(/^([0-9]):/) ||
      time.includes("am")
    ) {
      return {
        borderColor: "border-yellow-400",
        bgColor: "bg-yellow-50",
        icon: "🌞",
        iconColor: "text-yellow-500",
      };
    } else if (
      time.includes("trưa") ||
      time.includes("trua") ||
      time.includes("lunch") ||
      time.match(/^(1[0-2]|0[0-9]):/) ||
      time.includes("pm")
    ) {
      return {
        borderColor: "border-orange-400",
        bgColor: "bg-orange-50",
        icon: "☀️",
        iconColor: "text-orange-500",
      };
    } else if (
      time.includes("chiều") ||
      time.includes("chieu") ||
      time.includes("afternoon") ||
      time.match(/^(1[3-7]):/) ||
      time.includes("pm")
    ) {
      return {
        borderColor: "border-blue-300",
        bgColor: "bg-blue-50",
        icon: "🌤️",
        iconColor: "text-blue-500",
      };
    } else if (
      time.includes("tối") ||
      time.includes("toi") ||
      time.includes("dinner") ||
      time.includes("supper") ||
      time.match(/^(1[8-9]|2[0-3]):/) ||
      time.includes("pm")
    ) {
      return {
        borderColor: "border-indigo-600",
        bgColor: "bg-indigo-50",
        icon: "🌙",
        iconColor: "text-indigo-500",
      };
    } else {
      return {
        borderColor: "border-gray-300",
        bgColor: "bg-gray-50",
        icon: null,
        iconColor: "text-gray-500",
      };
    }
  };

  const renderMealItem = ({ item }) => {
    const { borderColor, bgColor, icon, iconColor } = getMealTimeStyle(item.mealTime);

    return (
      <TouchableOpacity
        className={`border-l-4 ${borderColor} border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-md`}
        onPress={() => handleMealSelect(item)}
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text className={`font-medium flex-row items-center`}>
              {icon && <Text className={`${iconColor} text-xl mr-2`}>{icon}</Text>}
              {item.mealName}
            </Text>
            <Text className="text-sm text-gray-500 ml-7">Time: {item.mealTime}</Text>
            <Text className="ml-7">{item.dishes?.length || 0} dishes</Text>
          </View>
          <TouchableOpacity
            className="p-1"
            onPress={() => handleRemoveMealFromDay(item._id)}
            disabled={deletingMealId === item._id}
          >
            <Text
              className={`${
                deletingMealId === item._id ? "text-gray-400" : "text-red-500"
              } text-base`}
            >
              {deletingMealId === item._id ? "Deleting..." : "🗑️"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && meals.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
        {!selectedMeal ? (
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity className="flex-row items-center" onPress={onBack}>
                <Ionicons name="arrow-back" size={16} color="#2563eb" />
                <Text className="text-blue-600 ml-2">Back</Text>
              </TouchableOpacity>
              {mealPlanType === "custom" && (
                <TouchableOpacity
                  className="bg-blue-600 px-4 py-2 rounded"
                  onPress={() => setShowAddMealModal(true)}
                >
                  <Text className="text-white">Add Meal</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="text-xl font-semibold mb-4">Meals on {date}</Text>
            <FlatList
              data={meals}
              renderItem={renderMealItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 80 }} // Add padding to avoid overlap with bottom navigation
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-4">
                  <Text className="text-center text-gray-500">No meals for this day yet.</Text>
                </View>
              }
            />
          </View>
        ) : (
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity className="flex-row items-center" onPress={handleBackToMeals}>
                <Ionicons name="arrow-back" size={16} color="#2563eb" />
                <Text className="text-blue-600 ml-2">Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${isAddingDish ? "bg-gray-400" : "bg-blue-600"} px-4 py-2 rounded`}
                onPress={handleOpenAddDishModal}
                disabled={isAddingDish}
              >
                <Text className="text-white">{isAddingDish ? "Adding..." : "Add Dish"}</Text>
              </TouchableOpacity>
            </View>
            <View className="mb-4">
              <Text className="text-xl font-semibold">Meal {selectedMeal.mealName}</Text>
              <Text className="text-gray-500">Time: {selectedMeal.mealTime}</Text>
            </View>
            <Text className="font-medium mb-2">Dish List:</Text>
            <FlatList
              data={selectedMeal.dishes}
              renderItem={({ item }) => (
                <DishCard dish={item} onDelete={handleDeleteDish} deletingDishId={deletingDishId} />
              )}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 80 }} // Add padding to avoid overlap with bottom navigation
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center">
                  <Text className="text-gray-500">No dishes in this meal yet.</Text>
                </View>
              }
            />
          </View>
        )}
      </Animated.View>

      {showAddDishModal && selectedMeal && (
        <AddDishToMeal
          mealPlanId={mealPlanId}
          mealDayId={mealDayId}
          mealId={selectedMeal._id}
          userId={user._id}
          onClose={handleCloseAddDishModal}
          onDishAdded={handleDishAdded}
        />
      )}

      {showAddMealModal && (
        <AddMealModal
          mealPlanId={mealPlanId}
          mealDayId={mealDayId}
          userId={user._id}
          onClose={() => setShowAddMealModal(false)}
          onMealAdded={handleMealAdded}
        />
      )}

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmDeleteMeal}
        onCancel={cancelDeleteMeal}
        message="Are you sure you want to delete this meal?"
      />
    </View>
  );
};

export default React.memo(Meals);
