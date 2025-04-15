import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../pages/user/footer/Footer"; // Import Footer
import Header from "../Header";
import {
  HomeIcon,
  ShoppingCartIcon,
  BookOpenIcon,
  UserIcon,
  BarChartIcon,
  HelpCircleIcon,
  SettingsIcon,
  DollarSignIcon, // Added for Finance Management
} from "lucide-react";

const AdminLayout = ({ defaultActiveMenu = "Dashboard" }) => {
  const [activeMenu, setActiveMenu] = useState(defaultActiveMenu);
  const [searchTerm, setSearchTerm] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState({
    "User Management": false,
    Analytics: false,
    "Quiz Management": false,
    "User Interface": false,
    "Footer Management": false,
  });

  const navigate = useNavigate();

  const menuRoutes = {
    Dashboard: "/admin",
    "Order Management": "/admin/order",
    "Meal Plan": "/admin/mealplan",
    "User Management": "/admin/usermanagement",
    Analytics: "/admin/analytics",
    "Quiz Management": "/admin/quizmanagement",
    "Dish Preferences": "/admin/dishmanagement",
    "Footer Management": "/admin/aboutusmanagement", // Default submenu
    "About Us": "/admin/aboutusmanagement",
    "Contact Us": "/admin/contactusmanagement",
    FAQs: "/admin/faqsManagement",
    "Term of Use": "/admin/termofusemanagement",
    "User Interface": "/admin/userinterface",
    "Finance Management": "/admin/financemanagement", // Added route
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu.name);
    if (menu.submenus) {
      toggleSubmenu(menu.name);
    } else {
      navigate(menuRoutes[menu.name] || "/admin/dashboard");
    }
  };

  const handleSubmenuClick = (mainMenu, submenu) => {
    setActiveMenu(submenu);
    navigate(menuRoutes[submenu] || "/admin/dashboard");
  };

  const menuItems = [
    { icon: <HomeIcon size={20} />, name: "Dashboard" },
    {
      icon: <UserIcon size={20} />,
      name: "User Management",
    },
    { icon: <DollarSignIcon size={20} />, name: "Finance Management" },
    {
      icon: <HelpCircleIcon size={20} />,
      name: "Content Management",
      submenus: ["About Us", "Contact Us", "FAQs", "Term of Use"],
    },
  ];

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <nav>
            {menuItems.map((item) => (
              <div key={item.name}>
                <div
                  className={`flex items-center p-3 cursor-pointer rounded hover:bg-green-50 ${
                    activeMenu === item.name ? "bg-green-100 text-custom-green" : "text-gray-600"
                  }`}
                  onClick={() => handleMenuClick(item)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-grow">{item.name}</span>
                  {item.submenus && (
                    <span className="ml-auto">{openSubmenus[item.name] ? "▲" : "▼"}</span>
                  )}
                </div>
                {item.submenus && openSubmenus[item.name] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenus.map((submenu) => (
                      <div
                        key={submenu}
                        className={`p-2 cursor-pointer rounded hover:bg-green-50 ${
                          activeMenu === submenu ? "bg-green-100 text-green-600" : "text-gray-600"
                        }`}
                        onClick={() => handleSubmenuClick(item.name, submenu)}
                      >
                        {submenu}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        {/* Main Content */}
        <div className="flex-grow p-6 bg-white shadow">
          <Outlet />
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminLayout;
