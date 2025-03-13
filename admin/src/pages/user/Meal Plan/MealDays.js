import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import Meals from "./Meals";

const MealDays = ({ mealPlanId }) => {
  const [mealDays, setMealDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealDay, setSelectedMealDay] = useState(null); // State để lưu ngày được chọn
  console.log("SLD", selectedMealDay);

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
  }, [mealPlanId._id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <p className="text-center text-gray-500">Đang tải danh sách ngày...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="w-full  mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {mealDays.length > 0 ? (
            mealDays.map((mealDay, index) => (
              <div key={mealDay._id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold">Ngày {index + 1}</h3>
                <p className="text-sm text-gray-500">{formatDate(mealDay.date)}</p>
                <p>{mealDay.meals?.length || 0} bữa ăn</p>

                {/* Button thay vì Link */}
                <button
                  onClick={() => setSelectedMealDay(mealDay)} // Set state để hiển thị Meals
                  className="text-blue-600 hover:underline"
                >
                  Xem chi tiết
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Chưa có ngày nào trong kế hoạch.</p>
          )}
        </div>
      </div>
      <div className="w-full z-10">
        {/* Hiển thị danh sách bữa ăn của ngày được chọn */}
        {selectedMealDay && (
          <Meals
            mealDayId={selectedMealDay._id}
            mealPlanId={mealPlanId}
            onClose={() => setSelectedMealDay(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MealDays;
