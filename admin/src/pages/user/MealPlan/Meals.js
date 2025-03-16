import React, { useEffect, useRef, useState, useMemo } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import AddDishToMeal from "./AddDishToMeal";
import AddMealModal from "./AddMealModal";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";

const Meals = ({ mealPlanId, mealDayId, onClose }) => {
  const { user } = useSelector(selectAuth);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDay, setMealDay] = useState(null);
  console.log("meal DAya", mealDay);

  const [isAddingDish, setIsAddingDish] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState(null);
  const [deletingDishId, setDeletingDishId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mealPlanType, setMealPlanType] = useState(null);
  const firstLoad = useRef(true);
  const mealsRef = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!firstLoad.current) {
        // Không hiển thị loading nếu đã có dữ liệu
        if (meals.length === 0) {
          setLoading(true);
        }
      }

      try {
        // Lấy thông tin meal plan để kiểm tra type
        const mealPlanResponse = await mealPlanService.getMealPlanById(mealPlanId);
        if (mealPlanResponse.success) {
          setMealPlanType(mealPlanResponse.data.type);
        }

        // Lấy thông tin của meal day
        const mealDayResponse = await mealPlanService.getMealDayById(mealPlanId, mealDayId);
        if (mealDayResponse.success) {
          setMealDay(mealDayResponse.data);
        }

        // Lấy danh sách bữa ăn
        const mealsResponse = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
        if (mealsResponse.success) {
          setMeals(mealsResponse.data);
          mealsRef.current = mealsResponse.data;
        } else {
          setError(mealsResponse.message);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Lỗi khi lấy dữ liệu");
      } finally {
        setLoading(false);
        firstLoad.current = false;
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
        mealsRef.current = response.data;

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

  // Xử lý khi thêm bữa ăn thành công
  const handleMealAdded = async () => {
    try {
      const mealsResponse = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
      if (mealsResponse.success) {
        setMeals(mealsResponse.data);
        mealsRef.current = mealsResponse.data;
      }
    } catch (err) {
      console.error("Lỗi khi refresh danh sách bữa ăn:", err);
    }
  };

  // Xử lý chọn meal với hiệu ứng chuyển tiếp
  const handleMealSelect = (meal) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMeal(meal);
      setIsTransitioning(false);
    }, 150);
  };

  // Xử lý quay lại danh sách meal với hiệu ứng chuyển tiếp
  const handleBackToMeals = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMeal(null);
      setIsTransitioning(false);
    }, 150);
  };
  // Xử lý xóa bữa ăn
  const handleRemoveMealFromDay = async (mealId) => {
    if (!mealId) return;

    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bữa ăn này?");
    if (!confirmDelete) return;

    setDeletingMealId(mealId);
    try {
      const response = await mealPlanService.removeMealFromDay(mealPlanId, mealDayId, mealId);

      if (response.success) {
        // Cập nhật danh sách bữa ăn sau khi xóa
        handleMealAdded();
      } else {
        setError("Không thể xóa bữa ăn!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa bữa ăn:", err);
      setError("Không thể xóa bữa ăn!");
    } finally {
      setDeletingMealId(null);
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

  // Sử dụng useMemo để tránh re-render không cần thiết
  const mealItems = useMemo(() => {
    return meals.map((meal) => (
      <div
        key={meal._id}
        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 relative"
        onClick={() => handleMealSelect(meal)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{meal.mealName}</h3>
            <p className="text-sm text-gray-500">Thời gian: {meal.mealTime}</p>
            <p>{meal.dishes?.length || 0} món ăn</p>
          </div>
          <button
            className="text-red-500 hover:text-red-700 p-1"
            onClick={(e) => {
              e.stopPropagation(); // Ngăn không cho sự kiện click lan ra div cha
              handleRemoveMealFromDay(meal._id);
            }}
            disabled={deletingMealId === meal._id}
          >
            {deletingMealId === meal._id ? (
              <span className="text-gray-400">Đang xóa...</span>
            ) : (
              <span>🗑️ Xóa</span>
            )}
          </button>
        </div>
      </div>
    ));
  }, [meals, deletingMealId, handleRemoveMealFromDay]);

  if (loading && meals.length === 0) {
    return <p className="text-center text-gray-500">Đang tải...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="transition-all duration-300 ease-in-out h-full">
      <div
        className={`h-full overflow-y-auto transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
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

              {/* Hiển thị nút thêm bữa ăn chỉ khi type là custom */}
              {mealPlanType === "custom" && (
                <button
                  onClick={() => setShowAddMealModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Thêm bữa ăn
                </button>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-4">
              Bữa ăn ngày {mealDay ? formatDate(mealDay.date) : "Hôm nay"}
            </h2>

            <div className="space-y-4">
              {meals && meals.length > 0 ? (
                mealItems
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
                onClick={handleBackToMeals}
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
      </div>

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

      {/* Modal thêm bữa ăn */}
      {showAddMealModal && (
        <AddMealModal
          mealPlanId={mealPlanId}
          mealDayId={mealDayId}
          userId={user._id}
          onClose={() => setShowAddMealModal(false)}
          onMealAdded={handleMealAdded}
        />
      )}
    </div>
  );
};

export default React.memo(Meals);
