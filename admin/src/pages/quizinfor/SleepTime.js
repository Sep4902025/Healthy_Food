import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const sleeptimeGroups = [
  { sleeptime: "Less than 5 hours" },
  { sleeptime: "5-6 hours" },
  { sleeptime: "7-8 hours" },
  { sleeptime: "More than 8 hours" },
];

const SleepTime = () => {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate("");
  };

  const [selectedSleepTime, setSelectedSleepTime] = useState(null);
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/goal")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>
      <h2 className="text-2xl font-bold text-center">Sleep Time</h2>
      <p className="text-center text-gray-600">How long you sleep per day</p>

      <div className="space-y-4 mt-4">
        {sleeptimeGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedSleepTime === item.sleeptime
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedSleepTime(item.sleeptime)}
          >
            <span
              onClick={() => navigate("/quizinfor/waterdrink")}
              className="text-lg font-semibold flex-1 text-left"
            >
              {item.sleeptime}
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

export default SleepTime;
