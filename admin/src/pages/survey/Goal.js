import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Thin from "../../assets/images/goal/thin.jpg";
import Fat from "../../assets/images/goal/fat.jpg";
import ThinWoman from "../../assets/images/goal/thin_Woman.webp";
import FatWoman from "../../assets/images/goal/fat_Woman.webp";
import { RiArrowLeftSLine } from "react-icons/ri";

// Define goal groups with gender property
const goalGroups = [
  { goal: "Muscle gain", img: Thin, gender: "Male" },
  { goal: "Fat loss", img: Fat, gender: "Male" },
  { goal: "Muscle gain", img: ThinWoman, gender: "Female" },
  { goal: "Fat loss", img: FatWoman, gender: "Female" },
];

const Goal = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filteredGoalGroups, setFilteredGoalGroups] = useState([]);

  // Load saved data and filter goal groups based on gender
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const selectedGender = savedData.gender || "Male"; // Default to Male if no gender is selected

    // Filter goal groups based on selected gender
    const filteredGroups = goalGroups.filter(
      (group) => group.gender === selectedGender
    );
    setFilteredGoalGroups(filteredGroups);

    // Set previously selected goal if available
    if (savedData.goal) {
      setSelectedGoal(savedData.goal);
    }
  }, []);

  const handleNext = () => {
    if (!selectedGoal) {
      alert("Please select your goal!");
      return;
    }

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update goal
    const updatedData = {
      ...currentData,
      goal: selectedGoal,
    };

    // Save quizData back to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/sleeptime");
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div
      className="w-[400px] mx-auto p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/age")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={47.25} />
      </div>
      <h2 className="text-2xl font-bold text-center">Goal</h2>
      <p className="text-center text-gray-600">Select your goal</p>

      <div className="space-y-4 mt-4">
        {filteredGoalGroups.map((item, index) => (
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
