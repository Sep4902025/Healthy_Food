import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Male from "../../assets/images/gender/male.jpg";
import Female from "../../assets/images/gender/female.jpg";
import { RiArrowLeftSLine } from "react-icons/ri";
const genderGroups = [
  { gender: "Male", img: Male },
  { gender: "Female", img: Female },
];

const Gender = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState(null);

  // Load data from sessionStorage when the page loads
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.gender) {
      setSelectedGender(savedData.gender);
    }
  }, []);

  const handleNext = () => {
    if (!selectedGender) {
      alert("Please select your gender!");
      return;
    }

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update gender in the current object
    const updatedData = {
      ...currentData,
      gender: selectedGender,
    };

    // Save the entire quizData back to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/age");
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="w-[400px] mx-auto p-4" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/weightgoal")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={36.75} />
      </div>
      <h2 className="text-2xl font-bold text-center text-custom-green">Gender</h2>
      <p className="text-center text-gray-600">Select your gender</p>

      <div className="space-y-4 mt-4">
        {genderGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedGender === item.gender
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedGender(item.gender)}
          >
            <span className="text-lg font-semibold flex-1 text-left">{item.gender}</span>
            <img src={item.img} alt={item.gender} className="w-16 h-16 rounded-full object-cover" />
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

export default Gender;
