import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For the delete icon; install with `npm install @expo/vector-icons`
import RecipeModal from "./RecipeModal"; // Import modal

const DishCard = ({ dish, onDelete, deletingDishId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <View className="border rounded-lg p-5 bg-white shadow-md mb-4 flex flex-col gap-4 relative">
      {/* Header: Image, Dish Name, and Delete Button */}
      <View className="flex-row items-center gap-5 relative">
        <Image
          source={{ uri: dish.imageUrl }}
          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
        />
        <Text className="text-xl font-semibold text-gray-800">{dish.name}</Text>
        {/* Delete Button (Top-right corner) */}
        <TouchableOpacity
          onPress={() => onDelete(dish._id || dish.dishId)}
          disabled={deletingDishId === (dish._id || dish.dishId)}
          className={`absolute top-0 right-0 ${
            deletingDishId === (dish._id || dish.dishId) ? "opacity-50" : ""
          }`}
        >
          {deletingDishId === (dish._id || dish.dishId) ? (
            <Text className="animate-pulse text-sm text-red-500">Deleting...</Text>
          ) : (
            <View className="flex-row items-center gap-1">
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text className="text-sm text-red-500">Delete</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Nutrition Info (Centered in the middle) */}
      <View className="flex-row flex-wrap justify-between text-sm text-gray-600 p-3 rounded-md">
        <Text className="w-1/2">🔥 {dish.calories || 0} kcal</Text>
        <Text className="w-1/2">🥩 {dish.protein || 0}g</Text>
        <Text className="w-1/2">🍞 {dish.carbs || 0}g</Text>
        <Text className="w-1/2">🛢 {dish.fat || 0}g</Text>
      </View>

      {/* Recipe Button (Bottom) */}
      <View className="w-full">
        {dish.recipeId && (
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            className="w-full text-sm bg-blue-100 text-blue-600 py-1.5 px-4 rounded"
          >
            <Text className="text-blue-600 text-center">📜 View Recipe</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal */}
      {isModalOpen && (
        <RecipeModal
          dishId={dish.dishId}
          recipeId={dish.recipeId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </View>
  );
};

export default DishCard;
