import React, { useState } from "react";
import RecipeModal from "./RecipeModal"; // Import modal

const DishCard = ({ dish, onDelete, deletingDishId, disableDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="border rounded-lg p-5 bg-white shadow-md mb-4 flex flex-col gap-4 hover:shadow-lg transition-shadow relative">
      {/* Header: Image, Dish Name, and Delete Button */}
      <div className="flex items-center gap-5 relative">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-[80px] h-[80px] rounded-full object-cover flex-shrink-0"
        />
        <p className="text-xl font-semibold text-gray-800 truncate">{dish.name}</p>
        {/* Delete Button (Top-right corner) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(dish._id || dish.dishId);
          }}
          disabled={deletingDishId === (dish._id || dish.dishId) || disableDelete}
          className={`absolute top-0 right-0 text-red-500 hover:text-red-700 transition-colors ${
            deletingDishId === (dish._id || dish.dishId) || disableDelete
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          title={
            disableDelete
              ? "Cannot delete dish: Meal plan is expired or paused"
              : "Delete this dish"
          }
        >
          {deletingDishId === (dish._id || dish.dishId) ? (
            <span className="animate-pulse text-sm">Deleting...</span>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm">🗑️ Delete</span>
            </div>
          )}
        </button>
      </div>

      {/* Nutrition Info (Centered in the middle) */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 p-3 rounded-md">
        <p>🔥 {(dish.calories || 0).toFixed(2)} kcal</p>
        <p>🥩 {(dish.protein || 0).toFixed(2)}g</p>
        <p>🌾 {(dish.carbs || 0).toFixed(2)}g</p>
        <p>🥑 {(dish.fat || 0).toFixed(2)}g</p>
      </div>

      {/* Recipe Button (Bottom) */}
      <div className="w-full">
        {dish.recipeId && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full text-sm bg-blue-100 text-blue-600 py-1.5 px-4 rounded hover:bg-blue-200 transition-colors"
          >
            📜 View Recipe
          </button>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <RecipeModal
          dishId={dish.dishId}
          recipeId={dish.recipeId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DishCard;
