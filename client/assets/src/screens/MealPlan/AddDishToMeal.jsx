import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import mealPlanService from "../../services/mealPlanService";
import homeService from "../../services/HomeService";

const AddDishToMeal = ({ mealPlanId, mealDayId, mealId, onClose, onDishAdded, userId }) => {
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [existingDishes, setExistingDishes] = useState([]);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  console.log("FAVORITE_DISHES", favoriteDishes);

  const [activeFilter, setActiveFilter] = useState("all");
  const [dishTypes, setDishTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [dishesResponse, mealResponse, favoritesResponse] = await Promise.all([
          mealPlanService.getAllDishes(),
          mealPlanService.getMealByMealId(mealPlanId, mealDayId, mealId),
          homeService.getFavoriteDishes(userId),
        ]);

        // Process dishes
        if (dishesResponse.success) {
          setDishes(dishesResponse.data);

          // Extract unique dish types
          const types = [
            ...new Set(dishesResponse.data.filter((dish) => dish.type).map((dish) => dish.type)),
          ];

          setDishTypes(types);
        } else {
          setError(dishesResponse.message || "Could not fetch dishes");
        }

        // Process meal data
        if (mealResponse.success && mealResponse.data && mealResponse.data.dishes) {
          setExistingDishes(mealResponse.data.dishes);
        }
        console.log("FAVORITES_RESPONSE", favoritesResponse);
        // Process favorites
        if (Array.isArray(favoritesResponse)) {
          const dishIds = favoritesResponse.map((dish) => dish.dishId);
          console.log("Mapped Dish IDs:", dishIds);
          setFavoriteDishes(dishIds);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError("Could not fetch dishes data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [mealPlanId, mealDayId, mealId, userId]);

  // Check if dish is already added to the meal
  const isDishAlreadyAdded = (dish) => {
    if (!existingDishes || existingDishes.length === 0) return false;

    return existingDishes.some(
      (existingDish) =>
        (existingDish.dishId && existingDish.dishId === dish._id) ||
        existingDish._id === dish._id ||
        existingDish.name === dish.name
    );
  };

  // Check if dish is in favorites
  const isFavorite = (dishId) => {
    return favoriteDishes.includes(dishId);
  };

  const handleAddDish = async () => {
    if (!selectedDish) {
      Alert.alert("Error", "Please select a dish!");
      return;
    }

    // Check if the dish is already added
    if (isDishAlreadyAdded(selectedDish)) {
      Alert.alert("Error", "This dish has already been added to the meal!");
      return;
    }

    try {
      setIsAdding(true);
      const newDish = {
        dishId: selectedDish._id,
        recipeId: selectedDish?.recipeId,
        imageUrl: selectedDish?.imageUrl,
        name: selectedDish?.name,
        calories: selectedDish?.calories,
        protein: selectedDish?.protein,
        carbs: selectedDish?.carbs,
        fat: selectedDish?.fat,
      };

      const response = await mealPlanService.addDishToMeal(
        mealPlanId,
        mealDayId,
        mealId,
        newDish,
        userId
      );
      if (response.success) {
        onDishAdded();
        onClose();
      } else {
        setError(response.message || "Failed to add dish");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("❌ Error adding dish:", error);
      setError("Could not add dish");
      setIsAdding(false);
    }
  };

  // Filter dishes based on active filter, selected type, and search query
  const filteredDishes = dishes.filter((dish) => {
    // Filter by favorite status
    if (activeFilter === "favorites" && !isFavorite(dish._id)) {
      return false;
    }

    // Filter by dish type
    if (selectedType !== "all" && dish.type !== selectedType) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // If loading, show a spinner
  if (loading) {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-4xl">
            <View className="flex justify-center items-center h-64">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="ml-4 text-gray-700">Loading dishes...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // If there's an error, show the error message
  if (error) {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-4xl">
            <Text className="text-red-500 text-center mb-4">{error}</Text>
            <View className="flex justify-center">
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-800">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-5xl max-h-[90vh] flex flex-col">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold">Select a Dish</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-xl">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Filter and Search Controls */}
          <View className="mb-4 flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            {/* Search bar */}
            <View className="relative flex-grow">
              <TextInput
                placeholder="Search for a dish..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full"
              />
              <Text className="absolute left-3 top-2.5">🔍</Text>
            </View>

            {/* Filter buttons */}
            <View className="flex-row items-center gap-2 mt-1">
              <TouchableOpacity
                onPress={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg ${
                  activeFilter === "all" ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm ${activeFilter === "all" ? "text-white" : "text-gray-800"}`}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveFilter("favorites")}
                className={`px-3 py-1.5 rounded-lg flex-row items-center ${
                  activeFilter === "favorites" ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <Text className="mr-1">⭐</Text>
                <Text
                  className={`text-sm ${
                    activeFilter === "favorites" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Favorites
                </Text>
              </TouchableOpacity>

              {/* Type selection dropdown */}
              <View
                className="border border-gray-300 rounded-lg bg-white"
                style={{ height: 35, width: 120, justifyContent: "center" }}
              >
                <Picker
                  selectedValue={selectedType}
                  onValueChange={(itemValue) => setSelectedType(itemValue)}
                  mode="dropdown"
                >
                  <Picker.Item label="Type" value="all" />
                  {dishTypes.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Dishes display */}
          <FlatList
            data={filteredDishes}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListEmptyComponent={
              <View className="flex-col items-center justify-center h-64">
                <Ionicons name="sad-outline" size={64} color="#9ca3af" />
                <Text className="text-gray-500 mt-4">No dishes match your search criteria</Text>
              </View>
            }
            renderItem={({ item: dish }) => {
              const isAlreadyAdded = isDishAlreadyAdded(dish);
              const dishFavorite = isFavorite(dish._id);

              return (
                <TouchableOpacity
                  className={`flex-1 m-2 border rounded-lg overflow-hidden shadow-sm ${
                    selectedDish?._id === dish._id ? "border-2 border-blue-500" : ""
                  } ${isAlreadyAdded ? "opacity-50" : ""}`}
                  onPress={() => !isAdding && !isAlreadyAdded && setSelectedDish(dish)}
                  disabled={isAdding || isAlreadyAdded}
                >
                  {/* 🔽 Giảm chiều cao ảnh từ 160px xuống 120px */}
                  <View className="relative h-32 bg-gray-200">
                    {dish.imageUrl ? (
                      <Image
                        source={{ uri: dish.imageUrl }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <View className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Text className="text-gray-400">No image</Text>
                      </View>
                    )}
                    {dishFavorite && (
                      <Text className="absolute top-2 right-2 text-yellow-500 text-xl">⭐</Text>
                    )}
                    {isAlreadyAdded && (
                      <View className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Text className="text-white font-semibold">Added</Text>
                      </View>
                    )}
                  </View>

                  {/* 🔽 Điều chỉnh padding để hiển thị thông tin tốt hơn */}
                  <View className="p-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-medium text-gray-800 text-sm">{dish.name}</Text>
                      <Text className="text-sm font-bold text-blue-600">{dish.calories} kcal</Text>
                    </View>

                    {/* 🔽 Hiển thị các chỉ số dinh dưỡng trên cùng 1 hàng */}
                    <View className="mt-1 flex-row flex-wrap gap-1">
                      <Text className="bg-red-100 rounded-full px-2 py-1 text-xs">
                        Pro: {dish.protein || 0}g
                      </Text>
                      <Text className="bg-green-100 rounded-full px-2 py-1 text-xs">
                        Carbs: {dish.carbs || 0}g
                      </Text>
                      <Text className="bg-yellow-100 rounded-full px-2 py-1 text-xs">
                        Fat: {dish.fat || 0}g
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Selected dish information */}
          {selectedDish && (
            <View className="mt-4 p-4 bg-blue-50 rounded-lg">
              <Text className="font-medium text-blue-800">Selected Dish</Text>
              <View className="flex-row items-center mt-2">
                <View className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                  {selectedDish.imageUrl ? (
                    <Image
                      source={{ uri: selectedDish.imageUrl }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <View className="w-full h-full flex items-center justify-center text-gray-400">
                      <Text className="text-gray-400">No img</Text>
                    </View>
                  )}
                </View>
                <View className="ml-4">
                  <Text className="font-medium">{selectedDish.name}</Text>
                  <View className="flex-row space-x-3 text-sm mt-1">
                    <Text className="text-blue-600 font-semibold">
                      {selectedDish.calories} kcal
                    </Text>
                    <Text>Pro: {selectedDish.protein || 0}g</Text>
                    <Text>Carbs: {selectedDish.carbs || 0}g</Text>
                    <Text>Fat: {selectedDish.fat || 0}g</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View className="mt-4 flex-row justify-between">
            <TouchableOpacity
              onPress={handleAddDish}
              className={`${
                isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
                  ? "bg-gray-400"
                  : "bg-green-600"
              } text-white px-4 py-2 rounded-lg`}
              disabled={
                isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
              }
            >
              <Text className="text-white">{isAdding ? "Adding..." : "Add Dish"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              disabled={isAdding}
            >
              <Text className="text-gray-800">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddDishToMeal;
