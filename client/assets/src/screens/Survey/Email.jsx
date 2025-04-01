import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const Email = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.email) {
        setEmail(savedData.email);
      }
    };
    loadData();
  }, []);

  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return "Please enter your email.";
    }
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(emailValue)) {
      return "Please enter a valid Gmail address (e.g., example@gmail.com).";
    }
    return "";
  };

  const handleNext = async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, email };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Weight");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("PhoneNumber")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={15.75} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Email</Text>
      <Text className="text-center text-gray-600">Please enter your email</Text>

      <View className="mt-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
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

export default Email;
