import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import mealPlanService from "../../../services/mealPlanServices";
import MealDays from "./MealDays";

const MealsPlan = () => {
  const { user } = useSelector(selectAuth);
  const [userMealPlan, setUserMealPlan] = useState(null);
  console.log("UMP", userMealPlan);

  const [loading, setLoading] = useState(true);
  const [showMealDays, setShowMealDays] = useState(false); // State để hiển thị MealDays

  useEffect(() => {
    const fetchUserMealPlan = async () => {
      try {
        const response = await mealPlanService.getUserMealPlan(user._id);
        if (response.success) {
          setUserMealPlan(response.data);
        }
      } catch (error) {
        console.error("❌ Lỗi lấy MealPlan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMealPlan();
  }, [user._id]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold text-green-600">Meal Plan</h1>

      {userMealPlan ? (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold">{userMealPlan.title}</h2>
          <p>Bắt đầu: {new Date(userMealPlan.startDate).toLocaleDateString()}</p>
          <p>Trạng thái: {userMealPlan.status === "active" ? "Đang hoạt động" : "Tạm dừng"}</p>
          {/* Hiển thị mặc định */}
          <MealDays mealPlanId={userMealPlan._id} />
        </div>
      ) : (
        <p>Chưa có Meal Plan nào.</p>
      )}

      {/* Hiển thị danh sách ngày nếu đã nhấn "Xem chi tiết" 
         <div className="flex gap-4 mt-4">
            <button
              onClick={() => setShowMealDays((prev) => !prev)} // Hiển thị MealDays thay vì điều hướng
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              📅 Xem chi tiết
            </button>
          </div>
      {showMealDays && userMealPlan && <MealDays mealPlanId={userMealPlan._id} />}*/}
    </div>
  );
};

export default MealsPlan;
