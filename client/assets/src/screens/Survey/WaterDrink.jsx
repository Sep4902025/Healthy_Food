import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const waterdrinkGroups = [
  { waterdrink: "0,5 - 1,5L (2-6 cups)" },
  { waterdrink: "1,5 - 2,5L (7-10 cups)" },
  { waterdrink: "More than 2,5L (More than 10 cups)" },
  { waterdrink: "No count, depends on the day" },
];

const WaterDrink = ({ navigation }) => {
  const [selectedWaterDrink, setSelectedWaterDrink] = useState(null);
  const [backPressed, setBackPressed] = useState(false);

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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={57.75} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("ActivityLevel")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">
              Water Drink
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              How much water do you drink per day?
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="mt-6 space-y-5">
          {waterdrinkGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedWaterDrink === item.waterdrink
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedWaterDrink(item.waterdrink)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedWaterDrink === item.waterdrink ? "text-white" : "text-black"
                }`}
              >
                {item.waterdrink}
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

export default WaterDrink;
