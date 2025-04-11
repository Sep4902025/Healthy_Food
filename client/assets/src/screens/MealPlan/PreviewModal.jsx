import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const PreviewModal = ({ isOpen, onClose, previewData }) => {
  if (!isOpen || !previewData) return null;

  const handleContactSupport = () => {
    Toast.show({
      type: "info",
      text1: "Feature Under Development",
      text2: "Please contact us via email: support@example.com",
    });
  };

  // Calculate total calories for a meal and round to the nearest integer
  const calculateMealCalories = (dishes) => {
    const total = dishes.reduce((total, dish) => total + (dish.calories || 0), 0);
    return Math.round(total);
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%] p-5">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-800">Meal Plan Preview</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Meal Plan Details */}
          <View className="mb-2 space-y-1">
            <Text className="text-gray-600 text-sm">
              <Text className="font-bold">Title:</Text> {previewData.title} |{" "}
              <Text className="font-bold">Duration:</Text> {previewData.duration} days
            </Text>
            <Text className="text-gray-600 text-sm">
              <Text className="font-bold">Start:</Text>{" "}
              {new Date(previewData.startDate).toLocaleDateString()} -{" "}
              <Text className="font-bold">End:</Text>{" "}
              {new Date(previewData.endDate).toLocaleDateString()}
            </Text>
            <Text className="text-gray-600 text-sm">
              <Text className="font-bold">Price:</Text> {previewData.price.toLocaleString()} VND
            </Text>
          </View>

          {/* Day 1 Meals */}
          <Text className="text-base font-medium text-gray-800 mb-1">Day 1</Text>
          {previewData.days && previewData.days.length > 0 ? (
            <View className="border border-gray-200 p-3 rounded-lg">
              {/* Scrollable container for meals */}
              <ScrollView className="max-h-48">
                {previewData.days[0].meals.map((meal, index) => (
                  <View key={index} className="mb-2 last:mb-0">
                    <Text className="font-medium text-sm text-gray-700">
                      <Text className="font-bold">Meal {index + 1}:</Text> {meal.mealName} at{" "}
                      {meal.mealTime} ({calculateMealCalories(meal.dishes)} kcal)
                    </Text>
                    {/* Dishes displayed as a grid */}
                    <View className="mt-1 flex-row flex-wrap">
                      {meal.dishes.map((dish, dishIndex) => (
                        <View
                          key={dishIndex}
                          className="bg-gray-50 rounded-lg p-2 shadow-sm border w-[48%] m-1 items-center"
                        >
                          {/* Dish Image */}
                          {dish.imageUrl && (
                            <Image
                              source={{ uri: dish.imageUrl }}
                              className="w-16 h-16 rounded-md mb-1"
                              resizeMode="cover"
                            />
                          )}
                          {/* Dish Details */}
                          <Text className="font-medium text-xs text-gray-600 text-center">
                            {dish.name}
                          </Text>
                          <Text className="text-xs text-gray-600 text-center">
                            Cal: {dish.calories} kcal | Protein: {dish.protein}g
                          </Text>
                          <Text className="text-xs text-gray-600 text-center">
                            Carbs: {dish.carbs}g | Fat: {dish.fat}g
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Footer Text */}
              <Text className="text-gray-500 text-xs mt-2">
                This is a preview of the first day. To view the full plan, please proceed with
                payment.
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                After payment, you can message the system to adjust your schedule.
              </Text>
              <TouchableOpacity onPress={handleContactSupport}>
                <Text className="text-blue-500 text-xs mt-1">Contact Support</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-gray-500 text-sm">No meals available for preview.</Text>
          )}

          {/* Close Button */}
          <View className="mt-2 flex-row justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-300 active:bg-gray-400 px-3 py-1 rounded-lg"
            >
              <Text className="text-gray-800 text-sm">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PreviewModal;
