import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logoutUser } from "../../store/actions/authActions";
import { selectUser } from "../../store/selectors/authSelectors";
import UserChatButton from "../Chat/UserChatButton";
import { FaSearch } from "react-icons/fa";
import logo from '../../assets/images/Logo.png'; 

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/signin");
    toast.success("Đăng xuất thành công!");
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md py-2">
        <div className="container mx-auto flex items-center justify-between px-6">
          <img src={logo} alt="Logo" className="w-32" />
          
          {/* Search bar */}
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Enter your food"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-6 text-gray-700 font-medium">
            <a href="/" className="hover:text-black">Home</a>
            <a href="/about" className="hover:text-black">About</a>
            <a href="/contact" className="hover:text-black">Contact</a>
          </nav>
          
          {/* Auth Button */}
          {user ? (
            <div className="flex items-center space-x-4">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full cursor-pointer" onClick={() => navigate("/user")} />
              )}
              <span className="text-gray-700 cursor-pointer" onClick={() => navigate("/user")}>
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/signin")}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition"
            >
              Register/Login
            </button>
          )}
        </div>
        
        {/* Dropdowns */}
        <div className="container mx-auto flex space-x-8 px-6 mt-2 border-t pt-2">
          {["Recipes", "Categories", "Favorites", "Meal Plans"].map((item) => (
            <div className="relative" key={item}>
              <button onClick={() => toggleDropdown(item)} className="text-gray-700 font-medium">{item} ▼</button>
              {activeDropdown === item && (
                <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <li className="px-4 py-2 hover:bg-gray-100">{item} 1</li>
                  <li className="px-4 py-2 hover:bg-gray-100">{item} 2</li>
                </ul>
              )}
            </div>
          ))}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto py-6 px-6">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-md py-4 mt-auto text-center text-gray-600">
        © 2025 Your Company. All rights reserved.
      </footer>
      
      {user?.role === "customer" && <UserChatButton />}
    </div>
  );
};

export default MainLayout;
