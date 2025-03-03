import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Male from "../../assets/images/gender/male.jpg";
import Female from "../../assets/images/gender/female.jpg";

const genderGroups = [
  { gender: "Male", img: Male },
  { gender: "Female", img: Female },
];

const Gender = () => {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate("");
  };

  const [selectedGender, setSelectedGender] = useState(null);
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/weightgoal")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>
      <h2 className="text-2xl font-bold text-center">Gender</h2>
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
            <span
              onClick={() => navigate("/quizinfor/age")}
              className="text-lg font-semibold flex-1 text-left"
            >
              {item.gender}
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

export default Gender;
