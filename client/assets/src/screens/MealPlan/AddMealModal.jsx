import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For the close icon; install with `npm install @expo/vector-icons`
import mealPlanService from "../../services/mealPlanService";

const AddMealModal = ({ mealPlanId, mealDayId, userId, onClose, onMealAdded }) => {
  console.log("USERID", userId);

  const [newMealData, setNewMealData] = useState({
    mealName: "",
    mealTime: "",
    userId: userId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!newMealData.mealName || !newMealData.mealTime) {
      setError("Please fill in all meal information!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await mealPlanService.addMealToDay(mealPlanId, mealDayId, newMealData);

      if (response.success) {
        setNewMealData({ mealName: "", mealTime: "" });
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
              <Text className="text-sm font-medium text-gray-700 mb-1">Meal Name</Text>
              <TextInput
                value={newMealData.mealName}
                onChangeText={(text) => setNewMealData({ ...newMealData, mealName: text })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., Breakfast, Lunch..."
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Time</Text>
              <TextInput
                value={newMealData.mealTime}
                onChangeText={(text) => setNewMealData({ ...newMealData, mealTime: text })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., 08:00 AM"
              />
            </View>
            <View className="flex-row justify-end space-x-3">
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
