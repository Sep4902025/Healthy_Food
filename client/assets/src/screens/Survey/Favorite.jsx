import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon"; // Import AntDesignIcon

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
  const [backPressed, setBackPressed] = useState(false);

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
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-4 mt-8">
        <ProgressBar progress={94.5} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("UnderDisease")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Favorite</Text>
            <Text className="text-base text-gray-600 mt-1">Select your favorite food</Text>
          </View>
          <View className="w-10" />
        </View>

        <View className="flex-row items-center justify-start gap-2 my-4">
          <Checkbox
            value={
              selectedItemIds.length ===
              favoriteGroups
                .flatMap((c) => c.items)
                .filter((item) => !hatedItemIds.includes(item.id)).length
            }
            onValueChange={(value) => (value ? selectAll() : deselectAll())}
          />
          <Text className="text-lg">Select All</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
        >
          {favoriteGroups.map((group, index) => (
            <View key={index} className="mb-4">
              <View className="flex-row items-center space-x-2">
                <Text className="font-bold text-lg mr-1">{group.icon}</Text>
                <Text className="font-bold text-lg">{group.name}</Text>
              </View>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className={`p-2 rounded-lg ${
                      selectedItemIds.includes(item.id)
                        ? "bg-custom-green"
                        : hatedItemIds.includes(item.id)
                        ? "bg-red-200"
                        : "bg-gray-100 border border-gray-300"
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

export default Favorite;
