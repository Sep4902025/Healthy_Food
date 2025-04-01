import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const Weight = ({ navigation }) => {
  const [selectedWeight, setSelectedWeight] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.weight) {
        setSelectedWeight(savedData.weight.toString());
      }
    };
    loadData();
  }, []);

  const validateWeight = async (weight) => {
    if (!weight.trim()) return "Please enter your weight.";
    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(weight)) return "Weight must contain only numbers.";
    const weightNum = Number(weight);
    if (weightNum <= 0) return "Weight must be greater than 0.";
    const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const weightGoal = savedData.weightGoal;
    if (weightGoal && weightNum === Number(weightGoal)) {
      return "Current weight cannot be the same as your goal weight.";
    }
    return "";
  };

  const handleNext = async () => {
    const validationError = await validateWeight(selectedWeight);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, weight: parseFloat(selectedWeight) };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Height");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Email")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={21} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Weight</Text>
      <Text className="text-center text-gray-600">Please enter your weight</Text>

      <View className="mt-4">
        <TextInput
          value={selectedWeight}
          onChangeText={setSelectedWeight}
          placeholder="Enter your weight (kg)"
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

export default Weight;
