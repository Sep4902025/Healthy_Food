import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const Weight = ({ navigation }) => {
  const [selectedWeight, setSelectedWeight] = useState("");
  const [error, setError] = useState("");
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.weight) setSelectedWeight(savedData.weight.toString());
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
    if (weightGoal && weightNum === Number(weightGoal))
      return "Current weight cannot be the same as your goal weight.";
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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={21} />
        {/* Header Section with Back Button and Title */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("Email")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Weight</Text>
            <Text className="text-base text-gray-600 mt-1">Please enter your weight</Text>
          </View>
          <View className="w-10" />
        </View>

        <View className="w-full p-4">
          <TextInput
            value={selectedWeight}
            onChangeText={setSelectedWeight}
            placeholder="Enter your weight (kg)"
            keyboardType="numeric"
            className={`w-full p-4 rounded-xl border mt-1 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            onSubmitEditing={handleNext}
          />
          {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
        </View>

        <TouchableOpacity
          className="w-full bg-custom-green py-3 rounded-lg mt-6"
          onPress={handleNext}
        >
          <Text className="text-white text-lg font-semibold text-center">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Weight;
