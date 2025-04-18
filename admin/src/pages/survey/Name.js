import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const Name = () => {
  const navigate = useNavigate();
  const [selectedName, setSelectedName] = useState("");
  const [error, setError] = useState(""); // State to display errors

  // Load data from sessionStorage when the page opens
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.name) {
      setSelectedName(savedData.name);
    }
  }, []);

  // Function to validate input
  const validateName = (name) => {
    // Allow only letters and spaces
    const lettersOnly = /^[A-Za-z\s]+$/;

    if (!name.trim()) {
      return "Please enter your name.";
    }

    if (!lettersOnly.test(name)) {
      return "Name must contain only letters and spaces.";
    }

    // Check if there are at least two words (first and last name)
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return "Please enter both first and last name.";
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateName(selectedName);
    if (validationError) {
      setError(validationError); // Only display error when Next is clicked
      return;
    }

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update data
    const updatedData = {
      ...currentData,
      name: selectedName.trim(),
    };

    // Save to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/phonenumber");
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header with back button & progress bar */}
      <div className="w-[400px] flex items-center justify-center mt-2">
        <ProgressBar progress={5.25} />
      </div>

      {/* Title & description */}
      <h2 className="text-2xl font-bold text-center">Name</h2>
      <p className="text-center text-gray-600">Please enter your full name</p>

      {/* Input field */}
      <div className="mt-4">
        <input
          autoFocus
          type="text"
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)} // Only update value, no error checking
          onKeyDown={handleKeyDown}
          placeholder="Enter your full name"
          className={`w-full p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-green-400 outline-none`}
        />

        {/* Display error message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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
