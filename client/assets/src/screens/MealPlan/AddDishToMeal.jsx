<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======
import React, { useEffect, useState, useCallback } from "react";
>>>>>>> 168395b (App v3)
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
<<<<<<< HEAD
  StyleSheet,
=======
>>>>>>> 168395b (App v3)
  ScrollView,
} from "react-native";
import mealPlanService from "../../services/mealPlanService";
import HomeService from "../../services/HomeService";
<<<<<<< HEAD
import Pagination from "../../components/common/Pagination";
=======
>>>>>>> 168395b (App v3)

const AddDishToMeal = ({ mealPlanId, mealDayId, mealId, onClose, onDishAdded, userId }) => {
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
=======
  const [loading, setLoading] = useState({ initial: true, more: false });
>>>>>>> 168395b (App v3)
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [existingDishes, setExistingDishes] = useState([]);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
<<<<<<< HEAD
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
=======
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
>>>>>>> 168395b (App v3)

  // Định nghĩa sẵn các tag
  const orderedTags = [
    { label: "ALL", type: "all" },
    { label: "Favorites", type: "favorites" },
    { label: "Heavy Meals", type: "Heavy Meals" },
    { label: "Light Meals", type: "Light Meals" },
    { label: "Dessert", type: "Dessert" },
  ];

  useEffect(() => {
<<<<<<< HEAD
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [dishesResponse, mealResponse, favoritesResponse] = await Promise.all([
          mealPlanService.getAllDishes(
            currentPage + 1,
            limit,
            searchQuery,
            selectedType !== "all" ? selectedType : undefined
          ),
          mealPlanService.getMealByMealId(mealPlanId, mealDayId, mealId),
          HomeService.getFavoriteDishes(userId),
        ]);

        if (dishesResponse.success) {
          setDishes(dishesResponse.data.items || []);
          setTotalItems(dishesResponse.data.total || 0);
        } else {
          setError(dishesResponse.message || "Could not fetch dishes");
        }

        if (mealResponse.success && mealResponse.data && mealResponse.data.dishes) {
          setExistingDishes(mealResponse.data.dishes);
        }

        if (Array.isArray(favoritesResponse)) {
          const dishIds = favoritesResponse.map((dish) => dish.dishId);
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
  }, [mealPlanId, mealDayId, mealId, userId, currentPage, limit, searchQuery, selectedType]);
=======
    loadInitialDishes();
  }, [searchQuery, selectedType]);

  const loadInitialDishes = async () => {
    setLoading((prev) => ({ ...prev, initial: true }));
    setPage(1);
    setHasMore(true);
    await loadDishes(1, true);
    setLoading((prev) => ({ ...prev, initial: false }));
  };

  const loadMoreDishes = async () => {
    if (!hasMore || loading.more) return;
    setLoading((prev) => ({ ...prev, more: true }));
    await loadDishes(page + 1);
    setLoading((prev) => ({ ...prev, more: false }));
  };

  const loadDishes = async (pageNum, isRefresh = false) => {
    try {
      const [dishesResponse, mealResponse, favoritesResponse] = await Promise.all([
        mealPlanService.getAllDishes(
          pageNum,
          limit,
          searchQuery,
          selectedType !== "all" ? selectedType : undefined
        ),
        mealPlanService.getMealByMealId(mealPlanId, mealDayId, mealId),
        HomeService.getFavoriteDishes(userId),
      ]);

      if (dishesResponse.success) {
        const newDishes = dishesResponse.data.items || [];
        setDishes((prev) => (isRefresh ? newDishes : [...prev, ...newDishes]));
        setPage(pageNum);
        setHasMore(pageNum < dishesResponse.data.totalPages);
      } else {
        setError(dishesResponse.message || "Could not fetch dishes");
        setHasMore(false);
      }

      if (mealResponse.success && mealResponse.data && mealResponse.data.dishes) {
        setExistingDishes(mealResponse.data.dishes);
      }

      if (Array.isArray(favoritesResponse)) {
        const dishIds = favoritesResponse.map((dish) => dish.dishId);
        setFavoriteDishes(dishIds);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setError("Could not fetch dishes data");
      setHasMore(false);
    }
  };
>>>>>>> 168395b (App v3)

  const isDishAlreadyAdded = (dish) => {
    if (!existingDishes || existingDishes.length === 0) return false;
    return existingDishes.some(
      (existingDish) =>
        (existingDish.dishId && existingDish.dishId === dish._id) ||
        existingDish._id === dish._id ||
        existingDish.name === dish.name
    );
  };

  const isFavorite = (dishId) => favoriteDishes.includes(dishId);

  const handleAddDish = async () => {
    if (!selectedDish) {
      alert("Please select a dish!");
      return;
    }

    if (isDishAlreadyAdded(selectedDish)) {
      alert("This dish has already been added to the meal!");
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

  const filteredDishes = dishes.filter((dish) => {
    if (activeFilter === "favorites" && !isFavorite(dish._id)) return false;
    if (selectedType !== "all" && dish.type !== selectedType) return false;
    return true;
  });

  const renderDishItem = ({ item: dish }) => {
    const isAlreadyAdded = isDishAlreadyAdded(dish);
    const dishFavorite = isFavorite(dish._id);
    const isSelected = selectedDish?._id === dish._id;

    return (
      <TouchableOpacity
<<<<<<< HEAD
        style={styles.cardShadow}
=======
>>>>>>> 168395b (App v3)
        className={`border rounded-lg overflow-hidden relative w-[48%] mb-4 ${
          isSelected ? "border-green-500 border-2" : "border-gray-200"
        } ${isAlreadyAdded ? "opacity-50" : ""}`}
        onPress={() => !isAdding && !isAlreadyAdded && setSelectedDish(dish)}
        disabled={isAdding || isAlreadyAdded}
      >
        <View className="relative">
          <View className="h-32 bg-gray-200">
            {dish.imageUrl ? (
              <Image source={{ uri: dish.imageUrl }} className="w-full h-full object-cover" />
            ) : (
              <View className="w-full h-full flex items-center justify-center bg-gray-200">
                <Text className="text-gray-400">No image</Text>
              </View>
            )}
            {dishFavorite && (
              <Text className="absolute top-2 right-2 text-yellow-500 text-xl">⭐</Text>
            )}
            {isAlreadyAdded && (
              <View className="absolute inset-0 flex items-center justify-center">
                <Text className="text-white font-bold">Added</Text>
              </View>
            )}
            {isSelected && !isAlreadyAdded && (
              <View className="absolute inset-0 flex items-center justify-center">
                <View className="bg-green-500 rounded-full px-3 py-1 flex-row items-center">
                  <Text className="text-white text-xs mr-1">✓</Text>
                  <Text className="text-white text-xs">Choice</Text>
                </View>
              </View>
            )}
          </View>
          <View className="p-2">
            <View className="flex-row justify-between items-start">
              <Text className="font-medium text-gray-800 text-sm">{dish.name}</Text>
              <Text className="text-xs font-bold text-blue-600">{dish.calories} kcal</Text>
            </View>
            <View className="mt-1 flex-col space-y-1">
              <View className="flex-row items-center">
                <Text className="text-[10px] text-gray-600 mr-2">Protein:</Text>
                <Text className="bg-red-100 rounded-full px-1 py-0.5 text-[10px]">
                  {dish.protein || 0}g
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-[10px] text-gray-600 mr-2">Carbs:</Text>
                <Text className="bg-green-100 rounded-full px-1 py-0.5 text-[10px]">
                  {dish.carbs || 0}g
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-[10px] text-gray-600 mr-2">Fat:</Text>
                <Text className="bg-yellow-100 rounded-full px-1 py-0.5 text-[10px]">
                  {dish.fat || 0}g
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getTagStyle = (type, isSelected) => {
    const baseStyle = "px-3 py-1 rounded-lg text-sm mr-2";
    const selectedStyle = isSelected ? "bg-opacity-20" : "bg-transparent";

    switch (type) {
      case "all":
        return `${baseStyle} border border-gray-300 ${selectedStyle} ${
          isSelected ? "bg-gray-300 text-gray-300" : "text-gray-800"
        }`;
      case "favorites":
        return `${baseStyle} border border-gray-300 ${selectedStyle} ${
          isSelected ? "bg-gray-300 text-gray-300" : "text-gray-800"
        }`;
      case "Heavy Meals":
        return `${baseStyle} border border-red-500 ${selectedStyle} ${
          isSelected ? "bg-red-500 text-red-500" : "text-gray-800"
        }`;
      case "Light Meals":
        return `${baseStyle} border border-green-300 ${selectedStyle} ${
          isSelected ? "bg-green-300 text-green-300" : "text-gray-800"
        }`;
      case "Dessert":
        return `${baseStyle} border border-pink-300 ${selectedStyle} ${
          isSelected ? "bg-pink-300 text-pink-300" : "text-gray-800"
        }`;
      default:
        return `${baseStyle} border border-gray-300 ${selectedStyle} ${
          isSelected ? "bg-gray-300 text-gray-300" : "text-gray-800"
        }`;
    }
  };

<<<<<<< HEAD
=======
  const handleLoadMore = () => {
    if (!loading.more && hasMore) {
      loadMoreDishes();
    }
  };

>>>>>>> 168395b (App v3)
  if (error) {
    return (
      <Modal visible={true} transparent={true}>
        <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
<<<<<<< HEAD
          <View className="bg-white rounded-lg p-6 w-11/12 max-w-md" style={styles.cardShadow}>
=======
          <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
>>>>>>> 168395b (App v3)
            <Text className="text-red-500 text-center mb-4">{error}</Text>
            <TouchableOpacity
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg self-center"
              onPress={onClose}
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} transparent={true} animationType="slide">
      <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
<<<<<<< HEAD
        <View
          className="bg-white rounded-lg p-4 w-11/12 max-h-[90vh] flex-1"
          style={styles.cardShadow}
        >
=======
        <View className="bg-white rounded-lg p-4 w-11/12 max-h-[90vh] flex-1">
>>>>>>> 168395b (App v3)
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Select a Dish</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4 flex-col space-y-2">
            <View className="relative">
              <TextInput
                placeholder="Search for a dish..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
<<<<<<< HEAD
                  setCurrentPage(0);
=======
>>>>>>> 168395b (App v3)
                }}
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm"
              />
              <Text className="absolute left-3 top-3">🔍</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {orderedTags.map(({ label, type }) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    if (type === "all") {
                      setActiveFilter("all");
                      setSelectedType("all");
                    } else if (type === "favorites") {
                      setActiveFilter("favorites");
                      setSelectedType("all");
                    } else {
                      setSelectedType(type);
                      setActiveFilter("all");
                    }
<<<<<<< HEAD
                    setCurrentPage(0);
=======
>>>>>>> 168395b (App v3)
                  }}
                  className={getTagStyle(
                    type,
                    (type === "all" && activeFilter === "all" && selectedType === "all") ||
                      (type === "favorites" && activeFilter === "favorites") ||
                      (selectedType === type && activeFilter !== "favorites")
                  )}
                >
                  <View className="flex-row items-center">
                    {type === "favorites" && <Text className="mr-1">⭐</Text>}
                    <Text>{label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredDishes}
            renderItem={renderDishItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
<<<<<<< HEAD
            ListEmptyComponent={
              loading ? (
=======
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              loading.initial ? (
>>>>>>> 168395b (App v3)
                <View className="flex-col items-center justify-center h-64">
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text className="text-gray-500 mt-4">Loading dishes...</Text>
                </View>
              ) : (
                <View className="flex-col items-center justify-center h-64">
                  <Text className="text-gray-500 mt-4">
                    {selectedType !== "all"
                      ? `No more ${selectedType} dishes available`
                      : "No dishes match your criteria"}
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
<<<<<<< HEAD
              loading && filteredDishes.length > 0 ? (
=======
              loading.more && filteredDishes.length > 0 ? (
>>>>>>> 168395b (App v3)
                <View className="py-4 flex-row justify-center">
                  <ActivityIndicator size="small" color="#0000ff" />
                  <Text className="ml-2">Loading more...</Text>
                </View>
              ) : null
            }
            className="flex-1"
          />

<<<<<<< HEAD
          {totalItems > 0 && (
            <Pagination
              totalItems={totalItems}
              handlePageClick={(data) => setCurrentPage(data.selected)}
              currentPage={currentPage}
              text="dishes"
            />
          )}

=======
>>>>>>> 168395b (App v3)
          <View className="mt-4 flex-row justify-end gap-2">
            <TouchableOpacity
              onPress={handleAddDish}
              className={`${
                isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
                  ? "bg-gray-400"
                  : "bg-green-500"
              } px-4 py-2 rounded-lg`}
              disabled={
                isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
              }
            >
              <Text className="text-white text-sm">{isAdding ? "Adding..." : "Add Dish"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-300 px-4 py-2 rounded-lg"
              disabled={isAdding}
            >
              <Text className="text-gray-800 text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

<<<<<<< HEAD
const styles = StyleSheet.create({});

=======
>>>>>>> 168395b (App v3)
export default AddDishToMeal;
