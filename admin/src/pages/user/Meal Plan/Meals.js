import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";

const Meals = () => {
  const { mealPlanId, mealDayId } = useParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mealDayInfo, setMealDayInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin MealDay nếu có API
        try {
          const dayData = await mealPlanService.getMealDayById(mealDayId);
          if (dayData && dayData.success) {
            setMealDayInfo(dayData.data);
          }
        } catch (err) {
          console.log("Không thể lấy thông tin meal day");
        }

        // Lấy danh sách meals
        console.log(
          `📤 Gửi yêu cầu lấy Meals với MealPlan ID: ${mealPlanId}, MealDay ID: ${mealDayId}`
        );
        const data = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
        console.log("📥 Dữ liệu Meals nhận được:", data);

        if (data.success) {
          setMeals(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Lỗi khi lấy Meals");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mealPlanId, mealDayId]);

  const handleDeleteDish = async (mealId, dishId) => {
    try {
      console.log(`📤 Xoá món ăn ${dishId} khỏi Meal ${mealId}`);
      const response = await mealPlanService.removeDishFromMeal(
        mealPlanId,
        mealDayId,
        mealId,
        dishId
      );

      if (response.success) {
        setMeals((prevMeals) =>
          prevMeals.map((meal) =>
            meal._id === mealId
              ? { ...meal, dishes: meal.dishes.filter((dish) => dish.dishId !== dishId) }
              : meal
          )
        );
      } else {
        setError(response.message || "Xoá món ăn thất bại!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi xoá món ăn:", err);
      setError("Xoá món ăn thất bại!");
    }
  };

  // Định dạng thời gian từ chuỗi "HH:MM" thành "HH:MM AM/PM"
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return timeString;
    }
  };

  // Tính tổng calories của một bữa ăn
  const calculateTotalCalories = (dishes) => {
    return dishes.reduce((total, dish) => total + (parseFloat(dish.calories) || 0), 0);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
        <p className="font-medium">{error}</p>
      </div>
    );

  // Lấy ngày từ thông tin mealDay nếu có
  const formattedDate = mealDayInfo?.date
    ? new Date(mealDayInfo.date).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Ngày không xác định";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/mealPlan" className="hover:text-green-600">
            Kế hoạch ăn uống
          </Link>
          <svg
            className="mx-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <svg
            className="mx-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="text-gray-800 font-medium">{formattedDate}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Lịch ăn trong ngày</h1>
        <p className="text-gray-600 mt-1">{formattedDate}</p>
      </div>

      {/* Danh sách Meals */}
      {meals.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="h-12 w-12 mx-auto text-gray-400 mb-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3h18v18H3z"></path>
            <path d="M9 14v1"></path>
            <path d="M9 19v2"></path>
            <path d="M9 3v2"></path>
            <path d="M9 9v1"></path>
            <path d="M15 14v1"></path>
            <path d="M15 19v2"></path>
            <path d="M15 3v2"></path>
            <path d="M15 9v1"></path>
          </svg>
          <p className="text-gray-600 mb-4">Chưa có bữa ăn nào được thiết lập cho ngày này.</p>
          <Link to={`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/addMeal`}>
            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200">
              Thêm bữa ăn mới
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {meals.map((meal) => (
            <div
              key={meal._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Tiêu đề bữa ăn */}
              <div className="bg-green-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <h3 className="font-semibold text-gray-800">{meal.mealName}</h3>
                  <span className="ml-3 text-sm text-gray-600">{formatTime(meal.mealTime)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {calculateTotalCalories(meal.dishes)} calories
                  </span>
                  <div className="ml-4 flex gap-2">
                    <button className="text-gray-600 hover:text-green-600 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button className="text-gray-600 hover:text-red-600 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Danh sách món ăn */}
              <div className="p-4">
                {meal.dishes.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {meal.dishes.map((dish) => (
                      <div key={dish.dishId} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3">
                            <svg
                              className="h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                              <path d="M7 2v20"></path>
                              <path d="M21 15V2"></path>
                              <path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{dish.name}</p>
                            <p className="text-sm text-gray-500">{dish.calories} calories</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDish(meal._id, dish.dishId)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>Chưa có món ăn nào cho bữa này.</p>
                  </div>
                )}

                {/* Nút thêm món ăn */}
                <div className="mt-4">
                  <Link
                    to={`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${meal._id}/addDish`}
                  >
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center">
                      <svg
                        className="h-4 w-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Thêm món ăn
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nút thêm bữa ăn mới */}
      {meals.length > 0 && (
        <div className="mt-6">
          <Link to={`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/addMeal`}>
            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center">
              <svg
                className="h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Thêm bữa ăn mới
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Meals;
