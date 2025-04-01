import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import Thin from "../../../assets/image/goal/thin.jpg";
import Fat from "../../../assets/image/goal/fat.jpg";

const goalGroups = [
  { goal: "Muscle gain", img: Thin },
  { goal: "Fat loss", img: Fat },
];

const Goal = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.goal) {
        setSelectedGoal(savedData.goal);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedGoal) {
      alert("Please select your goal!");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, goal: selectedGoal };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("SleepTime");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Age")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={47.25} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Goal</Text>
      <Text className="text-center text-gray-600">Select your goal</Text>

      <ScrollView className="mt-4 space-y-4">
        {goalGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedGoal === item.goal ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedGoal(item.goal)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedGoal === item.goal ? "text-black" : "text-gray-700"
              }`}
            >
              {item.goal}
            </Text>
            <Image source={item.img} className="w-16 h-16 rounded-full object-cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Goal;
