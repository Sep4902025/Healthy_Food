import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
// List of activity levels with corresponding values
const activitylevelGroups = [
  {
    activitylevel: "Sedentary",
    value: 1.2,
    label: "Little or no exercise",
  },
  {
    activitylevel: "Lightly active",
    value: 1.375,
    label: "Light exercise (1-3 days per week)",
  },
  {
    activitylevel: "Moderately active",
    value: 1.55,
    label: "Moderate exercise (3-5 days per week)",
  },
  {
    activitylevel: "Highly active",
    value: 1.725,
    label: "Heavy exercise (6-7 days per week)",
  },
  {
    activitylevel: "Very active",
    value: 1.9,
    label: "Very intense exercise or physical job",
  },
];

const ActivityLevel = () => {
  const navigate = useNavigate();
  const [selectedActivityLevel, setSelectedActivityLevel] = useState(null);

  // Load data from sessionStorage when the page loads
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.activityLevel && savedData.activityLevel.name) {
      setSelectedActivityLevel(savedData.activityLevel.name);
    }
  }, []);

  const handleNext = () => {
    if (!selectedActivityLevel) {
      alert("Please select your daily activity level.");
      return;
    }

    // Find the object corresponding to selectedActivityLevel
    const selectedItem = activitylevelGroups.find(
      (item) => item.activitylevel === selectedActivityLevel
    );

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update data
    const updatedData = {
      ...currentData,
      activityLevel: {
        name: selectedItem.activitylevel,
        value: selectedItem.value,
      },
    };

    // Save to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    console.log("🚀 ActivityLevel data saved:", updatedData);

    // Navigate to the next page
    navigate("/survey/waterdrink");
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
          onClick={() => navigate("/survey/sleeptime")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={52.5} />
      </div>

      {/* Title and description */}
      <h2 className="text-2xl font-bold text-center text-custom-green">Activity Level</h2>
      <p className="text-center text-gray-600">What is your daily activity level?</p>

      {/* Selection list */}
      <div className="space-y-4 mt-4">
        {activitylevelGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedActivityLevel === item.activitylevel
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedActivityLevel(item.activitylevel)} // Store the name value
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.label || item.activitylevel}{" "}
              {/* Display label if available, otherwise display activitylevel */}
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

export default ActivityLevel;
