import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const sleeptimeGroups = [
  { sleeptime: "Less than 5 hours" },
  { sleeptime: "5-6 hours" },
  { sleeptime: "7-8 hours" },
  { sleeptime: "More than 8 hours" },
];

const SleepTime = ({ navigation }) => {
  const [selectedSleepTime, setSelectedSleepTime] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.sleepTime) {
        setSelectedSleepTime(savedData.sleepTime);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedSleepTime) {
      alert("Please select how long you sleep per day.");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, sleepTime: selectedSleepTime };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("ActivityLevel");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Goal")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={52.5} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Sleep Time</Text>
      <Text className="text-center text-gray-600">How long do you sleep per day?</Text>

      <ScrollView className="mt-4 space-y-4">
        {sleeptimeGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedSleepTime === item.sleeptime ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedSleepTime(item.sleeptime)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedSleepTime === item.sleeptime ? "text-black" : "text-gray-700"
              }`}
            >
              {item.sleeptime}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SleepTime;
