import React, { useState } from "react";
import RecipeModal from "./RecipeModal"; // Import modal

const DishCard = ({ dish, onDelete, deletingDishId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="border rounded-lg p-3 bg-white shadow-md relative mb-2 flex items-center gap-4">
      {/* Hình ảnh món ăn */}
      <img
        src={dish.imageUrl}
        alt={dish.name}
        className="w-[60px] h-[60px] rounded-full object-cover"
      />

      {/* Thông tin món ăn */}
      <div className="flex flex-col gap-1">
        <p className="w-full text-left font-semibold text-lg">{dish.name}</p>
        <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
          <p>🔥 {dish.calories || 0} kcal</p>
          <p>🥩 {dish.protein || 0}g</p>
          <p>🍞 {dish.carbs || 0}g</p>
          <p>🛢 {dish.fat || 0}g</p>
        </div>
      </div>

      {/* Nút xem công thức (Chỉ hiện nếu có recipeId) */}
      {dish.recipeId && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-0 right-10 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 mt-5 "
        >
          📜Recipe
        </button>
      )}

      {/* Nút xoá */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(dish._id || dish.dishId);
        }}
        disabled={deletingDishId === (dish._id || dish.dishId)}
        className={`absolute top-2 right-2 text-red-500 hover:text-red-700 ${
          deletingDishId === (dish._id || dish.dishId) ? "opacity-50" : ""
        }`}
      >
        {deletingDishId === (dish._id || dish.dishId) ? (
          <span>...</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        )}
      </button>
      {/* Hiển thị modal */}
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
