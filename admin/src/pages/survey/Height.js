import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const Height = () => {
  const navigate = useNavigate();
  const [selectedHeight, setSelectedHeight] = useState("");
  const [error, setError] = useState(""); // State to display errors

  // Load data from sessionStorage when the page loads
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.height) {
      setSelectedHeight(savedData.height.toString()); // Convert to string when loading
    }
  }, []);

  // Function to validate height
  const validateHeight = (height) => {
    if (!height.trim()) {
      return "Please enter your height.";
    }

    const numbersOnly = /^[0-9]+$/; // Allow only numbers
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
      setError(validationError); // Only display error when Next is clicked
      return;
    }

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update data with the new height
    const updatedData = {
      ...currentData,
      height: parseFloat(selectedHeight), // Convert to number when saving
    };

    // Save quizData back to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/weightgoal");
  };

  // Handle key press
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
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={26.25} />
      </div>

      <h2 className="text-2xl font-bold text-center">Height</h2>
      <p className="text-center text-gray-600">Please enter your height (cm)</p>

      <div className="mt-4">
        <input
          autoFocus
          type="number"
          value={selectedHeight}
          onChange={(e) => setSelectedHeight(e.target.value)} // Keep value as string
          onKeyDown={handleKeyDown}
          placeholder="Enter your height"
          className={`w-[400px] p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-green-400 outline-none`}
          style={{ MozAppearance: "textfield" }} // Disable spinner for Firefox
        />
        {/* Disable increment/decrement buttons for Webkit (Chrome, Safari) */}
        <style>
          {`
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `}
        </style>

        {/* Display error message */}
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
