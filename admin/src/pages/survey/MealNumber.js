import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const mealnumberGroups = [
  { mealnumber: "1 meal" },
  { mealnumber: "2 meals" },
  { mealnumber: "3 meals" },
  { mealnumber: "4 meals" },
];

const MealNumber = () => {
  const navigate = useNavigate();
  const [selectedMealNumber, setSelectedMealNumber] = useState(null);

  // Load data from sessionStorage when the page opens
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

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update data
    const updatedData = {
      ...currentData,
      mealNumber: selectedMealNumber,
    };

    // Save to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/longofplan");
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="w-[400px] mx-auto p-4" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Header with back button & progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/diet")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={68.25} />
      </div>

      {/* Title & description */}
      <h2 className="text-2xl font-bold text-center text-custom-green">Meal Number</h2>
      <p className="text-center text-gray-600">How many meals do you eat per day?</p>

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
            <span className="text-lg font-semibold flex-1 text-left">{item.mealnumber}</span>
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
