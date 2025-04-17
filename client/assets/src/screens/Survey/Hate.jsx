import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { updateUserAct } from "../../redux/reducers/userReducer";
import { userSelector } from "../../redux/selectors/selector";
import ProgressBar from "./ProgressBar";
import quizService from "../../services/quizService";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";

const hateGroups = [
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

const Hate = ({ navigation }) => {
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState([]);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
        // Ensure hate and favorite are arrays of strings
        const hateData = Array.isArray(savedData.hate) ? savedData.hate.map(String) : [];
        const favoriteData = Array.isArray(savedData.favorite)
          ? savedData.favorite.map(String)
          : [];
        setSelectedItemIds(hateData);
        setFavoriteItemIds(favoriteData);
        console.log("Loaded hate:", hateData);
        console.log("Loaded favorite:", favoriteData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const toggleItemSelection = (id) => {
    const idAsString = String(id); // Ensure the ID is a string
    console.log("Toggling ID:", idAsString);
    console.log("Is in favoriteItemIds?", favoriteItemIds.includes(idAsString));
    if (favoriteItemIds.includes(idAsString)) return;
    setSelectedItemIds((prev) => {
      const newSelected = prev.includes(idAsString)
        ? prev.filter((i) => i !== idAsString)
        : [...prev, idAsString];
      console.log("Updated selectedItemIds:", newSelected);
      return newSelected;
    });
  };

  const selectAll = () => {
    const allItemIds = hateGroups
      .flatMap((group) => group.items.map((item) => String(item.id)))
      .filter((id) => !favoriteItemIds.includes(id));
    setSelectedItemIds(allItemIds);
    console.log("Select All - selectedItemIds:", allItemIds);
  };

  const deselectAll = () => {
    setSelectedItemIds([]);
    console.log("Deselect All - selectedItemIds:", []);
  };

  const handleNext = async () => {
    try {
      console.log("SEND");

      const rawData = await AsyncStorage.getItem("quizData");
      console.log("Raw quizData:", rawData);
      const currentData = rawData ? JSON.parse(rawData) : {};
      const updatedData = { ...currentData, hate: selectedItemIds };
      await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));

      if (!user || !user._id || !user.email || !user.username) {
        Alert.alert("Error", "User information is incomplete. Please log in again!");
        console.error("❌ Missing user information in Redux:", user);
        return;
      }

      const requiredFields = [
        "age",
        "diet",
        "eatHabit",
        "longOfPlan",
        "mealNumber",
        "goal",
        "sleepTime",
        "waterDrink",
        "weight",
        "weightGoal",
        "height",
        "activityLevel",
        "gender",
        "underDisease",
      ];
      const missingFields = requiredFields.filter(
        (field) => !currentData[field] && currentData[field] !== 0
      );
      if (missingFields.length > 0) {
        Alert.alert(
          "Error",
          `Please complete the previous steps. Missing fields: ${missingFields.join(", ")}`
        );
        console.error("❌ Missing fields in quizData:", missingFields);
        return;
      }

      const finalData = {
        userId: user._id,
        email: user.email,
        name: user.username,
        age: currentData.age || null,
        diet: currentData.diet || null,
        eatHabit: currentData.eatHabit || [],
        longOfPlan: currentData.longOfPlan || null,
        mealNumber: currentData.mealNumber || "0",
        goal: currentData.goal || null,
        sleepTime: currentData.sleepTime || null,
        waterDrink: currentData.waterDrink || null,
        weight: currentData.weight || 0,
        weightGoal: currentData.weightGoal || 0,
        height: currentData.height || 0,
        activityLevel: currentData.activityLevel ? currentData.activityLevel.value : 1.2,
        gender: currentData.gender || null,
        phoneNumber: currentData.phoneNumber || null,
        underDisease: currentData.underDisease || [],
        theme: currentData.theme || false,
        isDelete: false,
        userPreference: {
          favorite: currentData.favorite || [],
          hate: selectedItemIds,
        },
      };
      console.log("Final data to submit:", finalData);

      const result = await quizService.submitQuizData(finalData);
      console.log("API result:", result);

      if (result.success) {
        const responseData = result.data.data || result.data;
        if (responseData) {
          const updatedUser = responseData.user
            ? {
                ...responseData.user,
                userPreference: responseData.userPreference,
              }
            : {
                ...user,
                userPreferenceId: responseData.userPreference?._id,
                userPreference: responseData.userPreference,
              };
          console.log("Updated user to dispatch:", updatedUser);
          dispatch(updateUserAct(updatedUser));
          navigation.navigate("forYou");
        } else {
          console.error("❌ Missing data in result:", result);
          Alert.alert("Error", "Unable to retrieve user data.");
        }
      } else {
        console.error("❌ Failed to submit quiz:", result.message);
        Alert.alert("Error", `Failed to submit quiz: ${result.message || "Unknown error."}`);
      }
    } catch (error) {
      console.error("HandleNext error:", error);
      Alert.alert(
        "Error",
        `An error occurred while submitting the quiz: ${error.message || "Unknown error"}`
      );
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-4 mt-8">
        <ProgressBar progress={100} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("Favorite")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">Hate</Text>
            <Text className="text-base text-gray-600 mt-1">Select your allergic food</Text>
          </View>
          <View className="w-10" />
        </View>

        <View className="flex-row items-center justify-start gap-2 my-4">
          <Checkbox
            value={
              selectedItemIds.length ===
              hateGroups
                .flatMap((c) => c.items)
                .filter((item) => !favoriteItemIds.includes(String(item.id))).length
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
          {hateGroups.map((group, index) => (
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
                      selectedItemIds.includes(String(item.id))
                        ? "bg-custom-green"
                        : favoriteItemIds.includes(String(item.id))
                        ? "bg-blue-200"
                        : "bg-gray-100 border border-gray-300"
                    }`}
                    onPress={() => toggleItemSelection(item.id)}
                    disabled={favoriteItemIds.includes(String(item.id))}
                  >
                    <Text
                      className={`${
                        selectedItemIds.includes(String(item.id))
                          ? "text-white"
                          : favoriteItemIds.includes(String(item.id))
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

export default Hate;
