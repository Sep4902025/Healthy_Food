import React, { useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";

const AddMealModal = ({ mealPlanId, mealDayId, userId, onClose, onMealAdded }) => {
  const [newMealData, setNewMealData] = useState({
    mealName: "",
    mealTime: "",
    userId: userId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMealData.mealName || !newMealData.mealTime) {
      setError("Vui lòng điền đầy đủ thông tin bữa ăn!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await mealPlanService.addMealToDay(mealPlanId, mealDayId, newMealData);

      if (response.success) {
        setNewMealData({ mealName: "", mealTime: "" });
        onMealAdded();
        onClose();
      } else {
        setError("Không thể thêm bữa ăn!");
      }
    } catch (err) {
      console.error("Lỗi khi thêm bữa ăn:", err);
      setError("Không thể thêm bữa ăn!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Thêm bữa ăn mới</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên bữa ăn</label>
              <input
                type="text"
                value={newMealData.mealName}
                onChange={(e) => setNewMealData({ ...newMealData, mealName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ví dụ: Bữa sáng, Bữa trưa..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
              <input
                type="time"
                value={newMealData.mealTime}
                onChange={(e) => setNewMealData({ ...newMealData, mealTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                } text-white px-4 py-2 rounded`}
              >
                {isSubmitting ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;
