import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Chay from "../../assets/images/diet/chay.jpg";
import ThuanChay from "../../assets/images/diet/thuanchay.jpg";
import BinhThuong from "../../assets/images/diet/binhthuong.jpg";

const dietGroups = [
  { diet: "I am a vegetarian", img: Chay },
  { diet: "I am vegan", img: ThuanChay },
  { diet: "I am a normal eater", img: BinhThuong },
];

const Diet = () => {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate("");
  };
  const [selectedDiet, setSelectedDiet] = useState(null);
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/waterdrink")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>
      <h2 className="text-2xl font-bold text-center">Diet</h2>
      <p className="text-center text-gray-600">
        Choose your diet that you following
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
            <span
              onClick={() => navigate("/quizinfor/mealnumber")}
              className="text-lg font-semibold flex-1 text-left"
            >
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
    </div>
  );
};

export default Diet;
