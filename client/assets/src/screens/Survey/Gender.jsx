import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";
import Male from "../../../assets/image/gender/male.jpg";
import Female from "../../../assets/image/gender/female.jpg";

const genderGroups = [
  { gender: "Male", img: Male },
  { gender: "Female", img: Female },
];

const Gender = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.gender) setSelectedGender(savedData.gender);
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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={36.75} />
        {/* Header Section with Back Button and Title */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("WeightGoal")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Gender</Text>
            <Text className="text-base text-gray-600 mt-1">Select your gender</Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="mt-6 space-y-5">
          {genderGroups.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                selectedGender === item.gender
                  ? "bg-custom-green border-gray-200"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => setSelectedGender(item.gender)}
            >
              <Text
                className={`text-lg font-semibold flex-1 text-left ${
                  selectedGender === item.gender ? "text-white" : "text-black"
                }`}
              >
                {item.gender}
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

export default Gender;
