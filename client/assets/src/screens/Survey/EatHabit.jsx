import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const eathabitGroups = [
  { id: "lactose", label: "I am lactose intolerant", icon: "🥛" },
  { id: "gluten", label: "I don't eat gluten", icon: "🧁" },
  { id: "vegetarian", label: "I am a vegetarian", icon: "🥦" },
  { id: "vegan", label: "I am a vegan", icon: "🌿" },
  { id: "none", label: "There's none below", icon: "❌" },
];

const EatHabit = ({ navigation }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.eatHabit) {
        setSelectedItems(savedData.eatHabit);
      }
    };
    loadData();
  }, []);

  const toggleItemSelection = (id) => {
    if (id === "none") {
      setSelectedItems(["none"]);
    } else {
      if (selectedItems.includes("none")) {
        setSelectedItems([id]);
      } else {
        setSelectedItems((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
      }
    }
  };

  const isSelected = (id) => selectedItems.includes(id);

  const handleNext = async () => {
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, eatHabit: selectedItems };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("UnderDisease");
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={78.75} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("LongOfPlan")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Eat Habit</Text>
            <Text className="text-base text-gray-600 mt-1">Choose your eating habits</Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="mt-6 space-y-5">
          {eathabitGroups.map((eathabit) => (
            <TouchableOpacity
              key={eathabit.id}
              className={`flex-row items-center justify-between p-4 rounded-xl border shadow-sm mt-1 ${
                isSelected(eathabit.id)
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => toggleItemSelection(eathabit.id)}
            >
              <View className="flex-row items-center gap-2">
                <Checkbox
                  value={isSelected(eathabit.id)}
                  onValueChange={() => toggleItemSelection(eathabit.id)}
                  disabled={eathabit.id !== "none" && selectedItems.includes("none")}
                />
                <Text
                  className={`text-lg font-semibold ${
                    isSelected(eathabit.id) ? "text-white" : "text-black"
                  }`}
                >
                  {eathabit.label}
                </Text>
              </View>
              {eathabit.icon && <Text className="text-2xl">{eathabit.icon}</Text>}
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

export default EatHabit;
