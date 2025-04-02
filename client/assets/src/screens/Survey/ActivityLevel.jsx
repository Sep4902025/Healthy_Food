import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const activitylevelGroups = [
  { activitylevel: "Sedentary", value: 1.2, label: "Little or no exercise" },
  { activitylevel: "Lightly active", value: 1.375, label: "Light exercise (1-3 days per week)" },
  {
    activitylevel: "Moderately active",
    value: 1.55,
    label: "Moderate exercise (3-5 days per week)",
  },
  { activitylevel: "Highly active", value: 1.725, label: "Heavy exercise (6-7 days per week)" },
  { activitylevel: "Very active", value: 1.9, label: "Very intense exercise or physical job" },
];

const ActivityLevel = ({ navigation }) => {
  const [selectedActivityLevel, setSelectedActivityLevel] = useState(null);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.activityLevel?.name) setSelectedActivityLevel(savedData.activityLevel.name);
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedActivityLevel) {
      alert("Please select your daily activity level.");
      return;
    }
    const selectedItem = activitylevelGroups.find(
      (item) => item.activitylevel === selectedActivityLevel
    );
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      activityLevel: { name: selectedItem.activitylevel, value: selectedItem.value },
    };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("WaterDrink");
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={52.5} />
        {/* Header Section with Back Button and Title */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("SleepTime")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">
              Activity Level
            </Text>
            <Text className="text-base text-gray-600 mt-1">What is your daily activity level?</Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="mt-6 space-y-5">
          {activitylevelGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedActivityLevel === item.activitylevel
                  ? "bg-custom-green border-gray-200 "
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedActivityLevel(item.activitylevel)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedActivityLevel === item.activitylevel ? "text-white" : "text-black"
                }`}
              >
                {item.label || item.activitylevel}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

export default ActivityLevel;
