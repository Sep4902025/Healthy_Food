import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const Height = ({ navigation }) => {
  const [selectedHeight, setSelectedHeight] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.height) {
        setSelectedHeight(savedData.height.toString());
      }
    };
    loadData();
  }, []);

  const validateHeight = (height) => {
    if (!height.trim()) return "Please enter your height.";
    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(height)) return "Height must contain only numbers.";
    const heightNum = Number(height);
    if (heightNum <= 0) return "Height must be greater than 0.";
    return "";
  };

  const handleNext = async () => {
    const validationError = validateHeight(selectedHeight);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, height: parseFloat(selectedHeight) };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("WeightGoal");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Weight")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={26.25} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Height</Text>
      <Text className="text-center text-gray-600">Please enter your height (cm)</Text>

      <View className="mt-4">
        <TextInput
          value={selectedHeight}
          onChangeText={setSelectedHeight}
          placeholder="Enter your height"
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

export default Height;
