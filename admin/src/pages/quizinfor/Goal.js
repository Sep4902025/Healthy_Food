import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Thin from "../../assets/images/goal/thin.jpg";
import Fat from "../../assets/images/goal/fat.jpg";

const goalGroups = [
  { goal: "Muscle gain", img: Thin },
  { goal: "Fat loss", img: Fat },
];

const Goal = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.goal) {
      setSelectedGoal(savedData.goal);
    }
  }, []);

  const handleNext = () => {
    if (!selectedGoal) {
      alert("Please select your goal!");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật goal
    const updatedData = {
      ...currentData,
      goal: selectedGoal,
    };

    // Lưu lại quizData vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/quizinfor/sleeptime");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/age")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>
      <h2 className="text-2xl font-bold text-center">Goal</h2>
      <p className="text-center text-gray-600">Select your goal</p>

      <div className="space-y-4 mt-4">
        {goalGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedGoal === item.goal
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedGoal(item.goal)}
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.goal}
            </span>
            <img
              src={item.img}
              alt={item.goal}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
      >
        Next
      </button>
    </div>
  );
};

export default Goal;
