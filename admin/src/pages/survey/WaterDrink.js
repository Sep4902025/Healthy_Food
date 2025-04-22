import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const waterdrinkGroups = [
  { waterdrink: "0,5L - 1,5L" },
  { waterdrink: "1,5L - 2,5L" },
  { waterdrink: "More than 2,5L" },
  { waterdrink: "Depends on the day" },
];

const WaterDrink = () => {
  const navigate = useNavigate();
  const [selectedWaterDrink, setSelectedWaterDrink] = useState(null);

  // Load data from sessionStorage when the page opens
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.waterDrink) {
      setSelectedWaterDrink(savedData.waterDrink);
    }
  }, []);

  const handleNext = () => {
    if (!selectedWaterDrink) {
      alert("Please select your daily water intake before proceeding.");
      return;
    }

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update data
    const updatedData = {
      ...currentData,
      waterDrink: selectedWaterDrink,
    };

    // Save to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/diet");
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="w-[400px] mx-auto p-4" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Header with back button and progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/activitylevel")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={57.75} /> {/* Adjust progress according to flow */}
      </div>

      {/* Title and description */}
      <h2 className="text-2xl font-bold text-center text-custom-green">Water Drink</h2>
      <p className="text-center text-gray-600">How much water do you drink per day?</p>

      {/* Selection list */}
      <div className="space-y-4 mt-4">
        {waterdrinkGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedWaterDrink === item.waterdrink
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedWaterDrink(item.waterdrink)}
          >
            <span className="text-lg font-semibold flex-1 text-left">{item.waterdrink}</span>
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

export default WaterDrink;
