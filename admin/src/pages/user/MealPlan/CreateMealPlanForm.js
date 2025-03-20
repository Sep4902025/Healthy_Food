import React, { useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import { convertTo24Hour } from "../../../utils/formatTime";

const CreateMealPlanForm = ({ userId, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]); // Lấy ngày hiện tại
  const [duration, setDuration] = useState(7);
  const [type, setType] = useState("custom");
  const [meals, setMeals] = useState([{ mealTime: "", mealName: "" }]);
  const [creating, setCreating] = useState(false);

  const handleAddMeal = () => {
    setMeals([...meals, { mealTime: "", mealName: "" }]);
  };

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...meals];
    updatedMeals[index][field] = value;
    setMeals(updatedMeals);
  };

  const handleRemoveMeal = (index) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleCreateMealPlan = async () => {
    if (!title || !startDate || (type === "fixed" && meals.length === 0)) {
      alert("❌ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Chuyển đổi thời gian về 24h nếu cần
    const updatedMeals = meals.map((meal) => ({
      ...meal,
      mealTime: convertTo24Hour(meal.mealTime),
    }));

    setCreating(true);
    try {
      const mealPlanData = {
        title,
        userId,
        createdBy: userId,
        type,
        duration,
        startDate,
        meals: type === "fixed" ? updatedMeals : [],
      };

      const response = await mealPlanService.createMealPlan(mealPlanData);
      if (response.success) {
        alert("🎉 Tạo Meal Plan thành công!");
        onSuccess();
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (error) {
      alert("❌ Lỗi khi tạo Meal Plan");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-green-500">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Tạo Meal Plan Mới</h2>

      {/* Nhập tên kế hoạch */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tên kế hoạch"
        className="input-field"
      />

      {/* Chọn ngày bắt đầu */}
      <label className="block text-gray-700 mb-1">Ngày bắt đầu</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="input-field"
      />

      {/* Chọn loại meal plan */}
      <label className="block text-gray-700 mb-1">Loại kế hoạch</label>
      <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
        <option value="fixed">Fixed (Cố định, có bữa ăn)</option>
        <option value="custom">Custom (Không cần nhập bữa ăn)</option>
      </select>

      {/* Chọn thời gian */}
      <label className="block text-gray-700 mb-1">Thời gian</label>
      <select
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="input-field"
      >
        <option value={7}>7 ngày</option>
        <option value={14}>14 ngày</option>
        <option value={14}>30 ngày</option>
      </select>

      {/* Danh sách bữa ăn - Chỉ hiển thị nếu type === "fixed" */}
      {type === "fixed" && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800">Danh sách bữa ăn</h3>
            <button
              onClick={handleAddMeal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition duration-200"
            >
              + Thêm bữa ăn
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {meals.map((meal, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-gray-700 text-sm mb-1">Giờ ăn</label>
                  <input
                    type="time"
                    value={meal.mealTime}
                    onChange={(e) => handleMealChange(index, "mealTime", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-gray-700 text-sm mb-1">Tên bữa ăn</label>
                  <input
                    type="text"
                    value={meal.mealName}
                    onChange={(e) => handleMealChange(index, "mealName", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên bữa ăn"
                  />
                </div>
                <button
                  onClick={() => handleRemoveMeal(index)}
                  className="mt-5 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCreateMealPlan}
        disabled={creating}
        className={`w-full bg-green-500 text-white px-4 py-2 rounded-md transition duration-200 ${
          creating ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
        }`}
      >
        {creating ? "Đang tạo..." : "Tạo Meal Plan"}
      </button>
    </div>
  );
};

export default CreateMealPlanForm;
