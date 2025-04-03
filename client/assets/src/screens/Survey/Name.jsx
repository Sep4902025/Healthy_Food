import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native"; // Thêm SafeAreaView
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const Name = ({ navigation }) => {
  const [selectedName, setSelectedName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.name) {
        setSelectedName(savedData.name);
      }
    };
    loadData();
  }, []);

  const validateName = (name) => {
    const lettersOnly = /^[A-Za-z\s]+$/;
    if (!name.trim()) return "Please enter your name.";
    if (!lettersOnly.test(name)) return "Name must contain only letters and spaces.";
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) return "Please enter both first and last name.";
    return "";
  };

  const handleNext = async () => {
    const validationError = validateName(selectedName);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, name: selectedName.trim() };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("PhoneNumber");
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <View className="w-full flex-row justify-center">
          <ProgressBar progress={5.25} />
        </View>

        <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Name</Text>
        <Text className="text-center text-gray-600">Please enter your full name</Text>

        <View className="w-full p-4">
          <TextInput
            value={selectedName}
            onChangeText={setSelectedName}
            placeholder="Enter your full name"
            className={`w-full p-4 rounded-lg border ${
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
    </SafeAreaView>
  );
};

export default Name;
