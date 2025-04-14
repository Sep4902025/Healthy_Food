import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons; install with `npm install @expo/vector-icons`

import dishesService from "../../services/dishService";
import ingredientsService from "../../services/ingredientService";
import HomeService from "../../services/HomeService";

const RecipeModal = ({ dishId, recipeId, onClose }) => {
  const [recipe, setRecipe] = useState(null);
  const [dish, setDish] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
  const [servingSize, setServingSize] = useState(null); // State for user-adjusted serving size

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Lấy thông tin recipe
        const recipeResponse = await HomeService.getRecipeByRecipeId(dishId, recipeId);
        if (!recipeResponse.success || !recipeResponse.data) {
          throw new Error("Failed to fetch recipe");
        }
        setRecipe(recipeResponse.data);

        // Lấy thông tin dish
        const dishResponse = await dishesService.getDishById(recipeResponse.data.dishId._id);
        if (!dishResponse.success || !dishResponse.data) {
          throw new Error("Failed to fetch dish");
        }
        setDish(dishResponse.data);

        // Set initial serving size
        setServingSize(dishResponse.data.totalServing);

        // Lấy thông tin ingredients
        const ingredientPromises = recipeResponse.data.ingredients
          .filter((item) => item.ingredientId && item.ingredientId._id) // Kiểm tra ingredientId
          .map((item) => ingredientsService.getIngredientById(item.ingredientId._id));

        const ingredientResults = await Promise.allSettled(ingredientPromises);
        const ingredientsData = ingredientResults
          .map((result, index) => {
            if (result.status === "fulfilled" && result.value?.data) {
              // Kiểm tra cấu trúc dữ liệu trả về
              const ingredientData = result.value.data.data || result.value.data; // Hỗ trợ cả res.data.data và res.data
              return ingredientData;
            } else {
              console.warn(`Failed to fetch ingredient at index ${index}:`, result.reason);
              return null;
            }
          })
          .filter((ingredient) => ingredient !== null); // Loại bỏ các ingredient không hợp lệ

        setIngredients(ingredientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRecipe();
  }, [dishId, recipeId]);

  if (!recipe || !dish || servingSize === null) {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-gray-800/50">
          <Text className="text-center mt-10 text-gray-500">Recipe not found!</Text>
        </View>
      </Modal>
    );
  }

  // Function to calculate adjusted ingredient quantities based on serving size
  const calculateQuantity = (originalQuantity) => {
    const ratio = servingSize / dish.totalServing;
    return Math.round(originalQuantity * ratio * 10) / 10; // Round to 1 decimal place
  };

  // Handlers for adjusting serving size
  const increaseServing = () => setServingSize((prev) => prev + 1);
  const decreaseServing = () => setServingSize((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <Modal visible={true} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-gray-800/50">
        <View className="bg-white shadow-xl rounded-lg p-6 w-11/12 max-w-3xl max-h-[90vh] relative">
          <TouchableOpacity className="absolute top-3 right-3" onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>

          {/* Header Section */}
          <View className="flex-col items-center justify-center mb-4">
            <Text className="text-2xl font-bold text-gray-800">{dish.name}</Text>
            <Image
              source={{ uri: dish.imageUrl }}
              className="w-20 h-20 rounded-full object-cover mt-2"
            />
            <Text className="text-gray-600 text-center text-sm mt-2">{dish.description}</Text>
            <Text className="text-base font-semibold flex-row items-center text-gray-800 mt-2">
              <Ionicons name="timer-outline" size={16} color="#4b5563" className="mr-1" />
              Cooking Time: {recipe.cookingTime} mins
            </Text>
          </View>

          {/* Serving Size Adjustment */}
          <View className="flex-row items-center justify-center mb-4">
            <Text className="text-sm font-medium text-gray-700 mr-2">Servings:</Text>
            <TouchableOpacity
              onPress={decreaseServing}
              className="p-1 rounded-full bg-gray-200"
              disabled={servingSize <= 1}
            >
              <Ionicons name="remove" size={16} color="#4b5563" />
            </TouchableOpacity>
            <Text className="mx-3 text-lg font-semibold text-gray-800">{servingSize}</Text>
            <TouchableOpacity onPress={increaseServing} className="p-1 rounded-full bg-gray-200">
              <Ionicons name="add" size={16} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* Ingredients and Instructions Section */}
          <View className="flex-col gap-4">
            {/* Ingredients List */}
            <View>
              <Text className="text-lg font-semibold text-gray-800 mb-3 flex-row items-center">
                <Text className="mr-2">🍽️</Text> Ingredients
              </Text>
              <ScrollView className="max-h-60">
                {recipe.ingredients.map((item, index) => {
                  const ingredient = ingredients.find((ing) => ing._id === item.ingredientId._id);
                  return ingredient ? (
                    <View
                      key={index}
                      className="flex-row items-center border-b border-gray-200 pb-2 mb-3"
                    >
                      <Image
                        source={{
                          uri:
                            ingredient?.imageUrl ||
                            "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg",
                        }}
                        className="w-8 h-8 object-cover rounded-full mr-3"
                      />
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium text-sm">{ingredient.name}</Text>
                        <Text className="text-gray-600 text-xs">
                          {calculateQuantity(item.quantity)} {item.unit}
                        </Text>
                      </View>
                    </View>
                  ) : null;
                })}
              </ScrollView>
            </View>

            {/* Cooking Instructions */}
            <View className="bg-white p-4 rounded-lg shadow">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-800 flex-row items-center">
                  <Text className="mr-2">📖</Text> Instructions
                </Text>
                <TouchableOpacity onPress={() => setIsInstructionsOpen(!isInstructionsOpen)}>
                  <Text className="text-gray-600 text-sm">
                    {isInstructionsOpen ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
              {isInstructionsOpen && (
                <ScrollView className="max-h-60">
                  {recipe.instruction?.map((step, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="font-medium mr-1 text-gray-700 text-sm">
                        Step {step.step}:
                      </Text>
                      <Text className="text-gray-700 text-sm">{step.description}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RecipeModal;
