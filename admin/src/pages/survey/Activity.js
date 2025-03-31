import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

// Danh sách mức độ hoạt động kèm theo giá trị số
const activitylevelGroups = [
  {
    activitylevel: "Sedentary",
    value: 1.2,
    label: "Little or no exercise",
  },
  {
    activitylevel: "Lightly active",
    value: 1.375,
    label: "Light exercise (1-3 days per week)",
  },
  {
    activitylevel: "Moderately active",
    value: 1.55,
    label: "Moderate exercise (3-5 days per week)",
  },
  {
    activitylevel: "Highly active",
    value: 1.725,
    label: "Heavy exercise (6-7 days per week)",
  },
  {
    activitylevel: "Very active",
    value: 1.9,
    label: "Very intense exercise or physical job",
  },
];

const ActivityLevel = () => {
  const navigate = useNavigate();
  const [selectedActivityLevel, setSelectedActivityLevel] = useState(null);

  // Load dữ liệu từ sessionStorage khi mở trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.activityLevel && savedData.activityLevel.name) {
      setSelectedActivityLevel(savedData.activityLevel.name);
    }
  }, []);

  const handleNext = () => {
    if (!selectedActivityLevel) {
      alert("Please select your daily activity level.");
      return;
    }

    // Tìm object tương ứng với selectedActivityLevel
    const selectedItem = activitylevelGroups.find(
      (item) => item.activitylevel === selectedActivityLevel
    );

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      activityLevel: {
        name: selectedItem.activitylevel,
        value: selectedItem.value,
      },
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    console.log("🚀 Dữ liệu ActivityLevel đã lưu:", updatedData);

    // Điều hướng trang tiếp theo
    navigate("/survey/waterdrink");
  };

  // Hàm xử lý khi nhấn phím
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div
      className="max-w-md mx-auto p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
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
      <h2 className="text-2xl font-bold text-center">Activity Level</h2>
      <p className="text-center text-gray-600">
        What is your daily activity level?
      </p>

      {/* Danh sách lựa chọn */}
      <div className="space-y-4 mt-4">
        {activitylevelGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedActivityLevel === item.activitylevel
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedActivityLevel(item.activitylevel)} // Lưu giá trị tên
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.label || item.activitylevel}{" "}
              {/* Hiển thị label nếu có, nếu không thì hiển thị activitylevel */}
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

export default ActivityLevel;
