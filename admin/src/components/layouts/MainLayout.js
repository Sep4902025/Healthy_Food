import React, {useContext } from "react";
import { Outlet } from "react-router-dom";
import { selectUser } from "../../store/selectors/authSelectors";
import UserChatButton from "../Chat/UserChatButton";
import Footer from "../../pages/user/footer/Footer";
import Header from "../Header";
import { useSelector } from "react-redux";
import { DarkModeContext } from './../../pages/context/DarkModeContext';

const MainLayout = () => {
  const user = useSelector(selectUser);
  const { darkMode } = useContext(DarkModeContext);
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen dark:bg-gray-400 ">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-col">
        <Outlet context={{ darkMode }} />
      </main>

      {/* Footer */}
      <Footer/>

      {/* Chat button (chỉ hiển thị nếu là customer) */}
      {user?.role === "user" && <UserChatButton darkMode={darkMode} />}
    </div>
  );
};

export default MainLayout;
