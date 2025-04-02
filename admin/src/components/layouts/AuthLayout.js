import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logoutUser } from "../../store/actions/authActions";
import { selectUser } from "../../store/selectors/authSelectors";
import UserChatButton from "../Chat/UserChatButton";
import { FaSearch } from "react-icons/fa";

import logo from "../../assets/images/Logo.png";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/signin");
  };

  return (
    <div className=" bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                <img src={logo} alt="Logo" className="w-40 h-16" />
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your food"
                  className="px-4 py-2 border rounded-lg"
                />
                <FaSearch className="absolute right-3 top-3 text-gray-500" />
              </div>
              <nav className="flex space-x-4">
                <a href="/" className="text-gray-700 hover:text-gray-900">
                  Home
                </a>
                <a href="/about" className="text-gray-700 hover:text-gray-900">
                  About
                </a>
                <a href="/contact" className="text-gray-700 hover:text-gray-900">
                  Contact
                </a>
              </nav>
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    {user.avatar_url && (
                      <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-gray-700">Xin chào, {user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/signin")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main>
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-white shadow-md mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-600">© 2025 Your Company. All rights reserved.</p>
        </div>
      </footer>
      {user?.role === "user" && <UserChatButton />}
    </div>
  );
};

export default MainLayout;
