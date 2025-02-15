import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0">
        <div className="w-24 h-24 bg-green-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      </div>
      <div className="absolute bottom-0 right-0">
        <div className="w-32 h-32 bg-green-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-50"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
