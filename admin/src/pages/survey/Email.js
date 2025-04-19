import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftSLine } from "react-icons/ri";
const Email = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); // State to display errors

  // Load email from sessionStorage when the page loads
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.email) {
      setEmail(savedData.email);
    }
  }, []);

  // Function to validate email
  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return "Please enter your email.";
    }

    // Check for basic email format and @gmail.com domain
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(emailValue)) {
      return "Please enter a valid Gmail address (e.g., example@gmail.com).";
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError); // Only display error when Next is clicked
      return;
    }

    // Get current data from sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Update email in the current object
    const updatedData = {
      ...currentData,
      email,
    };

    // Save the entire quizData back to sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Navigate to the next page
    navigate("/survey/weight");
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
          onClick={() => navigate("/survey/phonenumber")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
        </button>
        <ProgressBar progress={15.75} />
      </div>

      <h2 className="text-2xl font-bold text-center text-custom-green">Email Contact</h2>
      <p className="text-center text-gray-600">Please enter your email</p>

      <div className="mt-4">
        <input
          autoFocus
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Only update the value, no error checking
          onKeyDown={handleKeyDown}
          placeholder="Enter your email"
          className={`w-[400px] p-4 rounded-lg shadow border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-green-400 outline-none`}
        />

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

export default Email;
