import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const underdiseaseGroups = [
  { id: "diabetes", label: "I am diabetic", icon: "🍭" },
  { id: "hypertension", label: "I have high blood pressure", icon: "💗" },
  { id: "gout", label: "I have gout", icon: "🥩" },
  { id: "dyslipidemia", label: "I have high cholesterol", icon: "🍟" },
  { id: "none", label: "There's none below", icon: "❌" },
];

const UnderDisease = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  // Load dữ liệu từ sessionStorage khi mở trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.underDisease) {
      setSelectedItems(savedData.underDisease);
    }
  }, []);

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedItems.includes(id);

  const handleNext = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one option.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      underDisease: selectedItems,
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/favorite");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header với back button và progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/eathabit")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={84} />
      </div>

      {/* Tiêu đề và mô tả */}
      <h2 className="text-2xl font-bold text-center">Under Disease</h2>
      <p className="text-center text-gray-600">
        Let me know your under disease
      </p>

      {/* Danh sách lựa chọn */}
      <div className="space-y-3 mt-4">
        {underdiseaseGroups.map((underdisease) => (
          <div
            key={underdisease.id}
            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer ${
              isSelected(underdisease.id)
                ? "bg-yellow-50 border-yellow-400"
                : "bg-gray-100"
            }`}
            onClick={() => toggleItemSelection(underdisease.id)}
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isSelected(underdisease.id)}
                onChange={() => toggleItemSelection(underdisease.id)}
                className="w-5 h-5"
              />
              <span
                className={`font-medium ${
                  isSelected(underdisease.id)
                    ? "text-yellow-700"
                    : "text-gray-700"
                }`}
              >
                {underdisease.label}
              </span>
            </div>

            {underdisease.icon && (
              <span className="text-2xl">{underdisease.icon}</span>
            )}
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

export default UnderDisease;
