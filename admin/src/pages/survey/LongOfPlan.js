import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const longofplanGroups = [
  { longofplan: "3 months" },
  { longofplan: "6 months" },
  { longofplan: "9 months" },
  { longofplan: "12 months" },
];

const LongOfPlan = () => {
  const navigate = useNavigate();
  const [selectedLongOfPlan, setSelectedLongOfPlan] = useState(null);

  // Load dữ liệu từ sessionStorage khi trang được mở
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.longOfPlan) {
      setSelectedLongOfPlan(savedData.longOfPlan);
    }
  }, []);

  const handleNext = () => {
    if (!selectedLongOfPlan) {
      alert("Please select how long you want to use the plan.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      longOfPlan: selectedLongOfPlan,
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/eathabit");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/mealnumber")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={73.5} />
      </div>

      <h2 className="text-2xl font-bold text-center">Long Of Plan</h2>
      <p className="text-center text-gray-600">
        How long do you want to use the plan?
      </p>

      <div className="space-y-4 mt-4">
        {longofplanGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedLongOfPlan === item.longofplan
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedLongOfPlan(item.longofplan)}
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.longofplan}
            </span>
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

export default LongOfPlan;
