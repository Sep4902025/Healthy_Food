import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";

const AddDishToMeal = ({ mealPlanId, mealDayId, mealId, onClose, onDishAdded, userId }) => {
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [existingDishes, setExistingDishes] = useState([]);

  useEffect(() => {
    // Tách việc lấy danh sách món ăn và thông tin bữa ăn hiện tại thành 2 hàm riêng biệt
    const fetchAllDishes = async () => {
      try {
        const dishesResponse = await mealPlanService.getAllDishes();

        if (dishesResponse.success) {
          setDishes(dishesResponse.data);
          return true;
        } else {
          setError(dishesResponse.message || "Không thể lấy danh sách món ăn");
          return false;
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách món ăn:", error);
        setError("Không thể lấy danh sách món ăn");
        return false;
      }
    };

    const fetchCurrentMeal = async () => {
      try {
        const mealResponse = await mealPlanService.getMealById(mealPlanId, mealDayId, mealId);

        if (mealResponse.success && mealResponse.data && mealResponse.data.dishes) {
          setExistingDishes(mealResponse.data.dishes);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin bữa ăn:", error);
        // Không hiển thị lỗi khi không lấy được danh sách món ăn đã tồn tại
        // Chúng ta vẫn có thể hiển thị danh sách món ăn
      }
    };

    const loadData = async () => {
      setLoading(true);

      // Lấy danh sách món ăn trước
      const dishesSuccess = await fetchAllDishes();

      // Nếu lấy danh sách món ăn thành công thì mới lấy thông tin bữa ăn
      if (dishesSuccess) {
        await fetchCurrentMeal();
      }

      setLoading(false);
    };

    loadData();
  }, [mealPlanId, mealDayId, mealId]);

  // Kiểm tra xem món ăn đã có trong bữa ăn chưa
  const isDishAlreadyAdded = (dish) => {
    if (!existingDishes || existingDishes.length === 0) return false;

    return existingDishes.some(
      (existingDish) =>
        (existingDish.dishId && existingDish.dishId === dish._id) ||
        existingDish._id === dish._id ||
        existingDish.name === dish.name
    );
  };

  const handleAddDish = async () => {
    if (!selectedDish) {
      alert("Vui lòng chọn một món ăn!");
      return;
    }

    // Kiểm tra nếu món ăn đã tồn tại
    if (isDishAlreadyAdded(selectedDish)) {
      alert("Món ăn này đã được thêm vào bữa ăn!");
      return;
    }

    try {
      setIsAdding(true);
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
        setIsAdding(false);
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn:", error);
      setError("Không thể thêm món ăn");
      setIsAdding(false);
    }
  };

  // Nếu không lấy được danh sách món ăn, hiển thị lỗi và nút đóng
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <p className="text-center">Đang tải danh sách món ăn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <p className="text-red-500 text-center mb-4">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chọn món ăn</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Danh sách món ăn */}
        {dishes.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border p-2 rounded mb-4">
            {dishes.map((dish) => {
              const isAlreadyAdded = isDishAlreadyAdded(dish);
              return (
                <label
                  key={dish._id}
                  className={`block p-2 border-b cursor-pointer hover:bg-gray-100 ${
                    isAlreadyAdded ? "opacity-50" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedDish"
                    checked={selectedDish?._id === dish._id}
                    onChange={() => setSelectedDish(dish)}
                    className="mr-2"
                    disabled={isAdding || isAlreadyAdded}
                  />
                  {dish.name} ({dish.calories} kcal)
                  {isAlreadyAdded && <span className="ml-2 text-xs text-red-500">Đã thêm</span>}
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 my-4">Không có món ăn nào</p>
        )}

        {/* Nút Thêm món và Hủy */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleAddDish}
            className={`${
              isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-4 py-2 rounded-lg`}
            disabled={
              isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
            }
          >
            {isAdding ? "Đang thêm..." : "Thêm món ăn"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            disabled={isAdding}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDishToMeal;
