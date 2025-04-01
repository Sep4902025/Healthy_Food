import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import Male from "../../../assets/image/gender/male.jpg";
import Female from "../../../assets/image/gender/female.jpg";

const genderGroups = [
  { gender: "Male", img: Male },
  { gender: "Female", img: Female },
];

const Gender = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.gender) {
        setSelectedGender(savedData.gender);
      }
    };
    loadData();
  }, []);

  const handleNext = async () => {
    if (!selectedGender) {
      alert("Please select your gender!");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, gender: selectedGender };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Age");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("WeightGoal")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={36.75} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Gender</Text>
      <Text className="text-center text-gray-600">Select your gender</Text>

      <ScrollView className="mt-4 space-y-4">
        {genderGroups.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-4 rounded-lg shadow ${
              selectedGender === item.gender ? "bg-green-400" : "bg-gray-100"
            }`}
            onPress={() => setSelectedGender(item.gender)}
          >
            <Text
              className={`text-lg font-semibold flex-1 text-left ${
                selectedGender === item.gender ? "text-black" : "text-gray-700"
              }`}
            >
              {item.gender}
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

export default Gender;
