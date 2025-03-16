import React from "react";
import { Outlet } from "react-router-dom";

import { selectUser } from "../../store/selectors/authSelectors";
import UserChatButton from "../Chat/UserChatButton";

import Footer from "../../pages/user/footer/Footer";

import Header from "../Header";
import { useSelector } from "react-redux";

const MainLayout = () => {
  const user = useSelector(selectUser);
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat button (chỉ hiển thị nếu là customer) */}
      {user?.role === "user" && <UserChatButton />}
    </div>
  );
};

export default MainLayout;
