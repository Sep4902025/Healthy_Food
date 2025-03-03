import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Age1825 from "../../assets/images/age/18-25.png";
import Age2635 from "../../assets/images/age/26-35.png";
import Age3645 from "../../assets/images/age/36-45.png";
import Age46 from "../../assets/images/age/46.png";

const ageGroups = [
  { age: "18-25", img: Age1825 },
  { age: "26-35", img: Age2635 },
  { age: "36-45", img: Age3645 },
  { age: "46+", img: Age46 },
];

const Age = () => {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate("");
  };

  const [selectedAge, setSelectedAge] = useState(null);
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/gender")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
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
            <span
              onClick={() => navigate("/quizinfor/goal")}
              className="text-lg font-semibold flex-1 text-left"
            >
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
    </div>
  );
};

export default Age;
