import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const waterdrinkGroups = [
  { waterdrink: "0,5 - 1,5L (2-6 cups)" },
  { waterdrink: "1,5 - 2,5L (7-10 cups)" },
  { waterdrink: "More than 2,5L (More than 10 cups)" },
  { waterdrink: "No count, depends on the day" },
];

const WaterDrink = ({ navigation }) => {
  const [selectedWaterDrink, setSelectedWaterDrink] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.waterDrink) {
        setSelectedWaterDrink(savedData.waterDrink);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedWaterDrink) {
      alert("Please select your daily water intake before proceeding.");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, waterDrink: selectedWaterDrink };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Diet");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("ActivityLevel")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={57.75} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Water Drink</Text>
      <Text className="text-center text-gray-600">How much water do you drink per day?</Text>

      <ScrollView className="mt-4 space-y-4">
        {waterdrinkGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedWaterDrink === item.waterdrink ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedWaterDrink(item.waterdrink)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedWaterDrink === item.waterdrink ? "text-black" : "text-gray-700"
              }`}
            >
              {item.waterdrink}
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

export default WaterDrink;
