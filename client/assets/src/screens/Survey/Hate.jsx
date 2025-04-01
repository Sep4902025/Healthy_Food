import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import Checkbox from "expo-checkbox"; // Updated import
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { updateUserAct } from "../../redux/reducers/userReducer"; // Import action từ userSlice
import { userSelector } from "../../redux/selectors/selector";
import ProgressBar from "./ProgressBar";
import quizService from "../../services/quizService";

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
        if (savedData.hate) setSelectedItemIds(savedData.hate);
        if (savedData.favorite) setFavoriteItemIds(savedData.favorite);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const toggleItemSelection = (id) => {
    if (favoriteItemIds.includes(id)) return;
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allItemIds = hateGroups
      .flatMap((group) => group.items.map((item) => item.id))
      .filter((id) => !favoriteItemIds.includes(id));
    setSelectedItemIds(allItemIds);
  };

  const deselectAll = () => {
    setSelectedItemIds([]);
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
      if (result.success) {
        if (result.data.user) {
          dispatch(updateUserAct(result.data.user));
          navigation.navigate("forYou");
        } else {
          Alert.alert("Error", "Unable to retrieve updated user data.");
        }
      } else {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Favorite")}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <ProgressBar progress={100} />
      </View>

      <Text style={styles.title}>Hate</Text>
      <Text style={styles.subtitle}>Select your allergic food</Text>

      <View style={styles.selectAllContainer}>
        <Checkbox
          value={
            selectedItemIds.length ===
            hateGroups.flatMap((c) => c.items).filter((item) => !favoriteItemIds.includes(item.id))
              .length
          }
          onValueChange={(value) => (value ? selectAll() : deselectAll())}
        />
        <Text style={styles.selectAllText}>Select All</Text>
      </View>

      <ScrollView>
        {hateGroups.map((group, index) => (
          <View key={index} style={styles.groupContainer}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <Text style={styles.groupName}>{group.name}</Text>
            </View>
            <View style={styles.itemsContainer}>
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.item,
                    selectedItemIds.includes(item.id)
                      ? styles.selectedItem
                      : favoriteItemIds.includes(item.id)
                      ? styles.favoriteItem
                      : styles.defaultItem,
                  ]}
                  onPress={() => toggleItemSelection(item.id)}
                  disabled={favoriteItemIds.includes(item.id)}
                >
                  <Text
                    style={
                      selectedItemIds.includes(item.id)
                        ? styles.selectedItemText
                        : favoriteItemIds.includes(item.id)
                        ? styles.favoriteItemText
                        : styles.defaultItemText
                    }
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 448, // max-w-md
    marginHorizontal: "auto",
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  backButton: {
    position: "absolute",
    left: 80, // left-20
    padding: 8,
    backgroundColor: "#d1d5db",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 16,
    gap: 8,
  },
  selectAllText: {
    fontSize: 16,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupIcon: {
    fontSize: 18,
    fontWeight: "bold",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  item: {
    padding: 8,
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: "#4ade80", // bg-green-400
  },
  favoriteItem: {
    backgroundColor: "#bfdbfe", // bg-blue-200
  },
  defaultItem: {
    backgroundColor: "#f3f4f6", // bg-gray-100
  },
  selectedItemText: {
    color: "#fff",
  },
  favoriteItemText: {
    color: "#4b5563", // text-gray-600
  },
  defaultItemText: {
    color: "#374151", // text-gray-700
  },
  nextButton: {
    width: "100%",
    backgroundColor: "#14b8a6", // bg-teal-500
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Hate;
