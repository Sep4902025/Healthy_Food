import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const phonenumberGroups = [{ phonenumber: "" }];

const PhoneNumber = () => {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate("");
  };

  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/name")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>
      <h2 className="text-2xl font-bold text-center">Phone Number</h2>
      <p className="text-center text-gray-600">
        Please enter your phone number
      </p>

      <div className="mt-4">
        <input
          type="text"
          value={selectedPhoneNumber}
          onChange={(e) => setSelectedPhoneNumber(e.target.value)}
          placeholder="Enter your phone number"
          className="w-full p-4 rounded-lg shadow border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
        />
        <button
          onClick={() => navigate("/quizinfor/email")}
          className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PhoneNumber;
