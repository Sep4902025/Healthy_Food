import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";

const AddDishToMeal = ({ mealPlanId, mealDayId, mealId, onClose, onDishAdded, userId }) => {
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const response = await mealPlanService.getAllDishes();
        if (response.success) {
          setDishes(response.data);
        } else {
          setError(response.message || "Không thể lấy danh sách món ăn");
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách món ăn:", error);
        setError("Không thể lấy danh sách món ăn");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  const handleAddDish = async () => {
    if (!selectedDish) {
      alert("Vui lòng chọn một món ăn!");
      return;
    }

    try {
      const newDish = {
        dishId: selectedDish._id,
        name: selectedDish.name,
        calories: selectedDish.calories,
      };

      const response = await mealPlanService.addDishToMeal(
        mealPlanId,
        mealDayId,
        mealId,
        newDish,
        userId
      );
      if (response.success) {
        onDishAdded(); // Callback để cập nhật danh sách món ăn sau khi thêm thành công
        onClose(); // Đóng modal
      } else {
        setError(response.message || "Thêm món ăn thất bại");
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn:", error);
      setError("Không thể thêm món ăn");
    }
  };

  if (loading) return <p>Đang tải danh sách món ăn...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Chọn món ăn</h2>

        {/* Danh sách món ăn */}
        <div className="max-h-64 overflow-y-auto border p-2 rounded">
          {dishes.map((dish) => (
            <label key={dish._id} className="block p-2 border-b cursor-pointer hover:bg-gray-100">
              <input
                type="radio"
                name="selectedDish"
                checked={selectedDish?._id === dish._id}
                onChange={() => setSelectedDish(dish)}
                className="mr-2"
              />
              {dish.name} ({dish.calories} kcal)
            </label>
          ))}
        </div>

        {/* Nút Thêm món và Hủy */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleAddDish}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            disabled={!selectedDish}
          >
            Thêm món ăn
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDishToMeal;
