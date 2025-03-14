import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import logo from "../assets/images/Logo.png";
import HomeService from "../services/home.service";
import quizService from "../services/quizService";
import { FaSearch } from "react-icons/fa";
import { selectUser } from "../store/selectors/authSelectors";
import { logoutUser } from "../store/actions/authActions";
import { DarkModeContext } from "../pages/context/DarkModeContext";
const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishTypes, setDishTypes] = useState([]);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);

  useEffect(() => {
    const checkUserQuizStatus = async () => {
      if (user) {
        try {
          const response = await quizService.getUserPreference(user._id);
          if (response.data.status === "success") {
            setHasCompletedQuiz(true);
          } else {
            setHasCompletedQuiz(false);
          }
        } catch (error) {
          console.error("Error fetching quiz status:", error);
          setHasCompletedQuiz(false);
        }
      } else {
        setHasCompletedQuiz(false);
      }
    };
    checkUserQuizStatus();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setHasCompletedQuiz(false);
    navigate("/signin");
    toast.success("Đăng xuất thành công!");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await HomeService.getIngredientsGroupedByType();
        if (response.status === "success") {
          setCategories(response.data.map((group) => group._id));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fectDishTypes = async () => {
      try {
        const response = await HomeService.getDishesGroupedByType();
        if (response.status === "success") {
          setDishTypes(response.data.map((group) => group._id));
        }
      } catch (error) {
        console.error("Error fetching dish types:", error);
      }
    };
    fectDishTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };
  return (
    <div className="bg-white shadow-md py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6">
        <img
          src={logo}
          alt="Logo"
          className="w-36 cursor-pointer hover:opacity-80 transition"
        />

        {/* Search bar */}
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search your food..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-500 cursor-pointer hover:text-green-500 transition" />
        </div>

        {/* Navigation */}
        <nav className="flex space-x-6 text-gray-700 font-medium">
          <a href="/" className="hover:text-green-600 transition">
            Home
          </a>
          <a href="/about" className="hover:text-green-600 transition">
            About
          </a>
          <a href="/contact" className="hover:text-green-600 transition">
            Contact
          </a>
          {!hasCompletedQuiz ? (
            <a href="/quizinfor" className="hover:text-green-600 transition">
              Quiz
            </a>
          ) : (
            <a href="/foryou" className="hover:text-green-600 transition">
              For You
            </a>
          )}
        </nav>

        {/* User/Auth Button */}
        {user ? (
          <div className="flex items-center space-x-4">
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-green-400 cursor-pointer hover:scale-105 transition"
                onClick={() => navigate("/user")}
              />
            )}
            <span
              className="text-gray-700 font-semibold cursor-pointer hover:text-green-600 transition"
              onClick={() => navigate("/user")}
            >
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/signin")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
          >
            Sign In / Sign Up
          </button>
        )}

        {/* DarkMode */}
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 text-sm rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-[#309f80] text-white hover:bg-[#267a65] " // Dark Mode
              : "bg-[#d1fae5] text-gray-800 hover:bg-[#b2f5ea] " // Light Mode
          }`}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Dropdowns */}
      <div className="container mx-auto flex space-x-8 px-6 mt-3 border-t pt-2 items-center">
        {/* Ingredient Types Dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={() => toggleDropdown("ingredients")}
            className="text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-300 transition shadow-sm"
          >
            Ingredient Types ▼
          </button>
          {activeDropdown === "ingredients" && (
            <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 animate-fade-in">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => {
                      navigate(`/ingredients/${category}`);
                      setActiveDropdown(null);
                    }}
                  >
                    {category}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">
                  No categories available
                </li>
              )}
            </ul>
          )}
        </div>
        {/* Dish Types Dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={() => toggleDropdown("dishes")}
            className="text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-300 transition shadow-sm"
          >
            Dish Types ▼
          </button>
          {activeDropdown === "dishes" && (
            <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 animate-fade-in">
              {dishTypes.length > 0 ? (
                dishTypes.map((type, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => {
                      navigate(`/dishes/${type}`);
                      setActiveDropdown(null);
                    }}
                  >
                    {type}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">
                  No dish type available
                </li>
              )}
            </ul>
          )}
        </div>
        {/* Meal Plan */}'
        <div className="relative dropdown-container">
          <button
            onClick={() => toggleDropdown("dishes")}
            className="text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-300 transition shadow-sm"
          >
            Meal Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
