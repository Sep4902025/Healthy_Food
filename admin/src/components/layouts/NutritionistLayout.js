import React from "react";
import { Outlet } from "react-router-dom";

const NutritionistLayout = () => {
  return (
    <div>
      <p>NutritionistLayout</p>
      <Outlet />
    </div>
  );
};

export default NutritionistLayout;
