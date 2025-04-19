import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import logo from "../assets/images/Logo.png";
import mealPlanService from "../services/mealPlanServices";
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import { selectUser } from "../store/selectors/authSelectors";
import { logoutUser } from "../store/actions/authActions";
import { DarkModeContext } from "../pages/context/DarkModeContext";

import PreviewModal from "../pages/user/MealPlan/PreviewModal";
import HomeService from "../services/home.service";
import ReminderNotification from "./Reminder/ReminderNotifiaction";

import { useSearch } from "../pages/context/SearchContext";
import Cart from "../pages/user/MealPlan/Cart";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartMenuOpen, setCartMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dishTypes, setDishTypes] = useState([]);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [mealPlans, setMealPlans] = useState([]);
  console.log("MLU", mealPlans);

  const [isLoadingMealPlans, setIsLoadingMealPlans] = useState(false); // New loading state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("mealPlan");
  const [cartViewed, setCartViewed] = useState(false);
  const userMenuRef = useRef(null);
  const cartMenuRef = useRef(null);
  const { setSearchTerm } = useSearch();
  const [inputValue, setInputValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debug user changes
  useEffect(() => {
    console.log("User changed:", user);
  }, [user]);

  // Debug mealPlans state changes
  useEffect(() => {
    console.log("mealPlans state updated:", mealPlans);
  }, [mealPlans]);

  // Debug activeTab changes
  useEffect(() => {
    console.log("activeTab changed:", activeTab);
  }, [activeTab]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Check query parameters to display toast
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const paymentStatus = query.get("paymentStatus");
    const message = query.get("message");

    if (paymentStatus && message) {
      if (paymentStatus === "success") {
        toast.success(message);
      } else {
        toast.error(message);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const isActive = useCallback(
    (path) => {
      if (path === "/" && location.pathname === "/") return true;
      if (path !== "/" && location.pathname.startsWith(path)) return true;
      return false;
    },
    [location.pathname]
  );

  // Check user preference
  useEffect(() => {
    console.log("user data", user);
    if (user?.userPreferenceId) {
      setHasCompletedQuiz(true);
    } else {
      setHasCompletedQuiz(false);
    }
  }, [user]);

  // Fetch unpaid meal plans
  useEffect(() => {
    const fetchUnpaidMealPlans = async () => {
      if (user) {
        setIsLoadingMealPlans(true); // Set loading state
        try {
          const response = await mealPlanService.getUnpaidMealPlanForUser(user._id);
          console.log("API Response for unpaid meal plans:", response);
          if (response.success) {
            console.log("List of unpaid meal plans:", response.data);
            setMealPlans(response.data);
          } else {
            console.log("No meal plans found:", response.message);
            setMealPlans([]);
          }
        } catch (error) {
          console.error("Error fetching unpaid meal plans:", error);
          setMealPlans([]);
        } finally {
          setIsLoadingMealPlans(false); // Clear loading state
        }
      }
    };
    fetchUnpaidMealPlans();
  }, [user]);

  // Fetch payment history
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (user) {
        try {
          const response = await mealPlanService.getPaymentHistory(user._id, 1, 5);
          console.log("Payment history response:", response);
          if (response.success) {
            setPaymentHistory(response.data);
          } else {
            setPaymentHistory([]);
          }
        } catch (error) {
          console.error("Error fetching payment history:", error);
          setPaymentHistory([]);
        }
      }
    };
    fetchPaymentHistory();
  }, [user]);

  // Handle clicking "Profile"
  const handleProfileClick = () => {
    if (user?.role === "admin") {
      navigate(`/admin/adminprofile/${user._id}`, { state: { user } });
    } else {
      navigate("/user");
    }
  };

  // Fetch categories
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

  // Fetch dish types
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

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (cartMenuRef.current && !cartMenuRef.current.contains(event.target)) {
        setCartMenuOpen(false);
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

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleCartMenu = (e) => {
    e.stopPropagation();
    setCartMenuOpen(!cartMenuOpen);
    if (!cartViewed && mealPlans.length > 0) {
      setCartViewed(true);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setHasCompletedQuiz(false);
    navigate("/signin");
    toast.success("Signed out successfully!");
  };

  const handlePayMealPlan = async (mealPlan) => {
    try {
      const response = await mealPlanService.createMealPlanPayment(
        user._id,
        mealPlan._id,
        mealPlan.price || 1500000
      );

      if (response.success && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        toast.error(response.message || "Unable to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Error initiating payment");
    }
  };

  const handlePreviewMealPlan = async (mealPlan) => {
    try {
      const response = await mealPlanService.getMealPlanDetails(mealPlan._id);
      if (response.success) {
        setPreviewData(response.data);
        setPreviewModalOpen(true);
      } else {
        toast.error(response.message || "Unable to load preview information");
      }
    } catch (error) {
      console.error("Error fetching meal plan details:", error);
      toast.error("Error loading preview information");
    }
  };

  return (
    <div className="w-full bg-white shadow-sm py-2 sticky top-0 z-50">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="Healthy Food" className="h-12" />
        </div>

        {/* Primary Navigation - Center */}
        <div className="flex items-center justify-center gap-2">
          <a
            href="/"
            className={`font-medium transition-colors ${
              isActive("/") && location.pathname === "/"
                ? "text-custom-green"
                : "text-gray-700 hover:text-[#359c7a]"
            }`}
          >
            Home
          </a>
          {(user?.role === "admin" || user?.role === "nutritionist") && (
            <a
              href={user?.role === "admin" ? "/admin" : "/nutritionist"}
              className={`font-medium transition-colors ${
                isActive(user?.role === "admin" ? "/admin" : "/nutritionist")
                  ? "text-custom-green"
                  : "text-gray-700 hover:text-[#359c7a]"
              }`}
            >
              Management
            </a>
          )}
          {user?.role === "user" && (
            <>
              {user?.userPreferenceId ? (
                <a
                  href="/foryou"
                  className={`font-medium transition-colors ${
                    isActive("/foryou") ? "text-custom-green" : "text-gray-700 hover:text-[#359c7a]"
                  }`}
                >
                  For You
                </a>
              ) : (
                <a
                  href="/survey/name"
                  className={`font-medium transition-colors ${
                    isActive("/survey/name")
                      ? "text-custom-green"
                      : "text-gray-700 hover:text-[#359c7a]"
                  }`}
                >
                  Survey
                </a>
              )}

              <a
                href="/mealplan"
                className={`font-medium transition-colors ${
                  isActive("/mealplan") ? "text-custom-green" : "text-gray-700 hover:text-[#359c7a]"
                }`}
              >
                Meal Plan
              </a>
            </>
          )}
        </div>

        {/* Right Side - Search, Icons, User */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-1 border rounded-full w-32 md:w-48 focus:outline-none focus:ring-1 focus:ring-green-400 text-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-2 text-gray-500 text-sm" />
          </div>

          {/* Icons & Auth */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Cart Component */}
              <Cart
                cartMenuOpen={cartMenuOpen}
                toggleCartMenu={toggleCartMenu}
                cartMenuRef={cartMenuRef}
                cartViewed={cartViewed}
                mealPlans={mealPlans.data}
                isLoadingMealPlans={isLoadingMealPlans}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                paymentHistory={paymentHistory}
                handlePayMealPlan={handlePayMealPlan}
                handlePreviewMealPlan={handlePreviewMealPlan}
              />

              {/* ReminderNotification */}
              <ReminderNotification userId={user?._id} />

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <img
                  src={
                    user.avatarUrl ||
                    "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
                  }
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
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" /> Signout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/signin")}
              className="bg-custom-green hover:bg-[#359c7a] text-white px-4 py-1 rounded-md text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        previewData={previewData}
      />

      {/* Secondary Navigation - Categories */}
      <div className="border-t mt-2 pt-2">
        <div className="flex px-4 space-x-6">
          <div className="relative dropdown-container">
            <button
              onClick={() => toggleDropdown("dishes")}
              className={`font-medium transition-colors ${
                isActive("/dishes") ? "text-custom-green" : "text-gray-700 hover:text-[#359c7a]"
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
                  <li className="px-4 py-2 text-gray-500">No dish types available</li>
                )}
              </ul>
            )}
          </div>

          <div className="relative dropdown-container">
            <button
              onClick={() => toggleDropdown("ingredients")}
              className={`font-medium transition-colors ${
                isActive("/ingredients")
                  ? "text-custom-green"
                  : "text-gray-700 hover:text-[#359c7a]"
              }`}
            >
              Ingredients {activeDropdown === "ingredients" ? "▲" : "▼"}
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

          <a
            href="/medical"
            className={`font-medium transition-colors ${
              isActive("/medical") ? "text-custom-green" : "text-gray-700 hover:text-[#359c7a]"
            }`}
          >
            Medical
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
