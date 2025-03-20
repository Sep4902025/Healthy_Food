import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const Weight = () => {
  const navigate = useNavigate();
  const [selectedWeight, setSelectedWeight] = useState("");

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.weight) {
      setSelectedWeight(savedData.weight);
    }
  }, []);

  const handleNext = () => {
    if (!selectedWeight) {
      alert("Please enter your weight before proceeding.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      weight: selectedWeight,
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/height");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header với Back button và Progress Bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/email")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={21} /> {/* Điều chỉnh progress theo flow */}
      </div>

      {/* Tiêu đề và mô tả */}
      <h2 className="text-2xl font-bold text-center">Weight</h2>
      <p className="text-center text-gray-600">Please enter your weight</p>

      {/* Input nhập cân nặng */}
      <div className="mt-4">
        <input
          type="number"
          value={selectedWeight}
          onChange={(e) => setSelectedWeight(Number(e.target.value))}
          placeholder="Enter your weight (kg)"
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

export default Weight;
