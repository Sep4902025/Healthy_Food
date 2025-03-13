import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logoutUser } from "../../store/actions/authActions";
import { selectUser } from "../../store/selectors/authSelectors";
import UserChatButton from "../Chat/UserChatButton";
import { FaSearch } from "react-icons/fa";
import logo from "../../assets/images/Logo.png";
import HomeService from "../../services/home.service";
import ReminderNotification from "../Reminder/ReminderNotifiaction";
import Footer from "../../pages/user/footer/Footer";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishTypes, setDishTypes] = useState([]);

  const handleLogout = () => {
    dispatch(logoutUser());
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
    <div className="flex flex-col bg-gray-50 min-h-screen">
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
            <a href="/" className="hover:text-black">
              Home
            </a>
            <a href="/about" className="hover:text-black">
              About
            </a>
            <a href="/contact" className="hover:text-black">
              Contact
            </a>
            <a href="/foodrecommend" className="hover:text-black">
              Food Recommend
            </a>
          </nav>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center space-x-4">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => navigate("/user")}
                />
              )}
              <span className="text-gray-700 cursor-pointer" onClick={() => navigate("/user")}>
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                SignOut
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/signin")}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition"
            >
              SignUp/SignIn
            </button>
          )}
        </div>

        {/* Dropdowns */}
        {/* Dropdowns chung một hàng */}
        <div className="container mx-auto flex space-x-8 px-6 mt-2 border-t pt-2 items-center">
          {/* Dropdown Ingredients */}
          <div className="relative dropdown-container">
            <button
              onClick={() => toggleDropdown("ingredients")}
              className="text-gray-700 font-medium px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Ingredient Types ▼
            </button>
            {activeDropdown === "ingredients" && (
              <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                {categories.length > 0 ? (
                  categories.map((category, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate(`/ingredients/${category}`);
                        setActiveDropdown(null);
                      }}
                    >
                      {category}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No categories available</li>
                )}
              </ul>
            )}
          </div>

          {/* Dropdown Dishes */}
          <div className="relative dropdown-container">
            <button
              onClick={() => toggleDropdown("dishes")}
              className="text-gray-700 font-medium px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Dishes Types ▼
            </button>
            {activeDropdown === "dishes" && (
              <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                {dishTypes.length > 0 ? (
                  dishTypes.map((type, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate(`/dishes/${type}`);
                        setActiveDropdown(null);
                      }}
                    >
                      {type}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No dish type available</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </header>
      <ReminderNotification userId={user?._id} />
      {/* Main Content */}
      <main className="container mx-auto py-6 px-6 flex-grow">
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