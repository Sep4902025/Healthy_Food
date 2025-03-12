import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";

const MealsPlan = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const { user } = useSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // State cho Form nhập liệu
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState(7);
  const [meals, setMeals] = useState([{ mealTime: "", mealName: "" }]);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const data = await mealPlanService.getAllMealPlans();
      if (data.success) {
        setMealPlans(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Lỗi khi lấy MealPlans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMealPlan = async () => {
    if (!title || !startDate || meals.length === 0) {
      alert("❌ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setCreating(true);

    const mealPlanData = {
      title,
      userId: "67c5b0b78eb6dd318e4748b9",
      createdBy: "67c5b0b78eb6dd318e4748b9",
      type: "fixed",
      duration,
      startDate,
      price: "150000",
      meals,
    };

    try {
      const response = await mealPlanService.createMealPlan(mealPlanData);
      if (response.success) {
        alert("🎉 Tạo Meal Plan thành công!");
        fetchMealPlans();
        setShowForm(false);
        resetForm();
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (error) {
      alert("❌ Lỗi khi tạo Meal Plan");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setDuration(7);
    setMeals([{ mealTime: "", mealName: "" }]);
  };

  const handleDeleteMealPlan = async (mealPlanId) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa Meal Plan này?");
    if (!confirmDelete) return;

    try {
      const response = await mealPlanService.deleteMealPlan(mealPlanId);
      if (response.success) {
        alert("✅ Xóa Meal Plan thành công!");
        setMealPlans((prev) => prev.filter((mealPlan) => mealPlan._id !== mealPlanId));
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (error) {
      alert("❌ Lỗi khi xóa Meal Plan");
    }
  };

  const handleAddMeal = () => {
    setMeals([...meals, { mealTime: "", mealName: "" }]);
  };

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...meals];
    updatedMeals[index][field] = value;
    setMeals(updatedMeals);
  };

  const handleRemoveMeal = (index) => {
    const updatedMeals = meals.filter((_, i) => i !== index);
    setMeals(updatedMeals);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-green-600">Meal Plans</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition duration-200"
        >
          {showForm ? "Đóng Form" : "+ Tạo Meal Plan"}
        </button>
      </div>

      {/* Form tạo Meal Plan */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Tạo Meal Plan Mới</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">Tên kế hoạch</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập tên kế hoạch"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Thời gian</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full md:w-1/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={3}>3 ngày</option>
              <option value={5}>5 ngày</option>
              <option value={7}>7 ngày</option>
              <option value={14}>14 ngày</option>
            </select>
          </div>

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
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition duration-200"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateMealPlan}
              disabled={creating}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Đang tạo..." : "Tạo Meal Plan"}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách Meal Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.length === 0 ? (
          <div className="col-span-full bg-gray-50 p-8 text-center rounded-lg border border-dashed border-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-600">Không có Meal Plan nào. Hãy tạo Meal Plan mới!</p>
          </div>
        ) : (
          mealPlans.map((mealPlan) => (
            <div
              key={mealPlan._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-lg transition duration-200"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{mealPlan.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      mealPlan.type === "fixed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {mealPlan.type}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-gray-600 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(mealPlan.startDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {mealPlan.duration} ngày
                  </p>
                  <p className="text-green-600 font-medium flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {parseFloat(mealPlan.price).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
                <Link
                  to={`/mealPlan/${mealPlan._id}/mealDay`}
                  className="text-green-600 hover:text-green-700 font-medium text-sm transition duration-200"
                >
                  Xem chi tiết
                </Link>
                <button
                  onClick={() => handleDeleteMealPlan(mealPlan._id)}
                  className="text-red-500 hover:text-red-600 transition duration-200"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MealsPlan;
