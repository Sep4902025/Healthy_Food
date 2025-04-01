import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import Chay from "../../../assets/image/diet/chay.jpg";
import ThuanChay from "../../../assets/image/diet/thuanchay.jpg";
import BinhThuong from "../../../assets/image/diet/binhthuong.jpg";

const dietGroups = [
  { diet: "I am a vegetarian", img: Chay },
  { diet: "I am vegan", img: ThuanChay },
  { diet: "I am a normal eater", img: BinhThuong },
];

const Diet = ({ navigation }) => {
  const [selectedDiet, setSelectedDiet] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.diet) {
        setSelectedDiet(savedData.diet);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedDiet) {
      alert("Please select your diet before proceeding.");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, diet: selectedDiet };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("MealNumber");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("WaterDrink")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={63} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Diet</Text>
      <Text className="text-center text-gray-600">Choose your diet that you are following</Text>

      <ScrollView className="mt-4 space-y-4">
        {dietGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedDiet === item.diet ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedDiet(item.diet)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedDiet === item.diet ? "text-black" : "text-gray-700"
              }`}
            >
              {item.diet}
            </Text>
            <Image source={item.img} className="w-16 h-16 rounded-full object-cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Diet;
