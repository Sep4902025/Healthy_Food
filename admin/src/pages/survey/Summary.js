import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userPreferenceService from "../../../services/userPreferenceService";

const Summary = () => {
  const [quizData, setQuizData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("quizData")) || {};
    setQuizData(data);
  }, []);

  const handleSubmit = async () => {
    const response = await userPreferenceService.saveUserPreference();

    if (response.success) {
      alert("Dữ liệu đã được lưu thành công!");
      sessionStorage.removeItem("quizData");
      navigate("/");
    } else {
      alert(response.message || "Có lỗi xảy ra khi lưu dữ liệu.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-center">Summary</h2>

      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        {JSON.stringify(quizData, null, 2)}
      </pre>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-green-600 transition mt-5"
      >
        Submit
      </button>
    </div>
  );
};

export default Summary;
