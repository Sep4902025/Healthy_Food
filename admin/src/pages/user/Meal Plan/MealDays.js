import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import Meals from "./Meals";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";

const MealDays = ({ mealPlanId }) => {
  const { user } = useSelector(selectAuth);
  const [mealDays, setMealDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealDay, setSelectedMealDay] = useState(null);
  console.log("SMDay", selectedMealDay);

  useEffect(() => {
    const fetchMealDays = async () => {
      try {
        const data = await mealPlanService.getMealDaysByMealPlan(mealPlanId);
        if (data.success) {
          setMealDays(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchMealDays();
  }, [mealPlanId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Hàm xử lý khi component Meals đóng lại
  const handleMealsClose = () => {
    setSelectedMealDay(null);
  };

  if (loading) return <p className="text-center text-gray-500">Đang tải danh sách ngày...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {!selectedMealDay ? (
        // Danh sách các ngày
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {mealDays.length > 0 ? (
            mealDays.map((mealDay, index) => (
              <div
                key={mealDay._id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedMealDay(mealDay)}
              >
                <h3 className="text-lg font-semibold">Ngày {index + 1}</h3>
                <p className="text-sm text-gray-500">{formatDate(mealDay.date)}</p>
                <p>{mealDay.meals?.length || 0} bữa ăn</p>
                <span className="text-blue-600 hover:underline">Xem chi tiết</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Chưa có ngày nào trong kế hoạch.</p>
          )}
        </div>
      ) : (
        // Sử dụng component Meals để hiển thị bữa ăn trong ngày
        <Meals mealDayId={selectedMealDay._id} mealPlanId={mealPlanId} onClose={handleMealsClose} />
      )}
    </div>
  );
};

export default MealDays;
