import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const activitylevelGroups = [
  { activitylevel: "Sedentary", value: 1.2, label: "Little or no exercise" },
  { activitylevel: "Lightly active", value: 1.375, label: "Light exercise (1-3 days per week)" },
  {
    activitylevel: "Moderately active",
    value: 1.55,
    label: "Moderate exercise (3-5 days per week)",
  },
  { activitylevel: "Highly active", value: 1.725, label: "Heavy exercise (6-7 days per week)" },
  { activitylevel: "Very active", value: 1.9, label: "Very intense exercise or physical job" },
];

const ActivityLevel = ({ navigation }) => {
  const [selectedActivityLevel, setSelectedActivityLevel] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.activityLevel?.name) {
        setSelectedActivityLevel(savedData.activityLevel.name);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedActivityLevel) {
      alert("Please select your daily activity level.");
      return;
    }

    const selectedItem = activitylevelGroups.find(
      (item) => item.activitylevel === selectedActivityLevel
    );
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      activityLevel: { name: selectedItem.activitylevel, value: selectedItem.value },
    };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    console.log("🚀 Dữ liệu ActivityLevel đã lưu:", updatedData);
    navigation.navigate("WaterDrink");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("SleepTime")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={52.5} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Activity Level</Text>
      <Text className="text-center text-gray-600">What is your daily activity level?</Text>

      <ScrollView className="mt-4 space-y-4">
        {activitylevelGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedActivityLevel === item.activitylevel ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedActivityLevel(item.activitylevel)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedActivityLevel === item.activitylevel ? "text-black" : "text-gray-700"
              }`}
            >
              {item.label || item.activitylevel}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActivityLevel;
