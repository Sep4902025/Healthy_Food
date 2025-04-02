import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const PhoneNumber = ({ navigation }) => {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.phoneNumber) setSelectedPhoneNumber(savedData.phoneNumber);
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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={10.5} />
        {/* Header Section with Back Button and Title */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-teal-500 border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("Name")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">
              Phone Number
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Please enter your phone number</Text>
          </View>
          {/* Empty View for balancing the layout */}
          <View className="w-10" />
        </View>

        <View className="w-full p-4">
          <TextInput
            value={selectedPhoneNumber}
            onChangeText={setSelectedPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="numeric"
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

export default PhoneNumber;
