import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Chay from "../../assets/images/diet/chay.jpg";
import ThuanChay from "../../assets/images/diet/thuanchay.jpg";
import BinhThuong from "../../assets/images/diet/binhthuong.jpg";
import { RiArrowLeftSLine } from "react-icons/ri";
const dietGroups = [
  { diet: "I am a vegetarian", img: Chay },
  { diet: "I am vegan", img: ThuanChay },
  { diet: "I am a normal eater", img: BinhThuong },
];

const Diet = () => {
  const navigate = useNavigate();
  const [selectedDiet, setSelectedDiet] = useState(null);

  // When the component mounts, load saved data (if any) so the user doesn't have to reselect
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.diet) {
      setSelectedDiet(savedData.diet);
    }
  }, []);

  const handleNext = () => {
    if (!selectedDiet) {
      alert("Please select your diet before proceeding.");
      return;
    }

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update diet in the current object
    const updatedData = {
      ...currentData,
      diet: selectedDiet,
    };

    // Save back to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/mealnumber");
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
          onClick={() => navigate("/survey/waterdrink")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={63} />
      </div>
      <h2 className="text-2xl font-bold text-center">Diet</h2>
      <p className="text-center text-gray-600">
        Choose your diet that you are following
      </p>

      <div className="space-y-4 mt-4">
        {dietGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedDiet === item.diet
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedDiet(item.diet)}
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.diet}
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

export default Diet;
