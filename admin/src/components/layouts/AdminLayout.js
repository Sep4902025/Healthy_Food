import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../pages/user/footer/Footer"; // Import Footer
import { SearchIcon, BellIcon, MessageCircleIcon, GiftIcon, SettingsIcon } from "lucide-react";
import { HomeIcon, ShoppingCartIcon, UserIcon, BarChartIcon, BookOpenIcon, HelpCircleIcon } from "lucide-react";

const AdminLayout = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

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

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const menuItems = [
    { icon: <HomeIcon size={20} />, name: "Dashboard" },
    { icon: <ShoppingCartIcon size={20} />, name: "Order Management" },
    { icon: <BookOpenIcon size={20} />, name: "Meal Plan" },
    { icon: <UserIcon size={20} />, name: "User Management" },
    {
      icon: <BarChartIcon size={20} />,
      name: "Analytics",
      submenus: ["Sales Analytics", "User Analytics", "Performance"],
    },
    { icon: <HelpCircleIcon size={20} />, name: "Quiz Management" },
    { icon: <BookOpenIcon size={20} />, name: "Dish Preferences" },
    {
      icon: <HelpCircleIcon size={20} />,
      name: "Footer Management",
      submenus: ["About Us", "FAQs", "Contact Us", "Terms of Use"],
    },
    { icon: <SettingsIcon size={20} />, name: "User Interface" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold text-green-600">Admin Panel</h1>

        {/* Search Bar */}
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <SearchIcon className="absolute right-3 top-3 text-gray-500" size={20} />
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <BellIcon className="text-gray-600" size={24} />
          <MessageCircleIcon className="text-gray-600" size={24} />
          <GiftIcon className="text-gray-600" size={24} />
          <SettingsIcon className="text-gray-600" size={24} />
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-4 overflow-y-auto">
          <nav>
            {menuItems.map((item) => (
              <div key={item.name}>
                <div
                  className={`flex items-center p-3 cursor-pointer rounded hover:bg-green-50 ${
                    activeMenu === item.name ? "bg-green-100 text-green-600" : "text-gray-600"
                  }`}
                  onClick={() => handleMenuClick(item)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-grow">{item.name}</span>
                  {item.submenus && (
                    <span className="ml-auto">{openSubmenus[item.name] ? "▲" : "▼"}</span>
                  )}
                </div>

                {/* Submenus */}
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
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 bg-gray-50 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminLayout;
