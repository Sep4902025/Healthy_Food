import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import Age1825 from "../../../assets/image/age/18-25.png";
import Age2635 from "../../../assets/image/age/26-35.png";
import Age3645 from "../../../assets/image/age/36-45.png";
import Age46 from "../../../assets/image/age/46.png";

const ageGroups = [
  { age: "18-25", img: Age1825 },
  { age: "26-35", img: Age2635 },
  { age: "36-45", img: Age3645 },
  { age: "46+", img: Age46 },
];

const Age = ({ navigation }) => {
  const [selectedAge, setSelectedAge] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.age) {
        setSelectedAge(savedData.age);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedAge) {
      alert("Please select your age before proceeding.");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, age: selectedAge };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Goal");
  };

  return (
    <View className="flex-1 w-1/2 mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("Gender")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={42} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">AGE</Text>
      <Text className="text-center text-gray-600">Select your age</Text>

      <ScrollView className="mt-4 space-y-4">
        {ageGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedAge === item.age ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedAge(item.age)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedAge === item.age ? "text-black" : "text-gray-700"
              }`}
            >
              {item.age}
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

export default Age;
