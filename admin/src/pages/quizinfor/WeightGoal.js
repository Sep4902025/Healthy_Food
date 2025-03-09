import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const WeightGoal = () => {
  const navigate = useNavigate();
  const [selectedWeightGoal, setSelectedWeightGoal] = useState("");

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.weightGoal) {
      setSelectedWeightGoal(savedData.weightGoal);
    }
  }, []);

  const handleNext = () => {
    if (!selectedWeightGoal) {
      alert("Please enter your goal weight before proceeding.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      weightGoal: selectedWeightGoal,
    };

    // Lưu lại vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/quizinfor/gender");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header: nút back + progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/height")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={30} />
      </div>

      {/* Tiêu đề và mô tả */}
      <h2 className="text-2xl font-bold text-center">Weight Goal</h2>
      <p className="text-center text-gray-600">Please enter your goal weight</p>

      {/* Input nhập cân nặng mục tiêu */}
      <div className="mt-4">
        <input
          type="text"
          value={selectedWeightGoal}
          onChange={(e) => setSelectedWeightGoal(e.target.value)}
          placeholder="Enter your goal weight (kg)"
          className="w-full p-4 rounded-lg shadow border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
        />

        {/* Nút Next */}
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

export default WeightGoal;
