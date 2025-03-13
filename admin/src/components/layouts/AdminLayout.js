import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  BookOpenIcon,
  UserIcon,
  BarChartIcon,
  HelpCircleIcon,
  SettingsIcon,
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
    Dashboard: "/admin/dashboard",
    "Order Management": "/admin/order",
    "Meal Plan": "/admin/mealplan",
    "User Management": "/admin/usermanagement",
    Analytics: "/admin/analytics",
    "Quiz Management": "/admin/quizmanagement",
    "Dish Preferences": "/admin/dishmanagement",
    "Footer Management": "/admin/aboutusmanagement", // Default submenu
    "About Us Management": "/admin/aboutusmanagement",
    "Contact Us Management": "/admin/contactusmanagement",
    "FAQs Management": "/admin/faqsManagement",
    "Term of Use Management": "/admin/termofusemanagement",
    "User Interface": "/admin/userinterface",
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
    { icon: <ShoppingCartIcon size={20} />, name: "Order Management" },
    { icon: <BookOpenIcon size={20} />, name: "Meal Plan" },
    {
      icon: <UserIcon size={20} />,
      name: "User Management",
    },
    {
      icon: <BarChartIcon size={20} />,
      name: "Analytics",
    },
    { icon: <HelpCircleIcon size={20} />, name: "Quiz Management" },
    { icon: <BookOpenIcon size={20} />, name: "Dish Preferences" },
    {
      icon: <HelpCircleIcon size={20} />,
      name: "Footer Management",
      submenus: [
        "About Us Management",
        "Contact Us Management",
        "FAQs Management",
        "Term of Use Management",
      ],
    },
    { icon: <SettingsIcon size={20} />, name: "User Interface" },
  ];

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <div className="flex items-center mb-8">
          <span className="text-2xl font-bold text-green-600">Healthy</span>
          <span className="text-sm ml-1 text-gray-500">.Admin</span>
        </div>
        <nav>
          {menuItems.map((item) => (
            <div key={item.name}>
              <div
                className={`flex items-center p-3 cursor-pointer rounded hover:bg-green-50 ${
                  activeMenu === item.name
                    ? "bg-green-100 text-green-600"
                    : "text-gray-600"
                }`}
                onClick={() => handleMenuClick(item)}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="flex-grow">{item.name}</span>
                {item.submenus && (
                  <span className="ml-auto">
                    {openSubmenus[item.name] ? "▲" : "▼"}
                  </span>
                )}
              </div>
              {item.submenus && openSubmenus[item.name] && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenus.map((submenu) => (
                    <div
                      key={submenu}
                      className={`p-2 cursor-pointer rounded hover:bg-green-50 ${
                        activeMenu === submenu
                          ? "bg-green-100 text-green-600"
                          : "text-gray-600"
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
      <div className="flex-grow flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
