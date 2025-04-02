import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon"; // Import AntDesignIcon

const Height = ({ navigation }) => {
  const [selectedHeight, setSelectedHeight] = useState("");
  const [error, setError] = useState("");
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.height) setSelectedHeight(savedData.height.toString());
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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={26.25} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("Weight")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Height</Text>
            <Text className="text-base text-gray-600 mt-1">Please enter your height (cm)</Text>
          </View>
          <View className="w-10" />
        </View>

        <View className="mt-6">
          <TextInput
            value={selectedHeight}
            onChangeText={setSelectedHeight}
            placeholder="Enter your height"
            keyboardType="numeric"
            className={`w-full p-4 rounded-xl border ${
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

export default Height;
