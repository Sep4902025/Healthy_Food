import React from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const QuizLayout = () => {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate("/quizinfor/name");
  };
  return (
    <div>
      <button onClick={handleNext}>Start</button>
      <Outlet />
    </div>
  );
};

export default QuizLayout;
