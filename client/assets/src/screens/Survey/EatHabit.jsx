import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Checkbox from "expo-checkbox"; // Updated import
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const eathabitGroups = [
  { id: "lactose", label: "I am lactose intolerant", icon: "🥛" },
  { id: "gluten", label: "I don't eat gluten", icon: "🧁" },
  { id: "vegetarian", label: "I am a vegetarian", icon: "🥦" },
  { id: "vegan", label: "I am a vegan", icon: "🌿" },
  { id: "none", label: "There's none below", icon: "❌" },
];

const EatHabit = ({ navigation }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.eatHabit) {
        setSelectedItems(savedData.eatHabit);
      }
    };
    loadData();
  }, []);

  const toggleItemSelection = (id) => {
    if (id === "none") {
      setSelectedItems(["none"]);
    } else {
      if (selectedItems.includes("none")) {
        setSelectedItems([id]);
      } else {
        setSelectedItems((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
      }
    }
  };

  const isSelected = (id) => selectedItems.includes(id);

  const handleNext = async () => {
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, eatHabit: selectedItems };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("UnderDisease");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("LongOfPlan")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={78.75} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Eat Habit</Text>
      <Text className="text-center text-gray-600">Choose your eating habits</Text>

      <ScrollView className="mt-4 space-y-3">
        {eathabitGroups.map((eathabit) => (
          <TouchableOpacity
            key={eathabit.id}
            className={`flex-row items-center justify-between p-3 border rounded-xl ${
              isSelected(eathabit.id) ? "bg-yellow-50 border-yellow-400" : "bg-gray-100"
            }`}
            onPress={() => toggleItemSelection(eathabit.id)}
          >
            <View className="flex-row items-center space-x-3">
              <Checkbox
                value={isSelected(eathabit.id)}
                onValueChange={() => toggleItemSelection(eathabit.id)}
                disabled={eathabit.id !== "none" && selectedItems.includes("none")}
              />
              <Text
                className={`font-medium ${
                  isSelected(eathabit.id) ? "text-yellow-700" : "text-gray-700"
                }`}
              >
                {eathabit.label}
              </Text>
            </View>
            {eathabit.icon && <Text className="text-2xl">{eathabit.icon}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EatHabit;
