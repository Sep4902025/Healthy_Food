import React, { useEffect, useState, useRef } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import Meals from "./Meals";

const MealDays = ({ mealPlanId }) => {
  const [mealDays, setMealDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealDay, setSelectedMealDay] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const firstLoad = useRef(true);
  const mealDaysRef = useRef([]);

  const fetchMealDays = async () => {
    if (!mealPlanId) return;

    if (!firstLoad.current) {
      // Chỉ hiển thị loading khi chưa có dữ liệu
      if (mealDays.length === 0) {
        setLoading(true);
      }
    }

    setError(null);
    try {
      const data = await mealPlanService.getMealDaysByMealPlan(mealPlanId);
      if (data.success) {
        const newData =
          JSON.stringify(mealDaysRef.current) !== JSON.stringify(data.data)
            ? data.data
            : mealDaysRef.current;
        setMealDays(newData);
        mealDaysRef.current = newData;
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu");
    } finally {
      setLoading(false);
      firstLoad.current = false;
    }
  };

  useEffect(() => {
    fetchMealDays();
    setSelectedMealDay(null);
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

  // Xử lý chọn ngày với hiệu ứng chuyển tiếp
  const handleMealDaySelect = (mealDay) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMealDay(mealDay);
      setIsTransitioning(false);
    }, 150);
  };

  // Xử lý đóng Meals với hiệu ứng chuyển tiếp
  const handleMealsClose = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMealDay(null);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      {/* Container cố định chiều cao */}
      <div className="h-[500px]">
        {" "}
        {/* Đặt chiều cao cố định ở đây */}
        {loading && mealDays.length === 0 ? (
          <p className="text-center text-gray-500">Đang tải danh sách ngày...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            {/* Sử dụng hiệu ứng fade để chuyển đổi giữa hai phần */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {!selectedMealDay ? (
                // Danh sách ngày
                <div className="h-[490px] overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 gap-4">
                    {mealDays.length > 0 ? (
                      mealDays.map((mealDay, index) => (
                        <div
                          key={mealDay._id}
                          className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleMealDaySelect(mealDay)}
                        >
                          <h3 className="text-lg font-semibold">Ngày {index + 1}</h3>
                          <p className="text-sm text-gray-500">{formatDate(mealDay.date)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">Chưa có ngày nào trong kế hoạch.</p>
                    )}
                  </div>
                </div>
              ) : (
                // Component Meals - đảm bảo rằng Meals cũng tôn trọng chiều cao này
                <div className="h-full overflow-y-auto">
                  <Meals
                    mealDayId={selectedMealDay._id}
                    mealPlanId={mealPlanId}
                    onClose={handleMealsClose}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(MealDays);
