import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const mealnumberGroups = [
  { mealnumber: "1 meal" },
  { mealnumber: "2 meals" },
  { mealnumber: "3 meals" },
  { mealnumber: "4 meals" },
];

const MealNumber = ({ navigation }) => {
  const [selectedMealNumber, setSelectedMealNumber] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.mealNumber) {
        setSelectedMealNumber(savedData.mealNumber);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedMealNumber) {
      alert("Please select how many meals you eat per day.");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, mealNumber: selectedMealNumber };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("LongOfPlan");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Diet")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={68.25} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Meal Number</Text>
      <Text className="text-center text-gray-600">How many meals do you eat per day?</Text>

      <ScrollView className="mt-4 space-y-4">
        {mealnumberGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedMealNumber === item.mealnumber ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedMealNumber(item.mealnumber)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedMealNumber === item.mealnumber ? "text-black" : "text-gray-700"
              }`}
            >
              {item.mealnumber}
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

export default MealNumber;
