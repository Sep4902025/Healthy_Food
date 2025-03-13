import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import AddDishToMeal from "./AddDishToMeal";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";

const Meals = ({ mealDayId, mealPlanId, onClose }) => {
  const { user } = useSelector(selectAuth);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDay, setMealDay] = useState(null);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [deletingDishId, setDeletingDishId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin của meal day
        const mealDayResponse = await mealPlanService.getMealDayById(mealPlanId, mealDayId);
        if (mealDayResponse.success) {
          setMealDay(mealDayResponse.data);
        }

        // Lấy danh sách bữa ăn
        const mealsResponse = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
        if (mealsResponse.success) {
          setMeals(mealsResponse.data);
        } else {
          setError(mealsResponse.message);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Lỗi khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mealPlanId, mealDayId]);

  // Xử lý khi thêm món ăn thành công
  const handleDishAdded = async () => {
    setIsAddingDish(false);
    try {
      const response = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
      if (response.success) {
        setMeals(response.data);

        // Cập nhật món ăn trong meal đã chọn
        if (selectedMeal) {
          const updatedMeal = response.data.find((m) => m._id === selectedMeal._id);
          if (updatedMeal) {
            setSelectedMeal(updatedMeal);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi khi refresh danh sách món ăn:", err);
    }
  };

  // Xử lý xóa món ăn
  const handleDeleteDish = async (dishId) => {
    if (!selectedMeal || !dishId) return;

    setDeletingDishId(dishId);
    try {
      const response = await mealPlanService.deleteDishFromMeal(
        mealPlanId,
        mealDayId,
        selectedMeal._id,
        dishId
      );

      if (response.success) {
        // Cập nhật danh sách món ăn sau khi xóa
        handleDishAdded();
      } else {
        setError("Không thể xóa món ăn!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa món ăn:", err);
      setError("Không thể xóa món ăn!");
    } finally {
      setDeletingDishId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenAddDishModal = () => {
    setIsAddingDish(true);
    setShowAddDishModal(true);
  };

  const handleCloseAddDishModal = () => {
    setShowAddDishModal(false);
    setIsAddingDish(false);
  };

  if (loading) return <p className="text-center text-gray-500">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      {!selectedMeal ? (
        // Xem danh sách bữa ăn trong ngày
        <div>
          <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="flex items-center text-blue-600 hover:underline">
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
                className="mr-2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-4">
            Bữa ăn ngày {mealDay ? formatDate(mealDay.date) : "Hôm nay"}
          </h2>

          <div className="space-y-4">
            {meals && meals.length > 0 ? (
              meals.map((meal) => (
                <div
                  key={meal._id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedMeal(meal)}
                >
                  <h3 className="font-medium">{meal.mealName}</h3>
                  <p className="text-sm text-gray-500">Thời gian: {meal.mealTime}</p>
                  <p>{meal.dishes?.length || 0} món ăn</p>
                  <span className="text-blue-600 hover:underline text-sm">Xem chi tiết bữa ăn</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Chưa có bữa ăn nào trong ngày này.</p>
            )}
          </div>
        </div>
      ) : (
        // Xem chi tiết món ăn trong bữa ăn
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setSelectedMeal(null)}
              className="flex items-center text-blue-600 hover:underline"
            >
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
                className="mr-2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>

            <button
              onClick={handleOpenAddDishModal}
              disabled={isAddingDish}
              className={`${
                isAddingDish ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded`}
            >
              {isAddingDish ? "Đang thêm..." : "Thêm món ăn"}
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold">{selectedMeal.mealName}</h2>
            <p className="text-gray-500">Thời gian: {selectedMeal.mealTime}</p>
          </div>

          <h3 className="font-medium mb-2">Danh sách món ăn:</h3>
          <div className="space-y-2">
            {selectedMeal.dishes && selectedMeal.dishes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMeal.dishes.map((dish, index) => (
                  <div key={index} className="border rounded-md p-3 bg-gray-50 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{dish.name}</p>
                        <p className="text-sm text-gray-500">{dish.calories || 0} kcal</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDish(dish._id || dish.dishId);
                        }}
                        disabled={deletingDishId === (dish._id || dish.dishId)}
                        className={`text-red-500 hover:text-red-700 ${
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có món ăn nào trong bữa này.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal thêm món ăn */}
      {showAddDishModal && selectedMeal && (
        <AddDishToMeal
          mealPlanId={mealPlanId}
          mealDayId={mealDayId}
          mealId={selectedMeal._id}
          userId={user._id}
          onClose={handleCloseAddDishModal}
          onDishAdded={handleDishAdded}
        />
      )}
    </div>
  );
};

export default Meals;
