import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const waterdrinkGroups = [
  { waterdrink: "0,5 - 1,5L ( 2-6 cups )" },
  { waterdrink: "1,5 - 2,5L ( 7-10 cups )" },
  { waterdrink: "More 2,5L ( Hơn 10 cups )" },
  { waterdrink: "No count, depends on the day" },
];

const WaterDrink = () => {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate("");
  };

  const [selectedWaterDrink, setSelectedWaterDrink] = useState(null);
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/sleeptime")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>
      <h2 className="text-2xl font-bold text-center">Water Drink</h2>
      <p className="text-center text-gray-600">
        How many you drink water per day
      </p>

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
            <span
              onClick={() => navigate("/quizinfor/diet")}
              className="text-lg font-semibold flex-1 text-left"
            >
              {item.waterdrink}
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

export default WaterDrink;
