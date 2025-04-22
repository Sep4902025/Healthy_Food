import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const WeightGoal = () => {
  const navigate = useNavigate();
  const [selectedWeightGoal, setSelectedWeightGoal] = useState("");
  const [error, setError] = useState("");

  // Load data from sessionStorage when the page opens
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.weightGoal) {
      setSelectedWeightGoal(savedData.weightGoal);
    }
  }, []);

  // Function to validate goal weight
  const validateWeightGoal = (weightGoal) => {
    if (!weightGoal.trim()) {
      return "Please enter your goal weight.";
    }

    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(weightGoal)) {
      return "Goal weight must contain only numbers.";
    }

    const weightGoalNum = Number(weightGoal);
    if (weightGoalNum <= 0) {
      return "Goal weight must be greater than 0.";
    }

    // Check against current weight from sessionStorage
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const weight = savedData.weight;
    if (weight && weightGoalNum === Number(weight)) {
      return "Goal weight cannot be the same as your current weight.";
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateWeightGoal(selectedWeightGoal);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      weightGoal: selectedWeightGoal,
    };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    navigate("/survey/gender");
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
          onClick={() => navigate("/survey/height")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={31.5} />
      </div>

      <h2 className="text-2xl font-bold text-center text-custom-green">Weight Goal</h2>
      <p className="text-center text-gray-600">Please enter your goal weight</p>

      <div className="mt-4">
        <input
          autoFocus
          type="number"
          value={selectedWeightGoal}
          onChange={(e) => setSelectedWeightGoal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your goal weight (kg)"
          className={`w-[400px] p-4 rounded-lg shadow border ${
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

export default WeightGoal;
