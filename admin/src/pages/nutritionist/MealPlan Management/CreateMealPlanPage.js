import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import CreateMealPlanForm from "../../user/MealPlan/CreateMealPlanForm";

const CreateMealPlanPage = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();

  const handleCreateSuccess = () => {
    navigate("/nutritionist/mealplan"); // Quay lại trang danh sách sau khi tạo thành công
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#40B491]">Create New Meal Plan</h1>
        <button
          onClick={() => navigate("/nutritionist/mealplan")}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Back to Meal Plans
        </button>
      </div>
      <CreateMealPlanForm userId={user._id} userRole={user.role} onSuccess={handleCreateSuccess} />
    </div>
  );
};

export default CreateMealPlanPage;