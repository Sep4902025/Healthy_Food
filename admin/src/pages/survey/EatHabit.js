import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const eathabitGroups = [
  { id: "Lactose", label: "I am lactose intolerant", icon: "🥛" },
  { id: "Gluten", label: "I don't eat gluten", icon: "🧁" },
  { id: "Vegetarian", label: "I am a vegetarian", icon: "🥦" },
  { id: "Vegan", label: "I am a vegan", icon: "🌿" },
  { id: "None", label: "There's none below", icon: "❌" },
];

const EatHabit = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  // Load data from sessionStorage when the page loads
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.eatHabit) {
      setSelectedItems(savedData.eatHabit);
    }
  }, []);

  const toggleItemSelection = (id) => {
    if (id === "none") {
      // If "none" is selected, keep only "none" and clear other selections
      setSelectedItems(["none"]);
    } else {
      // If another item is selected
      if (selectedItems.includes("none")) {
        // If "none" was previously selected, remove "none" and add the new selection
        setSelectedItems([id]);
      } else {
        // Add or remove the item as usual, but do not allow "none" at the same time
        setSelectedItems((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
      }
    }
  };

  const isSelected = (id) => selectedItems.includes(id);

  const handleNext = () => {
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      eatHabit: selectedItems,
    };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    navigate("/survey/underdisease");
  };

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
          onClick={() => navigate("/survey/longofplan")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={78.75} />
      </div>

      <h2 className="text-2xl font-bold text-center">Eat Habit</h2>
      <p className="text-center text-gray-600">Choose your eating habits</p>

      <div className="space-y-3 mt-4">
        {eathabitGroups.map((eathabit) => (
          <div
            key={eathabit.id}
            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer ${
              isSelected(eathabit.id)
                ? "bg-yellow-50 border-yellow-400"
                : "bg-gray-100"
            }`}
            onClick={() => toggleItemSelection(eathabit.id)}
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isSelected(eathabit.id)}
                onChange={() => toggleItemSelection(eathabit.id)}
                className="w-5 h-5"
                // Disable other options if "none" is selected
                disabled={
                  eathabit.id !== "none" && selectedItems.includes("none")
                }
              />
              <span
                className={`font-medium ${
                  isSelected(eathabit.id) ? "text-yellow-700" : "text-gray-700"
                }`}
              >
                {eathabit.label}
              </span>
            </div>
            {eathabit.icon && <span className="text-2xl">{eathabit.icon}</span>}
          </div>
        ))}
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

export default EatHabit;
