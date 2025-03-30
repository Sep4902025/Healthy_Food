import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const Email = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); // State để hiển thị lỗi

  // Load email từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.email) {
      setEmail(savedData.email);
    }
  }, []);

  // Hàm kiểm tra email
  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return "Please enter your email.";
    }

    // Kiểm tra định dạng email cơ bản và đuôi @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(emailValue)) {
      return "Please enter a valid Gmail address (e.g., example@gmail.com).";
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError); // Chỉ hiển thị lỗi khi nhấn Next
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Ghi đè email vào object hiện tại
    const updatedData = {
      ...currentData,
      email,
    };

    // Lưu lại toàn bộ quizData vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng trang tiếp theo
    navigate("/survey/weight");
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
          onClick={() => navigate("/survey/phonenumber")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={15.75} />
      </div>

      <h2 className="text-2xl font-bold text-center">Email</h2>
      <p className="text-center text-gray-600">Please enter your email</p>

      <div className="mt-4">
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Chỉ cập nhật giá trị, không kiểm tra lỗi
          onKeyDown={handleKeyDown}
          placeholder="Enter your email"
          className={`w-full p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-green-400 outline-none`}
        />

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

export default Email;
