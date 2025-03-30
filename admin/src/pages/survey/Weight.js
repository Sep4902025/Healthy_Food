import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const Weight = () => {
  const navigate = useNavigate();
  const [selectedWeight, setSelectedWeight] = useState("");
  const [error, setError] = useState("");

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.weight) {
      setSelectedWeight(savedData.weight);
    }
  }, []);

  // Hàm kiểm tra cân nặng
  const validateWeight = (weight) => {
    if (!weight.trim()) {
      return "Please enter your weight.";
    }

    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(weight)) {
      return "Weight must contain only numbers.";
    }

    const weightNum = Number(weight);
    if (weightNum <= 0) {
      return "Weight must be greater than 0.";
    }

    // Kiểm tra với weightGoal từ sessionStorage
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const weightGoal = savedData.weightGoal;
    if (weightGoal && weightNum === Number(weightGoal)) {
      return "Current weight cannot be the same as your goal weight.";
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateWeight(selectedWeight);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      weight: selectedWeight,
    };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    navigate("/survey/height");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/email")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={21} />
      </div>

      <h2 className="text-2xl font-bold text-center">Weight</h2>
      <p className="text-center text-gray-600">Please enter your weight</p>

      <div className="mt-4">
        <input
          type="number"
          value={selectedWeight}
          onChange={(e) => setSelectedWeight(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your weight (kg)"
          className={`w-full p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-green-400 outline-none`}
          style={{ MozAppearance: "textfield" }}
        />
        <style>
          {`
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `}
        </style>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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
