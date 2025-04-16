import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import mealPlanService from "../../../services/mealPlanServices";
import MealDays from "./MealDays";
import CreateMealPlanForm from "./CreateMealPlanForm";
import MealPlanAimChart from "./MealPlanAimChart";

import { toast } from "react-toastify";
import ConfirmationDialog from "../../../components/ui/ConfirmDialog";

const MealPlan = () => {
  const { user } = useSelector(selectAuth);
  console.log("USER redux", user);

  const [userMealPlan, setUserMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [isMealPlanExpired, setIsMealPlanExpired] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Thêm state cho dialog

  const fetchUserMealPlan = async () => {
    try {
      setLoading(true);
      const response = await mealPlanService.getUserMealPlan(user._id);
      if (response.success) {
        const mealPlan = response.data;
        setUserMealPlan(mealPlan);

        // Kiểm tra xem meal plan đã hết hạn chưa
        const startDate = new Date(mealPlan.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + mealPlan.duration);
        const currentDate = new Date();
        setIsMealPlanExpired(currentDate > endDate);
      } else {
        setUserMealPlan(null);
        setIsMealPlanExpired(false);
      }
    } catch (error) {
      console.error("❌ Error fetching MealPlan:", error);
      setUserMealPlan(null);
      setIsMealPlanExpired(false);
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
    if (!userMealPlan || isMealPlanExpired) return;

    const newIsPause = !userMealPlan.isPause;

    try {
      setProcessingAction(true);
      setUserMealPlan((prev) => ({ ...prev, isPause: newIsPause }));
      const response = await mealPlanService.toggleMealPlanStatus(userMealPlan._id, newIsPause);

      if (response.success) {
        toast.success(`🔔 MealPlan has been ${newIsPause ? "Paused" : "Resumed"} successfully!`);
        await fetchUserMealPlan();
      } else {
        setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
        toast.error(`❌ Error: ${response.message}`);
      }
    } catch (error) {
      setUserMealPlan((prev) => ({ ...prev, isPause: !newIsPause }));
      console.error("❌ Unexpected error while toggling MealPlan status:", error);
      toast.error("❌ An unexpected error occurred while changing the MealPlan status");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteMealPlan = async () => {
    if (!userMealPlan) return;

    // Mở dialog xác nhận
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setProcessingAction(true);
      const response = await mealPlanService.deleteMealPlan(userMealPlan._id);

      if (response.success) {
        toast.success("🗑️ MealPlan has been deleted successfully!");
        setUserMealPlan(null);
        setIsMealPlanExpired(false);
        setShowCreateForm(true);
      } else {
        toast.error(`❌ Error: ${response.message}`);
      }
    } catch (error) {
      console.error("❌ Error deleting MealPlan:", error);
      toast.error("❌ An error occurred while deleting the MealPlan");
    } finally {
      setProcessingAction(false);
      setShowConfirmDialog(false); // Đóng dialog
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false); // Đóng dialog khi hủy
  };

  const handleNutritionTargetsCalculated = (targets) => {
    setNutritionTargets(targets);
  };

  const handleCreateNewPlanClick = () => {
    if (userMealPlan && !isMealPlanExpired) {
      toast.error("❌ Please delete the current MealPlan before creating a new one.");
    } else {
      setShowCreateForm(true);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full mx-auto p-4">
      {userMealPlan ? (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          {isMealPlanExpired && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>
                ⚠️ This MealPlan has expired on{" "}
                {new Date(
                  new Date(userMealPlan.startDate).setDate(
                    new Date(userMealPlan.startDate).getDate() + userMealPlan.duration
                  )
                ).toLocaleDateString()}
                . Please delete it to create a new one.
              </p>
            </div>
          )}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
            <div className="infor flex-1 text-left">
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
                    className={`font-medium ml-1 ${userMealPlan.isPause ? "text-yellow-500" : ""}`}
                    style={{ color: userMealPlan.isPause ? undefined : "#40B491" }}
                  >
                    {userMealPlan.isPause ? "Inactive" : "Active"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <MealPlanAimChart
                mealPlanId={userMealPlan._id}
                duration={userMealPlan.duration}
                onNutritionTargetsCalculated={handleNutritionTargetsCalculated}
              />
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex space-x-2">
                {!isMealPlanExpired && (
                  <button
                    onClick={handleToggleMealPlanStatus}
                    disabled={processingAction}
                    className={`px-4 py-2 rounded text-white ${
                      userMealPlan.isPause ? "" : "hover:bg-[#35977A]"
                    } ${processingAction ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor: userMealPlan.isPause ? "#40B491" : "#Facc15",
                    }}
                  >
                    {userMealPlan.isPause ? "▶️ Continue" : "⏸️ Pause"}
                  </button>
                )}
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
          </div>
          <MealDays mealPlanId={userMealPlan._id} nutritionTargets={nutritionTargets} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          {!showCreateForm ? (
            <button
              onClick={handleCreateNewPlanClick}
              className="text-white px-4 py-2 rounded hover:bg-[#35977A]"
              style={{ backgroundColor: "#40B491" }}
            >
              ✏️ Create New Meal Plan
            </button>
          ) : (
            <div>
              <div className="flex justify-end items-center mb-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-red-600 hover:text-red-800"
                >
                  ❌
                </button>
              </div>
              <CreateMealPlanForm
                userId={user._id}
                userRole={user.role}
                onSuccess={handleCreateSuccess}
              />
            </div>
          )}
        </div>
      )}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Are you sure you want to delete this MealPlan? This action cannot be undone."
      />
    </div>
  );
};

export default MealPlan;
