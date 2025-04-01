import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Checkbox from "expo-checkbox"; // Updated import
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";

const favoriteGroups = [
  {
    name: "Vegetables",
    icon: "🥦",
    items: [
      { id: "67d78db6bdd60cc0bf1c1c6b", name: "Garlic" },
      { id: "67d78db6bdd60cc0bf1c1c6c", name: "Shallot" },
      { id: "67d78db6bdd60cc0bf1c1c6f", name: "Bean Sprouts" },
      { id: "67d78db6bdd60cc0bf1c1c70", name: "Banana Flower" },
      { id: "67d78db6bdd60cc0bf1c1c73", name: "Scallion" },
      { id: "67d7919bbdd60cc0bf1c1cac", name: "Green Onion" },
    ],
  },
  {
    name: "Meat",
    icon: "🍖",
    items: [
      { id: "67d78db6bdd60cc0bf1c1c65", name: "Beef Shank" },
      { id: "67d78db6bdd60cc0bf1c1c66", name: "Pork Hock" },
    ],
  },
  {
    name: "Dairy",
    icon: "🥛",
    items: [
      { id: "67d6868218855f47c0945154", name: "Butter" },
      { id: "67d6868218855f47c0945155", name: "Milk" },
    ],
  },
  { name: "Fruits", icon: "🍎", items: [{ id: "67d78db6bdd60cc0bf1c1c71", name: "Lime" }] },
  {
    name: "Grains",
    icon: "🌾",
    items: [
      { id: "67d6868218855f47c094514f", name: "Flour" },
      { id: "67d78db6bdd60cc0bf1c1c6e", name: "Rice Vermicelli" },
      { id: "67d7919bbdd60cc0bf1c1ca9", name: "Rice Noodles" },
    ],
  },
  {
    name: "Liquid",
    icon: "💧",
    items: [
      { id: "67d6868218855f47c0945150", name: "Water" },
      { id: "67d78db6bdd60cc0bf1c1c6d", name: "Beef Broth" },
    ],
  },
  {
    name: "Leavening Agent",
    icon: "🧀",
    items: [{ id: "67d6868218855f47c0945151", name: "Yeast" }],
  },
  {
    name: "Seasoning",
    icon: "🧂",
    items: [
      { id: "67d6868218855f47c0945152", name: "Salt" },
      { id: "67d6868218855f47c0945153", name: "Sugar" },
      { id: "67d78db6bdd60cc0bf1c1c68", name: "Shrimp Paste" },
      { id: "67d78db6bdd60cc0bf1c1c69", name: "Fish Sauce" },
    ],
  },
  { name: "Spice", icon: "🌶️", items: [{ id: "67d78db6bdd60cc0bf1c1c6a", name: "Chili Powder" }] },
  {
    name: "Herb",
    icon: "🌿",
    items: [
      { id: "67d78db6bdd60cc0bf1c1c67", name: "Lemongrass" },
      { id: "67d78db6bdd60cc0bf1c1c72", name: "Coriander" },
      { id: "67d7919bbdd60cc0bf1c1cab", name: "Cilantro" },
    ],
  },
  { name: "Protein", icon: "🥚", items: [{ id: "67d6868218855f47c0945156", name: "Egg" }] },
];

const Favorite = ({ navigation }) => {
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [hatedItemIds, setHatedItemIds] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.favorite) setSelectedItemIds(savedData.favorite);
      if (savedData.hate) setHatedItemIds(savedData.hate);
    };
    loadData();
  }, []);

  const toggleItemSelection = (id) => {
    if (hatedItemIds.includes(id)) return;
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allItemIds = favoriteGroups
      .flatMap((group) => group.items.map((item) => item.id))
      .filter((id) => !hatedItemIds.includes(id));
    setSelectedItemIds(allItemIds);
  };

  const deselectAll = () => {
    setSelectedItemIds([]);
  };

  const handleNext = async () => {
    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, favorite: selectedItemIds };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Hate");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("UnderDisease")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={94.5} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Favorite</Text>
      <Text className="text-center text-gray-600">Select your favorite food</Text>

      <View className="flex-row items-center justify-start space-x-2 my-4">
        <Checkbox
          value={
            selectedItemIds.length ===
            favoriteGroups.flatMap((c) => c.items).filter((item) => !hatedItemIds.includes(item.id))
              .length
          }
          onValueChange={(value) => (value ? selectAll() : deselectAll())}
        />
        <Text>Select All</Text>
      </View>

      <ScrollView>
        {favoriteGroups.map((group, index) => (
          <View key={index} className="mb-4">
            <View className="flex-row items-center space-x-2">
              <Text className="font-bold text-lg">{group.icon}</Text>
              <Text className="font-bold text-lg">{group.name}</Text>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className={`p-2 rounded-lg ${
                    selectedItemIds.includes(item.id)
                      ? "bg-green-400"
                      : hatedItemIds.includes(item.id)
                      ? "bg-red-200"
                      : "bg-gray-100"
                  }`}
                  onPress={() => toggleItemSelection(item.id)}
                  disabled={hatedItemIds.includes(item.id)}
                >
                  <Text
                    className={`${
                      selectedItemIds.includes(item.id)
                        ? "text-white"
                        : hatedItemIds.includes(item.id)
                        ? "text-gray-600"
                        : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Favorite;
