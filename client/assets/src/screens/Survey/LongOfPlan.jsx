import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const longofplanGroups = [
  { longofplan: "3 months" },
  { longofplan: "6 months" },
  { longofplan: "9 months" },
  { longofplan: "12 months" },
];

const LongOfPlan = ({ navigation }) => {
  const [selectedLongOfPlan, setSelectedLongOfPlan] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.longOfPlan) {
        setSelectedLongOfPlan(savedData.longOfPlan);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedLongOfPlan) {
      alert("Please select how long you want to use the plan.");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, longOfPlan: selectedLongOfPlan };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("EatHabit");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("MealNumber")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={73.5} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Long Of Plan</Text>
      <Text className="text-center text-gray-600">How long do you want to use the plan?</Text>

      <ScrollView className="mt-4 space-y-4">
        {longofplanGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedLongOfPlan === item.longofplan ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedLongOfPlan(item.longofplan)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedLongOfPlan === item.longofplan ? "text-black" : "text-gray-700"
              }`}
            >
              {item.longofplan}
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

export default LongOfPlan;
