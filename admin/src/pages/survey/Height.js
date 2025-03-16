import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const Height = () => {
  const navigate = useNavigate();
  const [selectedHeight, setSelectedHeight] = useState("");

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.height) {
      setSelectedHeight(savedData.height); // Load chiều cao đã lưu
    }
  }, []);

  const handleNext = () => {
    if (!selectedHeight || isNaN(selectedHeight) || selectedHeight <= 0) {
      alert("Please enter a valid height.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu với chiều cao mới
    const updatedData = {
      ...currentData,
      height: parseFloat(selectedHeight),
    };

    // Lưu lại quizData vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/weightgoal");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/weight")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>

      <h2 className="text-2xl font-bold text-center">Height</h2>
      <p className="text-center text-gray-600">Please enter your height (cm)</p>

      <div className="mt-4">
        <input
          type="number"
          value={selectedHeight}
          onChange={(e) => setSelectedHeight(e.target.value)}
          placeholder="Enter your height"
          className="w-full p-4 rounded-lg shadow border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
          min="1"
        />
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

export default Height;
