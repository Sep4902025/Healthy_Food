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
import quizService from "../services/quizService";
import mealPlanService from "../services/mealPlanServices";
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import { RiShoppingBag4Line } from "react-icons/ri";
import { selectUser } from "../store/selectors/authSelectors";
import { logoutUser } from "../store/actions/authActions";
import { DarkModeContext } from "../pages/context/DarkModeContext";

import PreviewModal from "../pages/user/MealPlan/PreviewModal";
import HomeService from "../services/home.service";
import ReminderNotification from "./Reminder/ReminderNotifiaction";

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
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("mealPlan");
  const [cartViewed, setCartViewed] = useState(false); // New state to track if cart is viewed
  const userMenuRef = useRef(null);
  const cartMenuRef = useRef(null);

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
      // Remove query parameters after displaying toast
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

  useEffect(() => {
    console.log("user data", user);
    if (user?.userPreferenceId) {
      setHasCompletedQuiz(true);
    } else {
      setHasCompletedQuiz(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchUnpaidMealPlans = async () => {
      if (user) {
        try {
          const response = await mealPlanService.getUnpaidMealPlanForUser(
            user._id
          );
          if (response.success) {
            console.log("List of unpaid meal plans:", response.data);
            setMealPlans(response.data);
          } else {
            setMealPlans([]);
          }
        } catch (error) {
          console.error("Error fetching unpaid meal plans:", error);
          setMealPlans([]);
        }
      }
    };
    fetchUnpaidMealPlans();
  }, [user]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (user) {
        try {
          const response = await mealPlanService.getPaymentHistory(
            user._id,
            1,
            5
          );
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
      // If admin, redirect to admin profile page
      navigate(`/admin/adminprofile/${user._id}`, { state: { user } });
    } else {
      // If not admin, redirect to regular user page
      navigate("/user");
    }
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
      setCartViewed(true); // Mark cart as viewed when opened
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
    <div className="w-full bg-white shadow-sm py-2 sticky top-0 z-50 dark:bg-[#bbbbae] dark:shadow-lg dark:shadow-gray-500">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Healthy Food" className="h-12 dark:brightness-125 dark:contrast-150 dark:saturate-200" />
        </div>

        {/* Primary Navigation - Center */}
        <div className="flex items-center justify-center gap-2">
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
          {user?.role === "user" && (
            <>
              {/* If userPreferenceId exists, show "For You" instead of "Survey" */}
              {user?.userPreferenceId ? (
                <a
                  href="/foryou"
                  className={`font-medium transition-colors ${
                    isActive("/foryou") ? "text-green-600" : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  For You
                </a>
              ) : (
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
              )}

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
            />
            <FaSearch className="absolute left-3 top-2 text-gray-500 text-sm" />
          </div>

          {/* Icons & Auth */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Cart Dropdown */}
              <div className="relative" ref={cartMenuRef}>
                <div className="relative inline-block">
                  <RiShoppingBag4Line
                    className="cursor-pointer w-[16px] h-[16px]"
                    onClick={toggleCartMenu}
                  />
                  {!cartViewed && mealPlans.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-custom-green text-white text-xs font-bold rounded-full w-[15px] h-[15px] flex items-center justify-center">
                      {mealPlans.length}
                    </span>
                  )}
                </div>
                {cartMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg z-10">
                    {/* Tabs */}
                    <div className="flex border-b">
                      <button
                        className={`flex-1 py-2 text-center ${
                          activeTab === "mealPlan"
                            ? "border-b-2 border-green-500 text-green-600"
                            : "text-gray-600"
                        }`}
                        onClick={() => setActiveTab("mealPlan")}
                      >
                        Meal Plans
                      </button>
                      <button
                        className={`flex-1 py-2 text-center ${
                          activeTab === "history"
                            ? "border-b-2 border-green-500 text-green-600"
                            : "text-gray-600"
                        }`}
                        onClick={() => setActiveTab("history")}
                      >
                        Payment History
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4">
                      {activeTab === "mealPlan" ? (
                        mealPlans.length > 0 ? (
                          <div className="max-h-48 overflow-y-auto">
                            {mealPlans.map((mealPlan) => (
                              <div
                                key={mealPlan._id}
                                className="border-b py-2 last:border-b-0"
                              >
                                <p className="font-medium text-gray-700">
                                  Name: {mealPlan.title}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Start:{" "}
                                  {new Date(
                                    mealPlan.startDate
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Price:{" "}
                                  {(mealPlan.price || 1500000).toLocaleString()}{" "}
                                  VND
                                </p>
                                <div className="mt-2 flex space-x-2">
                                  <button
                                    onClick={() => handlePayMealPlan(mealPlan)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-xs font-medium"
                                  >
                                    Pay Now
                                  </button>
                                  <button
                                    onClick={() =>
                                      handlePreviewMealPlan(mealPlan)
                                    }
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-xs font-medium"
                                  >
                                    Preview
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No meal plans to pay.
                          </p>
                        )
                      ) : (
                        <div>
                          {paymentHistory.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto">
                              {paymentHistory.map((payment) => (
                                <div
                                  key={payment._id}
                                  className="border-b py-2 text-sm text-gray-600"
                                >
                                  <p>
                                    <strong>Meal Plan:</strong>{" "}
                                    {payment.mealPlanName || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Amount:</strong>{" "}
                                    {payment.amount.toLocaleString()} VND
                                  </p>
                                  <p>
                                    <strong>Status:</strong> {payment.status}
                                  </p>
                                  <p>
                                    <strong>Date:</strong>{" "}
                                    {new Date(
                                      payment.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                              <button
                                onClick={() => navigate("/payment-history")}
                                className="mt-2 w-full text-center text-blue-500 hover:underline"
                              >
                                View More
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No payment history.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                        onClick={toggleDarkMode}
                        className="w-full text-left px-4 py-2 flex items-center hover:bg-gray-100"
                      >
                        {darkMode ? <>🌙 Dark Mode</> : <>☀️ Light Mode</>}
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
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-sm font-medium"
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
    </div>
  );
};

export default Header;
