import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const waterdrinkGroups = [
  { waterdrink: "0,5 - 1,5L (2-6 cups)" },
  { waterdrink: "1,5 - 2,5L (7-10 cups)" },
  { waterdrink: "More than 2,5L (More than 10 cups)" },
  { waterdrink: "No count, depends on the day" },
];

const WaterDrink = () => {
  const navigate = useNavigate();
  const [selectedWaterDrink, setSelectedWaterDrink] = useState(null);

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.waterDrink) {
      setSelectedWaterDrink(savedData.waterDrink);
    }
  }, []);

  const handleNext = () => {
    if (!selectedWaterDrink) {
      alert("Please select your daily water intake before proceeding.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      waterDrink: selectedWaterDrink,
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Chuyển sang trang tiếp theo
    navigate("/quizinfor/diet");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header với back button và progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/sleeptime")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={60} /> {/* Điều chỉnh progress theo flow */}
      </div>

      {/* Tiêu đề và mô tả */}
      <h2 className="text-2xl font-bold text-center">Water Drink</h2>
      <p className="text-center text-gray-600">
        How much water do you drink per day?
      </p>

      {/* Danh sách lựa chọn */}
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
            <span className="text-lg font-semibold flex-1 text-left">
              {item.waterdrink}
            </span>
          </div>
        ))}
      </div>

      {/* Nút Next */}
      <button
        onClick={handleNext}
        className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
      >
        Next
      </button>
    </div>
  );
};

export default WaterDrink;
