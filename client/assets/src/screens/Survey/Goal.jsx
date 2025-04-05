import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";
import Thin from "../../../assets/image/goal/thin.jpg";
import Fat from "../../../assets/image/goal/fat.jpg";

const goalGroups = [
  { goal: "Muscle gain", img: Thin },
  { goal: "Fat loss", img: Fat },
];

const Goal = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.goal) {
        setSelectedGoal(savedData.goal);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedGoal) {
      alert("Please select your goal!");
      return;
    }
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, goal: selectedGoal };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("SleepTime");
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={47.25} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("Age")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Goal</Text>
            <Text className="text-base text-gray-600 mt-1">Select your goal</Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView
          className="mt-6 space-y-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
        >
          {goalGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedGoal === item.goal
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedGoal(item.goal)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedGoal === item.goal ? "text-white" : "text-black"
                }`}
              >
                {item.goal}
              </Text>
              <Image source={item.img} className="w-16 h-16 rounded-full object-cover" />
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

export default Goal;
