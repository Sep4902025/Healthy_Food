import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

// Danh sách mức độ hoạt động kèm theo giá trị số
const activityGroups = [
  { activity: "Sedentary", value: 1.2 },
  { activity: "Lightly active", value: 1.375 },
  { activity: "Moderately active", value: 1.55 },
  { activity: "Highly active", value: 1.725 },
  { activity: "Very active", value: 1.9 },
];

const Activity = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Load dữ liệu từ sessionStorage khi mở trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.activity) {
      setSelectedActivity(savedData.activity);
    }
  }, []);

  const handleNext = () => {
    if (!selectedActivity) {
      alert("Please select your daily activity level.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      activity: selectedActivity, // Lưu giá trị số
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng trang tiếp theo
    navigate("/survey/waterdrink");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header với back button và progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/sleeptime")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={52.5} />
      </div>

      {/* Tiêu đề và mô tả */}
      <h2 className="text-2xl font-bold text-center">Physical Activity</h2>
      <p className="text-center text-gray-600">
        How many hours of physical activity do you do per day?
      </p>

      {/* Danh sách lựa chọn */}
      <div className="space-y-4 mt-4">
        {activityGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedActivity === item.value
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedActivity(item.value)} // Lưu giá trị số
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.activity}
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

export default Activity;
