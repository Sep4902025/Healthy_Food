import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "../../pages/user/footer/Footer";
import Header from "../Header";
import {
  HomeIcon,
  ShoppingCartIcon,
  BookOpenIcon,
  UserIcon,
  BarChartIcon,
  HelpCircleIcon,
  SettingsIcon,
} from "lucide-react";

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

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active menu based on current path
  const getActiveMenu = () => {
    const path = location.pathname.split('/').pop().replace(/-/g, ' ');
    const capitalized = path.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Check if it's a main menu item
    const mainMenu = menuItems.find(item => 
      item.name.toLowerCase() === capitalized.toLowerCase()
    );
    
    if (mainMenu) return mainMenu.name;
    
    // Check if it's a submenu item
    for (const item of menuItems) {
      if (item.submenus) {
        const submenu = item.submenus.find(sub => 
          sub.toLowerCase() === capitalized.toLowerCase()
        );
        if (submenu) return submenu;
      }
    }
    
    return "Dashboard"; // Default
  };

  const [activeMenu, setActiveMenu] = useState(getActiveMenu());
  const [openSubmenus, setOpenSubmenus] = useState({
    "User Management": false,
    Analytics: false,
    "Quiz Management": false,
    "User Interface": false,
    "Footer Management": location.pathname.includes("about") || 
                         location.pathname.includes("contact") || 
                         location.pathname.includes("faq") || 
                         location.pathname.includes("term"),
  });

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu.name);
    if (menu.submenus) {
      toggleSubmenu(menu.name);
    } else {
      const route = `/admin/${menu.name.toLowerCase().replace(/\s+/g, "")}`;
      navigate(route);
    }
  };

  const handleSubmenuClick = (mainMenu, submenu) => {
    setActiveMenu(submenu);
    const route = `/admin/${submenu.toLowerCase().replace(/\s+/g, "")}`;
    navigate(route);
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      
      <div className="flex flex-grow overflow-hidden">
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
        <main className="flex-grow p-6 bg-gray-100 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLayout;