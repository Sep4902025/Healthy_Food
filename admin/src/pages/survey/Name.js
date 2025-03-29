import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const Name = () => {
  const navigate = useNavigate();
  const [selectedName, setSelectedName] = useState("");

  // Load dữ liệu từ sessionStorage khi mở trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.name) {
      setSelectedName(savedData.name);
    }
  }, []);

  const handleNext = () => {
    if (!selectedName.trim()) {
      alert("Please enter your name.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      name: selectedName,
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/phonenumber");
  };

  // Hàm xử lý khi nhấn phím
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header with back button & progress bar */}
      <div className="w-full flex items-center justify-center mt-2">
        <ProgressBar progress={5.25} />
      </div>

      {/* Title & description */}
      <h2 className="text-2xl font-bold text-center">Name</h2>
      <p className="text-center text-gray-600">Please enter your name</p>

      {/* Input field */}
      <div className="mt-4">
        <input
          type="text"
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your name"
          className="w-full p-4 rounded-lg shadow border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
        />

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Name;
