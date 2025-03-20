import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import Chay from "../../assets/images/diet/chay.jpg";
import ThuanChay from "../../assets/images/diet/thuanchay.jpg";
import BinhThuong from "../../assets/images/diet/binhthuong.jpg";

const dietGroups = [
  { diet: "I am a vegetarian", img: Chay },
  { diet: "I am vegan", img: ThuanChay },
  { diet: "I am a normal eater", img: BinhThuong },
];

const Diet = () => {
  const navigate = useNavigate();
  const [selectedDiet, setSelectedDiet] = useState(null);

  // Khi component mount, load dữ liệu đã lưu (nếu có) để user không phải chọn lại
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.diet) {
      setSelectedDiet(savedData.diet);
    }
  }, []);

  const handleNext = () => {
    if (!selectedDiet) {
      alert("Please select your diet before proceeding.");
      return;
    }

    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Ghi đè diet vào object hiện tại
    const updatedData = {
      ...currentData,
      diet: selectedDiet,
    };

    // Lưu lại vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/survey/mealnumber");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/waterdrink")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={63} />
      </div>
      <h2 className="text-2xl font-bold text-center">Diet</h2>
      <p className="text-center text-gray-600">
        Choose your diet that you are following
      </p>

      <div className="space-y-4 mt-4">
        {dietGroups.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg shadow cursor-pointer transition duration-300 ${
              selectedDiet === item.diet
                ? "bg-green-400 text-black"
                : "bg-gray-100 hover:bg-green-200"
            }`}
            onClick={() => setSelectedDiet(item.diet)}
          >
            <span className="text-lg font-semibold flex-1 text-left">
              {item.diet}
            </span>
            <img
              src={item.img}
              alt=""
              className="w-16 h-16 rounded-full object-cover"
            />
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

export default Diet;
