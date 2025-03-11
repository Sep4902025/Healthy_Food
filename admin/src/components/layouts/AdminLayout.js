import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../../pages/user/footer/Footer"; // Import Footer
import Header from "../Header";

const AdminLayout = () => {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      {/* Main Content */}
      <main className="flex-grow p-6 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminLayout;
