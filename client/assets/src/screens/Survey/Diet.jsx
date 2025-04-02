import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";
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
  const [backPressed, setBackPressed] = useState(false);

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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={63} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("WaterDrink")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Diet</Text>
            <Text className="text-base text-gray-600 mt-1">
              Choose your diet that you are following
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="mt-6 space-y-5">
          {dietGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedDiet === item.diet
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedDiet(item.diet)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedDiet === item.diet ? "text-white" : "text-black"
                }`}
              >
                {item.diet}
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

export default Diet;
