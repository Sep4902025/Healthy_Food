import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import logo from "../assets/images/Logo.png";
import HomeService from "../services/home.service";
import quizService from "../services/quizService";
import {
  FaSearch,
  FaBell,
  FaShoppingBag,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { selectUser } from "../store/selectors/authSelectors";
import { logoutUser } from "../store/actions/authActions";
import { DarkModeContext } from "../pages/context/DarkModeContext";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dishTypes, setDishTypes] = useState([]);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Function to check if a path is active
  const isActive = useCallback(
    (path) => {
      if (path === "/" && location.pathname === "/") return true;
      if (path !== "/" && location.pathname.startsWith(path)) return true;
      return false;
    },
    [location.pathname]
  );

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
    const fetchDishTypes = async () => {
      try {
        const response = await HomeService.getDishesGroupedByType();
        if (response.status === "success") {
          setDishTypes(response.data.map((group) => group._id));
        }
      } catch (error) {
        console.error("Error fetching dish types:", error);
      }
    };
    fetchDishTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle dropdown menu close
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }

      // Handle user menu close
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <div className="bg-white shadow-sm py-2 sticky top-0 z-50">
      <div className="container mx-auto">
        {/* Main Header */}
        <div className="flex items-center justify-between px-4">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Healthy Food" className="h-12" />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-700 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* Primary Navigation - Center (hidden on mobile) */}
          <div className="hidden lg:flex items-center space-x-6">
            <a
              href="/"
              className={`font-medium transition-colors ${
                isActive("/") && location.pathname === "/"
                  ? "text-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Home
            </a>
            {(user?.role === "admin" || user?.role === "nutritionist") && (
              <a
                href={user?.role === "admin" ? "/admin" : "/nutritionist"}
                className={`font-medium transition-colors ${
                  isActive(user?.role === "admin" ? "/admin" : "/nutritionist")
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                Management
              </a>
            )}

            <a
              href="/survey/name"
              className={`font-medium transition-colors ${
                isActive("/survey/name")
                  ? "text-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Survey
            </a>
            <a
              href="/mealplan"
              className={`font-medium transition-colors ${
                isActive("/mealplan")
                  ? "text-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Meal Plan
            </a>
          </div>

          {/* Right Side - Search, Icons, User (some elements hidden on mobile) */}
          <div className="flex items-center space-x-4">
            {/* Search Bar (hidden on small mobile) */}
            <div className="hidden sm:relative sm:block">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-1 border rounded-full w-32 md:w-48 focus:outline-none focus:ring-1 focus:ring-green-400 text-sm"
              />
              <FaSearch className="absolute left-3 top-2 text-gray-500 text-sm" />
            </div>

            {/* Icons & Auth */}
            {user ? (
              <div className="flex items-center space-x-4">
                <FaShoppingBag
                  className="text-transparent stroke-black hover:stroke-green-600 cursor-pointer hidden sm:block"
                  strokeWidth={20}
                />
                <FaBell
                  className="text-transparent stroke-black hover:stroke-green-600 cursor-pointer hidden sm:block"
                  strokeWidth={20}
                />

                <div className="relative" ref={userMenuRef}>
                  <img
                    src={user.avatarUrl || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full cursor-pointer"
                    onClick={toggleUserMenu}
                  />
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                      <div className="p-2 border-b">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => navigate("/user")}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Thông tin cá nhân
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Secondary Navigation - Categories (hidden on mobile) */}
        <div className="border-t mt-2 pt-2 hidden lg:block">
          <div className="flex px-4 space-x-6">
            <div className="relative dropdown-container">
              <button
                onClick={() => toggleDropdown("dishes")}
                className={`font-medium transition-colors ${
                  isActive("/dishes")
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                Dishes {activeDropdown === "dishes" ? "▲" : "▼"}
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
                    <li className="px-4 py-2 text-gray-500">
                      No dish types available
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="relative dropdown-container">
              <button
                onClick={() => toggleDropdown("ingredients")}
                className={`font-medium transition-colors ${
                  isActive("/ingredients")
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                Ingredient {activeDropdown === "ingredients" ? "▲" : "▼"}
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
                    <li className="px-4 py-2 text-gray-500">
                      No categories available
                    </li>
                  )}
                </ul>
              )}
            </div>

            <a
              href="/medical"
              className={`font-medium transition-colors ${
                isActive("/medical")
                  ? "text-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Medical
            </a>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t mt-2 absolute left-0 right-0 shadow-md">
            <div className="flex flex-col p-4 space-y-4">
              {user?.role === "admin" && (
                <a
                  href="/admin"
                  className={`font-medium py-2 ${
                    isActive("/admin") ? "text-green-600" : "text-gray-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Management
                </a>
              )}
              <a
                href="/"
                className={`font-medium py-2 ${
                  isActive("/") && location.pathname === "/"
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="/survey"
                className={`font-medium py-2 ${
                  isActive("/survey") ? "text-green-600" : "text-gray-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Survey
              </a>
              <a
                href="/meal-plan"
                className={`font-medium py-2 ${
                  isActive("/meal-plan") ? "text-green-600" : "text-gray-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Meal Plan
              </a>

              <div className="pt-2 border-t">
                <div
                  className={`font-medium py-2 flex justify-between items-center ${
                    isActive("/dishes") ? "text-green-600" : "text-gray-700"
                  }`}
                  onClick={() => toggleDropdown("mobile-dishes")}
                >
                  <span>Dishes</span>
                  <span>{activeDropdown === "mobile-dishes" ? "▲" : "▼"}</span>
                </div>
                {activeDropdown === "mobile-dishes" && (
                  <ul className="pl-4 mt-1 border-l-2 border-gray-200">
                    {dishTypes.length > 0 ? (
                      dishTypes.map((type, index) => (
                        <li
                          key={index}
                          className="py-2 cursor-pointer"
                          onClick={() => {
                            navigate(`/dishes/${type}`);
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {type}
                        </li>
                      ))
                    ) : (
                      <li className="py-2 text-gray-500">
                        No dish types available
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div>
                <div
                  className={`font-medium py-2 flex justify-between items-center ${
                    isActive("/ingredients")
                      ? "text-green-600"
                      : "text-gray-700"
                  }`}
                  onClick={() => toggleDropdown("mobile-ingredients")}
                >
                  <span>Ingredient</span>
                  <span>
                    {activeDropdown === "mobile-ingredients" ? "▲" : "▼"}
                  </span>
                </div>
                {activeDropdown === "mobile-ingredients" && (
                  <ul className="pl-4 mt-1 border-l-2 border-gray-200">
                    {categories.length > 0 ? (
                      categories.map((category, index) => (
                        <li
                          key={index}
                          className="py-2 cursor-pointer"
                          onClick={() => {
                            navigate(`/ingredients/${category}`);
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {category}
                        </li>
                      ))
                    ) : (
                      <li className="py-2 text-gray-500">
                        No categories available
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <a
                href="/medical"
                className={`font-medium py-2 ${
                  isActive("/medical") ? "text-green-600" : "text-gray-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Medical
              </a>

              {/* Mobile search */}
              <div className="relative py-2">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400"
                />
                <FaSearch className="absolute left-3 top-4 text-gray-500" />
              </div>

              {/* User profile and logout on mobile when logged in */}
              {user && (
                <div className="border-t pt-2">
                  <a
                    href="/user"
                    className="flex items-center py-2 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <img
                      src={user.avatarUrl || "https://via.placeholder.com/40"}
                      alt="Profile"
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    Thông tin cá nhân
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-red-600 py-2 w-full"
                  >
                    <FaSignOutAlt className="mr-2" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
