import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const WeightGoal = ({ navigation }) => {
  const [selectedWeightGoal, setSelectedWeightGoal] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.weightGoal) {
        setSelectedWeightGoal(savedData.weightGoal.toString());
      }
    };
    loadData();
  }, []);

  const validateWeightGoal = async (weightGoal) => {
    if (!weightGoal.trim()) return "Please enter your goal weight.";
    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(weightGoal)) return "Goal weight must contain only numbers.";
    const weightGoalNum = Number(weightGoal);
    if (weightGoalNum <= 0) return "Goal weight must be greater than 0.";
    const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const weight = savedData.weight;
    if (weight && weightGoalNum === Number(weight)) {
      return "Goal weight cannot be the same as your current weight.";
    }
    return "";
  };

  const handleNext = async () => {
    const validationError = await validateWeightGoal(selectedWeightGoal);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, weightGoal: parseFloat(selectedWeightGoal) };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Gender");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Height")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={31.5} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Weight Goal</Text>
      <Text className="text-center text-gray-600">Please enter your goal weight</Text>

      <View className="mt-4">
        <TextInput
          value={selectedWeightGoal}
          onChangeText={setSelectedWeightGoal}
          placeholder="Enter your goal weight (kg)"
          keyboardType="numeric"
          className={`w-full p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          onSubmitEditing={handleNext}
        />
        {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
      </View>

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WeightGoal;
