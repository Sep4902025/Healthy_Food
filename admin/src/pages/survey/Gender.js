import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Male from "../../assets/images/gender/male.jpg";
import Female from "../../assets/images/gender/female.jpg";

const genderGroups = [
  { gender: "Male", img: Male },
  { gender: "Female", img: Female },
];

const Gender = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState(null);

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.gender) {
      setSelectedGender(savedData.gender);
    }
  }, []);

  const handleNext = () => {
    if (!selectedGender) {
      alert("Please select your gender!");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Ghi đè gender vào object hiện tại
    const updatedData = {
      ...currentData,
      gender: selectedGender,
    };

    // Lưu lại toàn bộ quizData vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/age");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/weightgoal")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>
      <h2 className="text-2xl font-bold text-center">Gender</h2>
      <p className="text-center text-gray-600">Select your gender</p>

      <div className="space-y-4 mt-4">
        {genderGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedGender === item.gender
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedGender(item.gender)}
          >
            <span className="text-lg font-semibold flex-1 text-left">{item.gender}</span>
            <img src={item.img} alt={item.gender} className="w-16 h-16 rounded-full object-cover" />
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

export default Gender;
