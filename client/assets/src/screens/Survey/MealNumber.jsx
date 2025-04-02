import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const mealnumberGroups = [
  { mealnumber: "1 meal" },
  { mealnumber: "2 meals" },
  { mealnumber: "3 meals" },
  { mealnumber: "4 meals" },
];

const MealNumber = ({ navigation }) => {
  const [selectedMealNumber, setSelectedMealNumber] = useState(null);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.mealNumber) {
        setSelectedMealNumber(savedData.mealNumber);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedMealNumber) {
      alert("Please select how many meals you eat per day.");
      return;
    }
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, mealNumber: selectedMealNumber };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("LongOfPlan");
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={68.25} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("Diet")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">
              Meal Number
            </Text>
            <Text className="text-base text-gray-600 mt-1">How many meals do you eat per day?</Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView
          className="mt-6 space-y-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
        >
          {mealnumberGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedMealNumber === item.mealnumber
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedMealNumber(item.mealnumber)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedMealNumber === item.mealnumber ? "text-white" : "text-black"
                }`}
              >
                {item.mealnumber}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            className="w-full bg-custom-green py-3 rounded-lg mt-6"
            onPress={handleNext}
          >
            <Text className="text-white text-lg font-semibold text-center">Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MealNumber;
