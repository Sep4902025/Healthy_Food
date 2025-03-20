import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import mealPlanService from "../../../services/mealPlanServices";
import MealDays from "./MealDays";
import CreateMealPlanForm from "./CreateMealPlanForm";
import ReminderNotification from "../../../components/Reminder/ReminderNotifiaction";
import MealPlanAimChart from "./MealPlanAimChart";

const MealPlan = () => {
  const { user } = useSelector(selectAuth);
  const [userMealPlan, setUserMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);

  const fetchUserMealPlan = async () => {
    try {
      setLoading(true);
      const response = await mealPlanService.getUserMealPlan(user._id);
      if (response.success) {
        setUserMealPlan(response.data);
      } else {
        setUserMealPlan(null);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy MealPlan:", error);
      setUserMealPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMealPlan();
  }, [user._id]);

  const handleCreateSuccess = () => {
    fetchUserMealPlan();
    setShowCreateForm(false);
  };

  const handleToggleMealPlanStatus = async () => {
    if (!userMealPlan) return;

    try {
      setProcessingAction(true);
      const isPause = !userMealPlan.isPause;
      const response = await mealPlanService.toggleMealPlanStatus(userMealPlan._id, isPause);

      if (response.success) {
        alert(`🔔 MealPlan đã được ${isPause ? "tạm dừng" : "tiếp tục"} thành công!`);
        fetchUserMealPlan();
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (error) {
      alert("❌ Có lỗi xảy ra khi thay đổi trạng thái MealPlan");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteMealPlan = async () => {
    if (!userMealPlan) return;

    // Xác nhận xóa
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa MealPlan này? Hành động này không thể hoàn tác.")
    ) {
      return;
    }

    try {
      setProcessingAction(true);
      const response = await mealPlanService.deleteMealPlan(userMealPlan._id);

      if (response.success) {
        alert("🗑️ MealPlan đã được xóa thành công!");
        setUserMealPlan(null);
        setShowCreateForm(true);
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (error) {
      alert("❌ Có lỗi xảy ra khi xóa MealPlan");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle nutrition targets calculated from MealPlanAimChart
  const handleNutritionTargetsCalculated = (targets) => {
    setNutritionTargets(targets);
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="w-full mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-green-600">Meal Plan</h1>
      </div>
      {userMealPlan ? (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="infor">
              <p className="text-gray-600">
                Title: <span className="font-medium">{userMealPlan.title}</span>
              </p>
              <p className="text-gray-600">
                Start:{" "}
                <span className="font-medium">
                  {new Date(userMealPlan.startDate).toLocaleDateString()}
                </span>
              </p>
              <p className="text-gray-600">
                Time: <span className="font-medium">{userMealPlan.duration} Days</span>
              </p>
              <p className="text-gray-600">
                Type:
                <span className="font-medium">
                  {userMealPlan.type === "fixed" ? "Fixed" : "Custom"}
                </span>
              </p>

              <div>
                <p className="text-gray-600">
                  Status:
                  <span
                    className={`font-medium ml-1 ${
                      userMealPlan.isPause ? "text-yellow-500" : "text-green-500"
                    }`}
                  >
                    {userMealPlan.isPause ? "Inactive" : "Active"}
                  </span>
                </p>
              </div>
            </div>
            <MealPlanAimChart
              mealPlanId={userMealPlan._id}
              duration={userMealPlan.duration}
              onNutritionTargetsCalculated={handleNutritionTargetsCalculated}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleToggleMealPlanStatus}
                disabled={processingAction}
                className={`px-4 py-2 rounded text-white ${
                  userMealPlan.isPause
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } ${processingAction ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {userMealPlan.isPause ? "▶️ Continue" : "⏸️ Pause"}
              </button>
              <button
                onClick={handleDeleteMealPlan}
                disabled={processingAction}
                className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ${
                  processingAction ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          {/* Pass nutritionTargets to MealDays */}
          <MealDays mealPlanId={userMealPlan._id} nutritionTargets={nutritionTargets} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              ✏️ Tạo Meal Plan mới
            </button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Tạo Meal Plan mới</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ❌ Hủy
                </button>
              </div>
              <CreateMealPlanForm userId={user._id} onSuccess={handleCreateSuccess} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlan;
