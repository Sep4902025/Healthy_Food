import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const underdiseaseGroups = [
  { id: 1, label: "Tôi bị tiểu đường", icon: "🍭" },
  { id: 2, label: "Tôi bị cao huyết áp", icon: "💗" },
  { id: 3, label: "Tôi bị bệnh gút", icon: "🥩" },
  { id: 4, label: "Tôi bị mỡ máu cao", icon: "🍟" },
  { id: 5, label: "Tôi không mắc bệnh nào dưới đây", icon: "❌" },
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
      alert("Vui lòng chọn ít nhất một lựa chọn.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới (chỉ lưu ID)
    const updatedData = {
      ...currentData,
      underDisease: selectedItems, // Lưu ID
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    console.log("🚀 Dữ liệu UnderDisease đã lưu:", updatedData);

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
      <h2 className="text-2xl font-bold text-center">Bệnh nền</h2>
      <p className="text-center text-gray-600">
        Hãy cho tôi biết về bệnh nền của bạn
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

      {/* Nút Tiếp theo */}
      <button
        onClick={handleNext}
        className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
      >
        Tiếp theo
      </button>
    </div>
  );
};

export default UnderDisease;
