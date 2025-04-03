import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const longofplanGroups = [
  { longofplan: "3 months" },
  { longofplan: "6 months" },
  { longofplan: "9 months" },
  { longofplan: "12 months" },
];

const LongOfPlan = ({ navigation }) => {
  const [selectedLongOfPlan, setSelectedLongOfPlan] = useState(null);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.longOfPlan) {
        setSelectedLongOfPlan(savedData.longOfPlan);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedLongOfPlan) {
      alert("Please select how long you want to use the plan.");
      return;
    }
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, longOfPlan: selectedLongOfPlan };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("EatHabit");
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={73.5} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("MealNumber")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">
              Long Of Plan
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              How long do you want to use the plan?
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="mt-6 space-y-5">
          {longofplanGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedLongOfPlan === item.longofplan
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedLongOfPlan(item.longofplan)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedLongOfPlan === item.longofplan ? "text-white" : "text-black"
                }`}
              >
                {item.longofplan}
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

export default LongOfPlan;
