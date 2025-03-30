import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const Height = () => {
  const navigate = useNavigate();
  const [selectedHeight, setSelectedHeight] = useState("");
  const [error, setError] = useState(""); // State để hiển thị lỗi

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.height) {
      setSelectedHeight(savedData.height.toString()); // Chuyển thành chuỗi khi load
    }
  }, []);

  // Hàm kiểm tra chiều cao
  const validateHeight = (height) => {
    if (!height.trim()) {
      return "Please enter your height.";
    }

    const numbersOnly = /^[0-9]+$/; // Chỉ cho phép số
    if (!numbersOnly.test(height)) {
      return "Height must contain only numbers.";
    }

    const heightNum = Number(height);
    if (heightNum <= 0) {
      return "Height must be greater than 0.";
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateHeight(selectedHeight);
    if (validationError) {
      setError(validationError); // Chỉ hiển thị lỗi khi nhấn Next
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Cập nhật dữ liệu với chiều cao mới
    const updatedData = {
      ...currentData,
      height: parseFloat(selectedHeight), // Chuyển thành số khi lưu
    };

    // Lưu lại quizData vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/weightgoal");
  };

  // Hàm xử lý khi nhấn phím
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/weight")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={26.25} />
      </div>

      <h2 className="text-2xl font-bold text-center">Height</h2>
      <p className="text-center text-gray-600">Please enter your height (cm)</p>

      <div className="mt-4">
        <input
          type="number"
          value={selectedHeight}
          onChange={(e) => setSelectedHeight(e.target.value)} // Giữ giá trị là chuỗi
          onKeyDown={handleKeyDown}
          placeholder="Enter your height"
          className={`w-full p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-green-400 outline-none`}
          style={{ MozAppearance: "textfield" }} // Tắt spinner cho Firefox
        />
        {/* Tắt nút tăng giảm cho Webkit (Chrome, Safari) */}
        <style>
          {`
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `}
        </style>

        {/* Hiển thị thông báo lỗi */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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

export default Height;
