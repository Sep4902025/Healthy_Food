import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Picker } from "react-native";
import debounce from "lodash/debounce";
import mealPlanService from "../../services/mealPlanService";
import UserService from "../../services/userService";

const CreateMealPlanForm = ({ userId, userRole, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState(7);
  const [type, setType] = useState("custom");
  const [meals, setMeals] = useState([{ mealTime: "", mealName: "" }]);
  const [price, setPrice] = useState("");
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);
  const [customDuration, setCustomDuration] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);

  const searchUsers = debounce(async (email) => {
    if (!email) {
      setUserSuggestions([]);
      setTargetUserId(null);
      return;
    }
    try {
      const response = await UserService.searchUserByEmail(email);
      if (response.success) setUserSuggestions(response.users || []);
      else setUserSuggestions([]);
    } catch (error) {
      setUserSuggestions([]);
    }
  }, 300);

  useEffect(() => {
    if (userRole === "nutritionist") searchUsers(targetUserEmail);
  }, [targetUserEmail]);

  const handleAddMeal = () => setMeals([...meals, { mealTime: "", mealName: "" }]);
  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...meals];
    updatedMeals[index][field] = value;
    setMeals(updatedMeals);
  };
  const handleRemoveMeal = (index) => setMeals(meals.filter((_, i) => i !== index));
  const handleSelectUser = (user) => {
    setTargetUserEmail(user.email);
    setTargetUserId(user._id);
    setUserSuggestions([]);
  };

  const handleCreateMealPlan = async () => {
    if (!title || !startDate || (type === "fixed" && meals.length === 0)) {
      Alert.alert("Error", "Please fill in all required fields!");
      return;
    }
    if (userRole === "nutritionist" && (!price || !targetUserId)) {
      Alert.alert("Error", "Please provide price and select a target user!");
      return;
    }

    setCreating(true);
    try {
      const mealPlanData = {
        title,
        userId: userRole === "nutritionist" ? targetUserId : userId,
        createdBy: userId,
        type,
        duration,
        startDate: new Date(startDate).toISOString(),
        meals: type === "fixed" ? meals : [],
        ...(userRole === "nutritionist" && { price: Number(price) }),
      };
      const response = await mealPlanService.createMealPlan(mealPlanData);
      if (response.success) {
        Alert.alert("Success", "Meal Plan created successfully!");
        onSuccess();
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      Alert.alert("Error", "Error creating Meal Plan");
    } finally {
      setCreating(false);
    }
  };

  const renderMealItem = ({ item, index }) => (
    <View className="flex-row items-center mb-3 bg-gray-50 p-2 rounded-lg">
      <TextInput
        className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
        placeholder="Meal Time (e.g., 08:00)"
        value={item.mealTime}
        onChangeText={(text) => handleMealChange(index, "mealTime", text)}
      />
      <TextInput
        className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
        placeholder="Meal Name"
        value={item.mealName}
        onChangeText={(text) => handleMealChange(index, "mealName", text)}
      />
      <TouchableOpacity className="p-2" onPress={() => handleRemoveMeal(index)}>
        <Text className="text-red-500 text-lg">✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="p-4 bg-white rounded-lg shadow-md">
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mb-3"
        placeholder="Enter plan title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mb-3"
        placeholder="Start Date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
      />
      <Picker selectedValue={type} className="h-12 mb-3" onValueChange={(value) => setType(value)}>
        <Picker.Item label="Fixed (With Meals)" value="fixed" />
        <Picker.Item label="Custom (No Meals)" value="custom" />
      </Picker>
      {userRole === "nutritionist" && (
        <TouchableOpacity className="mb-3" onPress={() => setCustomDuration(!customDuration)}>
          <Text>{customDuration ? "☑" : "☐"} Custom Duration</Text>
        </TouchableOpacity>
      )}
      {userRole === "nutritionist" && customDuration ? (
        <TextInput
          className="border border-gray-300 rounded-lg p-2 mb-3"
          placeholder="Duration (days)"
          value={duration.toString()}
          onChangeText={(text) => setDuration(Number(text))}
          keyboardType="numeric"
        />
      ) : (
        <Picker
          selectedValue={duration}
          className="h-12 mb-3"
          onValueChange={(value) => setDuration(Number(value))}
        >
          <Picker.Item label="7 Days" value={7} />
          <Picker.Item label="14 Days" value={14} />
          <Picker.Item label="30 Days" value={30} />
          {userRole === "nutritionist" && <Picker.Item label="60 Days" value={60} />}
        </Picker>
      )}
      {userRole === "nutritionist" && (
        <>
          <TextInput
            className="border border-gray-300 rounded-lg p-2 mb-3"
            placeholder="Price ($)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-2 mb-3"
            placeholder="Search by user email"
            value={targetUserEmail}
            onChangeText={setTargetUserEmail}
          />
          {userSuggestions.length > 0 && (
            <FlatList
              data={userSuggestions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-2 border-b border-gray-200"
                  onPress={() => handleSelectUser(item)}
                >
                  <Text>
                    {item.username} ({item.email})
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
              className="max-h-40 mb-3"
            />
          )}
        </>
      )}
      {type === "fixed" && (
        <View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-lg font-medium">Meal List</Text>
            <TouchableOpacity className="bg-blue-500 p-2 rounded-lg" onPress={handleAddMeal}>
              <Text className="text-white">+ Add Meal</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={meals}
            renderItem={renderMealItem}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      )}
      <TouchableOpacity
        className={`bg-green-500 p-3 rounded-lg items-center ${creating ? "opacity-50" : ""}`}
        onPress={handleCreateMealPlan}
        disabled={creating}
      >
        <Text className="text-white text-base">
          {creating ? "Creating..." : "Create Meal Plan"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateMealPlanForm;
