import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Modern Picker
import DateTimePicker from "@react-native-community/datetimepicker"; // For date and time picker
import debounce from "lodash/debounce";
import mealPlanService from "../../services/mealPlanService";
import UserService from "../../services/userService";

const CreateMealPlanForm = ({ userId, userRole, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date()); // Store as Date object
  const [duration, setDuration] = useState(7);
  const [type, setType] = useState("custom");
  const [meals, setMeals] = useState([{ mealTime: "", mealName: "" }]);
  const [price, setPrice] = useState("");
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);
  const [customDuration, setCustomDuration] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false); // Control date picker visibility
  const [showTimePicker, setShowTimePicker] = useState(false); // Control time picker visibility
  const [currentMealIndex, setCurrentMealIndex] = useState(null); // Track which meal is being edited
  const [selectedTime, setSelectedTime] = useState(new Date()); // Default time for picker

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

  // Handle date selection for startDate
  const onDateChange = (event, selected) => {
    const currentDate = selected || startDate;
    if (Platform.OS === "android") {
      setShowDatePicker(false); // On Android, auto-close after selection
    }
    setStartDate(currentDate);
    if (Platform.OS === "ios") {
      setShowDatePicker(false); // On iOS, manually close after selection
    }
  };

  // Handle time selection for mealTime
  const onTimeChange = (event, selected) => {
    const currentTime = selected || selectedTime;
    if (Platform.OS === "android") {
      setShowTimePicker(false); // On Android, auto-close after selection
    }
    setSelectedTime(currentTime);

    // Format the time (e.g., "08:00 AM")
    const formattedTime = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Update the mealTime for the current meal
    if (currentMealIndex !== null) {
      handleMealChange(currentMealIndex, "mealTime", formattedTime);
    }

    if (Platform.OS === "ios") {
      setShowTimePicker(false); // On iOS, manually close after selection
    }
    setCurrentMealIndex(null);
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
        startDate: startDate.toISOString(), // Use the Date object directly
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
      <TouchableOpacity
        className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
        onPress={() => {
          setCurrentMealIndex(index);
          setShowTimePicker(true);
        }}
      >
        <Text className={item.mealTime ? "text-black" : "text-gray-400"}>
          {item.mealTime || "Meal Time (e.g., 08:00 AM)"}
        </Text>
      </TouchableOpacity>
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

  // Format startDate for display in YYYY-MM-DD format (numeric only)
  const formattedStartDate = startDate.toISOString().split("T")[0]; // e.g., "2025-03-14"

  return (
    <View className="p-4 bg-white rounded-lg shadow-md">
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mb-3"
        placeholder="Enter plan title"
        value={title}
        onChangeText={setTitle}
      />
      <TouchableOpacity
        className="border border-gray-300 rounded-lg p-2 mb-3"
        onPress={() => setShowDatePicker(true)}
      >
        <Text className={startDate ? "text-black" : "text-gray-400"}>
          {formattedStartDate || "Select Start Date (YYYY-MM-DD)"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date" // Set mode to date
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}
      <View className="border border-gray-300 rounded-lg mb-3">
        <Picker selectedValue={type} className="h-12" onValueChange={(value) => setType(value)}>
          <Picker.Item label="Fixed (With Meals)" value="fixed" />
          <Picker.Item label="Custom (No Meals)" value="custom" />
        </Picker>
      </View>
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
        <View className="border border-gray-300 rounded-lg mb-3">
          <Picker
            selectedValue={duration}
            className="h-12"
            onValueChange={(value) => setDuration(Number(value))}
          >
            <Picker.Item label="7 Days" value={7} />
            <Picker.Item label="14 Days" value={14} />
            <Picker.Item label="30 Days" value={30} />
            {userRole === "nutritionist" && <Picker.Item label="60 Days" value={60} />}
          </Picker>
        </View>
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
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
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
