import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Age1825 from "../../assets/images/age/18-25.png";
import Age2635 from "../../assets/images/age/26-35.png";
import Age3645 from "../../assets/images/age/36-45.png";
import Age46 from "../../assets/images/age/46.png";
import { RiArrowLeftSLine } from "react-icons/ri";
const ageGroups = [
  { age: "18-25", img: Age1825 },
  { age: "26-35", img: Age2635 },
  { age: "36-45", img: Age3645 },
  { age: "46+", img: Age46 },
];

const Age = () => {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState(null);

  // When the component loads, check if any age is already saved
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.age) {
      setSelectedAge(savedData.age);
    }
  }, []);

  const handleNext = () => {
    if (!selectedAge) {
      alert("Please select your age before proceeding.");
      return;
    }

    // Get existing data (if any) from sessionStorage
    const existingData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update age in sessionStorage
    const updatedData = {
      ...existingData,
      age: selectedAge,
    };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/goal");
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
          onClick={() => navigate("/survey/gender")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={42} />
      </div>
      <h2 className="text-2xl font-bold text-center">AGE</h2>
      <p className="text-center text-gray-600">Select your age</p>

      <div className="space-y-4 mt-4">
        {ageGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedAge === item.age
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedAge(item.age)}
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.age}
            </span>
            <img
              src={item.img}
              alt=""
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

export default Age;
