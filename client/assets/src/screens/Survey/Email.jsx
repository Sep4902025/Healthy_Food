import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const Email = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.email) setEmail(savedData.email);
    };
    loadData();
  }, []);

  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) return "Please enter your email.";
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(emailValue))
      return "Please enter a valid Gmail address (e.g., example@gmail.com).";
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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={15.75} />
        {/* Header Section with Back Button and Title */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("PhoneNumber")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">
              Email Contact
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              Please enter your email can contact
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <View className="w-full p-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
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

export default Email;
