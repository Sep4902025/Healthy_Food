import React, { useState } from "react";
import RecipeModal from "./RecipeModal"; // Import modal

const DishCard = ({ dish, onDelete, deletingDishId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="border rounded-lg p-5 bg-white shadow-md mb-4 flex flex-col gap-4 hover:shadow-lg transition-shadow">
      {/* Header: Hình ảnh và tên món ăn */}
      <div className="flex items-center gap-5">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-[80px] h-[80px] rounded-full object-cover flex-shrink-0"
        />
        <p className="text-xl font-semibold text-gray-800">{dish.name}</p>
      </div>

      {/* Thông tin dinh dưỡng */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-600 p-3 rounded-md">
        <p>🔥 {dish.calories || 0} kcal</p>
        <p>🥩 {dish.protein || 0}g</p>
        <p>🍞 {dish.carbs || 0}g</p>
        <p>🛢 {dish.fat || 0}g</p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center mt-2">
        {/* Nút Recipe (nếu có) */}
        {dish.recipeId && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm bg-blue-100 text-blue-600 py-1.5 px-4 rounded hover:bg-blue-200 transition-colors"
          >
            📜 Xem Công Thức
          </button>
        )}
        {/* Nút Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(dish._id || dish.dishId);
          }}
          disabled={deletingDishId === (dish._id || dish.dishId)}
          className={`text-red-500 hover:text-red-700 transition-colors ${
            deletingDishId === (dish._id || dish.dishId) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {deletingDishId === (dish._id || dish.dishId) ? (
            <span className="animate-pulse text-sm">Đang xóa...</span>
          ) : (
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              <span className="text-sm">Xóa</span>
            </div>
          )}
        </button>
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
