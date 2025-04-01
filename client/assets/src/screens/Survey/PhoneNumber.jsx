import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const PhoneNumber = ({ navigation }) => {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.phoneNumber) {
        setSelectedPhoneNumber(savedData.phoneNumber);
      }
    };
    loadData();
  }, []);

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return "Please enter your phone number.";
    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(phone)) return "Phone number must contain only digits.";
    if (phone.length !== 10) return "Phone number must be exactly 10 digits.";
    return "";
  };

  const handleNext = async () => {
    const validationError = validatePhoneNumber(selectedPhoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, phoneNumber: selectedPhoneNumber };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Email");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Name")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={10.5} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Phone Number</Text>
      <Text className="text-center text-gray-600">Please enter your phone number</Text>

      <View className="mt-4">
        <TextInput
          value={selectedPhoneNumber}
          onChangeText={setSelectedPhoneNumber}
          placeholder="Enter your phone number"
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

export default PhoneNumber;
