import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const eathabitGroups = [
  { id: "lactose", label: "I am lactose intolerant", icon: "🥛" },
  { id: "gluten", label: "I don't eat gluten", icon: "🧁" },
  { id: "vegetarian", label: "I am a vegetarian", icon: "🥦" },
  { id: "vegan", label: "I am a vegan", icon: "🌿" },
  { id: "none", label: "There's none below", icon: "❌" },
];

const EatHabit = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.eatHabit) {
      setSelectedItems(savedData.eatHabit);
    }
  }, []);

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedItems.includes(id);

  const handleNext = () => {
    // Lấy dữ liệu hiện tại trong sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Ghi đè eatingHabits vào object hiện tại
    const updatedData = {
      ...currentData,
      eatHabit: selectedItems,
    };

    // Lưu lại toàn bộ dữ liệu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng tới trang tiếp theo
    navigate("/survey/underdisease");
  };

  // Hàm xử lý khi nhấn phím
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div
      className="max-w-md mx-auto p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/longofplan")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={78.75} />
      </div>

      <h2 className="text-2xl font-bold text-center">Eat Habit</h2>
      <p className="text-center text-gray-600">Choose your eating habits</p>

      <div className="space-y-3 mt-4">
        {eathabitGroups.map((eathabit) => (
          <div
            key={eathabit.id}
            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer ${
              isSelected(eathabit.id)
                ? "bg-yellow-50 border-yellow-400"
                : "bg-gray-100"
            }`}
            onClick={() => toggleItemSelection(eathabit.id)}
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isSelected(eathabit.id)}
                onChange={() => toggleItemSelection(eathabit.id)}
                className="w-5 h-5"
              />
              <span
                className={`font-medium ${
                  isSelected(eathabit.id) ? "text-yellow-700" : "text-gray-700"
                }`}
              >
                {eathabit.label}
              </span>
            </div>
            {eathabit.icon && <span className="text-2xl">{eathabit.icon}</span>}
          </div>
        ))}
        <button
          onClick={handleNext}
          className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EatHabit;
