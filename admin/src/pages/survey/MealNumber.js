import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const mealnumberGroups = [
  { mealnumber: "1 meal" },
  { mealnumber: "2 meals" },
  { mealnumber: "3 meals" },
  { mealnumber: "4 meals" },
];

const MealNumber = () => {
  const navigate = useNavigate();
  const [selectedMealNumber, setSelectedMealNumber] = useState(null);

  // Load dữ liệu từ sessionStorage khi mở trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.mealNumber) {
      setSelectedMealNumber(savedData.mealNumber);
    }
  }, []);

  const handleNext = () => {
    if (!selectedMealNumber) {
      alert("Please select how many meals you eat per day.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      mealNumber: selectedMealNumber,
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/longofplan");
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
      {/* Header with back button & progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/diet")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={68.25} />
      </div>

      {/* Title & description */}
      <h2 className="text-2xl font-bold text-center">Meal Number</h2>
      <p className="text-center text-gray-600">
        How many meals do you eat per day?
      </p>

      {/* Meal options */}
      <div className="space-y-4 mt-4">
        {mealnumberGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedMealNumber === item.mealnumber
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedMealNumber(item.mealnumber)}
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.mealnumber}
            </span>
          </div>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
      >
        Next
      </button>
    </div>
  );
};

export default MealNumber;
