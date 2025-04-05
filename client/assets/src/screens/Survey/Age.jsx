import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";
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
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.age) setSelectedAge(savedData.age);
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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={42} />
        {/* Header Section with Back Button and Title */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("Gender")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Age</Text>
            <Text className="text-base text-gray-600 mt-1">Select your age</Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="mt-6 space-y-5">
          {ageGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedAge === item.age
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedAge(item.age)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedAge === item.age ? "text-white" : "text-black"
                }`}
              >
                {item.age}
              </Text>
              <Image source={item.img} className="w-16 h-16 rounded-full object-cover" />
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

export default Age;
