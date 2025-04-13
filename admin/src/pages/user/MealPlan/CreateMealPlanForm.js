import React, { useState, useEffect } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import UserService from "../../../services/user.service";
import { convertTo24Hour } from "../../../utils/formatTime";
import debounce from "lodash/debounce";
import { toast, ToastContainer } from "react-toastify"; // Thêm react-toastify
import "react-toastify/dist/ReactToastify.css"; // Nhập CSS cho react-toastify

const CreateMealPlanForm = ({ userId, userRole, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState(7);
  const [type, setType] = useState("custom");
  const [meals, setMeals] = useState([{ mealTime: "", mealName: "" }]);
  const [price, setPrice] = useState("");
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);

  const [customDuration, setCustomDuration] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);

  const searchUsers = debounce(async (email) => {
    if (!email) {
      setUserSuggestions([]);
      setTargetUserId(null);
      return;
    }
    try {
      const response = await UserService.searchUserByEmail(email);
      if (response.success) {
        setUserSuggestions(response.users || []);
      } else {
        console.error("Search failed:", response.message);
        setUserSuggestions([]);
        setTargetUserId(null);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUserSuggestions([]);
      setTargetUserId(null);
    }
  }, 300);

  useEffect(() => {
    if (userRole === "nutritionist") {
      searchUsers(targetUserEmail);
    }
  }, [targetUserEmail]);

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

  const handleSelectUser = (user) => {
    setTargetUserEmail(user.email);
    setTargetUserId(user._id);
    setUserSuggestions([]);
  };

  const handleCreateMealPlan = async () => {
    if (!title || !startDate || (type === "fixed" && meals.length === 0)) {
      toast.error("❌ Please fill in all required fields!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (userRole === "nutritionist" && (!price || !targetUserId)) {
      toast.error("❌ Please provide price and select a target user!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const updatedMeals = meals.map((meal) => ({
      ...meal,
      mealTime: convertTo24Hour(meal.mealTime),
    }));

    setCreating(true);
    try {
      const mealPlanData = {
        title,
        userId: userRole === "nutritionist" ? targetUserId : userId,
        createdBy: userId,
        type,
        duration,
        startDate: new Date(startDate).toISOString(),
        meals: type === "fixed" ? updatedMeals : [],
        ...(userRole === "nutritionist" && {
          price: Number(price),
        }),
      };

      const response = await mealPlanService.createMealPlan(mealPlanData);
      if (response.success) {
        toast.success("🎉 Meal Plan created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        onSuccess();
      } else {
        toast.error(`❌ Error: ${response.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("❌ Error creating Meal Plan", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-[#40B491]">
      {/* Thêm ToastContainer để hiển thị toast */}
      <ToastContainer />

      <h2 className="text-xl font-semibold mb-6 text-gray-800">Create New Meal Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter plan title"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
          />
        </div>

        {/* Plan Type */}
        <div>
          <label className="block text-gray-700 mb-1">Plan Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
          >
            <option value="fixed">Fixed (With Meals)</option>
            <option value="custom">Custom (No Meals Required)</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-gray-700 mb-1">Duration (days)</label>
          {userRole === "nutritionist" && (
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={customDuration}
                onChange={() => setCustomDuration(!customDuration)}
                className="mr-2"
              />
              Custom Duration
            </label>
          )}
          {userRole === "nutritionist" && customDuration ? (
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              placeholder="Enter number of days"
            />
          ) : (
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              {userRole === "nutritionist" && <option value={60}>60 Days</option>}
            </select>
          )}
        </div>

        {/* Nutritionist Fields */}
        {userRole === "nutritionist" && (
          <>
            {/* Price */}
            <div>
              <label className="block text-gray-700 mb-1">Price (Vnd)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter price"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              />
            </div>

            {/* Target User Email with Autocomplete */}
            <div className="relative">
              <label className="block text-gray-700 mb-1">Target User Email</label>
              <input
                type="email"
                value={targetUserEmail}
                onChange={(e) => {
                  setTargetUserEmail(e.target.value);
                  if (!e.target.value) setTargetUserId(null);
                }}
                placeholder="Search by user email"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              />
              {userSuggestions.length > 0 && (
                <ul className="absolute z-auto w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {userSuggestions.map((user) => (
                    <li
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {user.avatarUrl && (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Meals List */}
      {type === "fixed" && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Meal List</h3>
            <button
              onClick={handleAddMeal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition duration-200"
            >
              + Add Meal
            </button>
          </div>
          <div className="space-y-4">
            {meals.map((meal, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-md"
              >
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-gray-700 text-sm mb-1">Meal Time</label>
                  <input
                    type="time"
                    value={meal.mealTime}
                    onChange={(e) => handleMealChange(index, "mealTime", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-gray-700 text-sm mb-1">Meal Name</label>
                  <input
                    type="text"
                    value={meal.mealName}
                    onChange={(e) => handleMealChange(index, "mealName", e.target.value)}
                    placeholder="Enter meal name"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                  />
                </div>
                <button
                  onClick={() => handleRemoveMeal(index)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition duration-200"
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
        className={`mt-6 w-full bg-[#40B491] text-white px-4 py-2 rounded-md transition duration-200 ${
          creating ? "opacity-50 cursor-not-allowed" : "hover:bg-[#40B491]/90"
        }`}
      >
        {creating ? "Creating..." : "Create Meal Plan"}
      </button>
    </div>
  );
};

export default CreateMealPlanForm;
