import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const PhoneNumber = () => {
  const navigate = useNavigate();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.phoneNumber) {
      setSelectedPhoneNumber(savedData.phoneNumber);
    }
  }, []);

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) {
      return "Please enter your phone number.";
    }

    const numbersOnly = /^[0-9]+$/; // Allow only digits
    if (!numbersOnly.test(phone)) {
      return "Phone number must contain only digits.";
    }

    if (phone.length !== 10) {
      return "Phone number must be exactly 10 digits.";
    }

    // Check if the phone number starts with 0
    if (!phone.startsWith("0")) {
      return "Phone number must start with 0.";
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validatePhoneNumber(selectedPhoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      phoneNumber: selectedPhoneNumber,
    };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    navigate("/survey/email");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/name")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={10.5} />
      </div>

      <h2 className="text-2xl font-bold text-center text-custom-green">Phone Number</h2>
      <p className="text-center text-gray-600">Please enter your phone number</p>

      <div className="mt-4">
        <input
          autoFocus
          type="text"
          value={selectedPhoneNumber}
          onChange={(e) => setSelectedPhoneNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your phone number"
          className={`w-[400px] p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-green-400 outline-none`}
        />

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

export default PhoneNumber;
