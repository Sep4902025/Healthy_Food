import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const PhoneNumber = () => {
  const navigate = useNavigate();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");

  // Load dữ liệu từ sessionStorage khi mở trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.phoneNumber) {
      setSelectedPhoneNumber(savedData.phoneNumber);
    }
  }, []);

  // Hàm kiểm tra số điện thoại 10 số
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleNext = () => {
    if (!selectedPhoneNumber.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!validatePhoneNumber(selectedPhoneNumber)) {
      alert("Invalid phone number. Please enter a valid 10-digit number.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu mới
    const updatedData = {
      ...currentData,
      phoneNumber: selectedPhoneNumber,
    };

    // Lưu vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/email");
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
        <button
          onClick={() => navigate("/survey/name")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10.5} />
      </div>

      {/* Title & description */}
      <h2 className="text-2xl font-bold text-center">Phone Number</h2>
      <p className="text-center text-gray-600">
        Please enter your phone number
      </p>

      {/* Input field */}
      <div className="mt-4">
        <input
          type="text"
          value={selectedPhoneNumber}
          onChange={(e) => setSelectedPhoneNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your phone number"
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

export default PhoneNumber;
