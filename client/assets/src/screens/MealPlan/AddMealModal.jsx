import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For the close icon
import DateTimePicker from "@react-native-community/datetimepicker"; // Import DateTimePicker
import mealPlanService from "../../services/mealPlanService";

const AddMealModal = ({ mealPlanId, mealDayId, userId, onClose, onMealAdded }) => {
  const [newMealData, setNewMealData] = useState({
    mealName: "",
    mealTime: "",
    userId: userId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false); // State to control time picker visibility
  const [selectedTime, setSelectedTime] = useState(new Date()); // Default time

  const handleSubmit = async () => {
    if (!newMealData.mealName || !newMealData.mealTime) {
      setError("Please fill in all meal information!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await mealPlanService.addMealToDay(mealPlanId, mealDayId, newMealData);

      if (response.success) {
        setNewMealData({ mealName: "", mealTime: "", userId: userId });
        onMealAdded();
        onClose();
      } else {
        setError("Could not add the meal!");
      }
    } catch (err) {
      console.error("Error adding meal:", err);
      setError("Could not add the meal!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle time selection from the picker
  const onTimeChange = (event, selected) => {
    const currentTime = selected || selectedTime;
    setShowTimePicker(false); // Hide picker after selection
    setSelectedTime(currentTime);

    // Format the time (e.g., "08:00 AM")
    const formattedTime = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setNewMealData({ ...newMealData, mealTime: formattedTime });
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-lg w-11/12 max-w-md p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Add New Meal</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {error && (
            <View className="mb-4 p-2 bg-red-100 border border-red-300 rounded">
              <Text className="text-red-700">{error}</Text>
            </View>
          )}

          <View className="space-y-4">
            <View>
              <Text className="text-base font-medium text-gray-700 mb-1">Meal Name</Text>
              <TextInput
                value={newMealData.mealName}
                onChangeText={(text) => setNewMealData({ ...newMealData, mealName: text })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., Breakfast, Lunch..."
              />
            </View>
            <View className="mt-1">
              <Text className="text-base font-medium text-gray-700 mb-1">Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <Text className={newMealData.mealTime ? "text-black" : "text-gray-400"}>
                  {newMealData.mealTime || "E.g., 08:00 AM"}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time" // Set mode to time
                  display="default" // Use "spinner" for a different style if preferred
                  onChange={onTimeChange}
                />
              )}
            </View>
            <View className="flex-row justify-end gap-2 mt-2">
              <TouchableOpacity
                onPress={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className={`${isSubmitting ? "bg-gray-400" : "bg-blue-600"} px-4 py-2 rounded`}
              >
                <Text className="text-white">{isSubmitting ? "Adding..." : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddMealModal;
