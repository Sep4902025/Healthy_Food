import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../Header";
import Footer from "../../pages/user/footer/Footer";
import {
  UtensilsIcon,
  LeafIcon,
  BookOpenIcon,
  HomeIcon,
  HeartPulseIcon,
  MessageSquareIcon,
  ChevronDownIcon,
  CalendarHeart
} from "lucide-react";

const menuItems = [
  {
    icon: <MessageSquareIcon size={20} />,
    name: "Chat Support",
    path: "/nutritionist/chat",
  },
  {
    icon: <CalendarHeart size={20} />,
    name: "Meal Plan",
    path: "/nutritionist/mealPlan",
  },
  {
    icon: <UtensilsIcon size={20} />,
    name: "Dish Management",
    submenus: [
      { name: "View Dishes", path: "/nutritionist/dishes" },
      { name: "Add New Dish", path: "/nutritionist/dishes/add" },
    ],
  },
  {
    icon: <LeafIcon size={20} />,
    name: "Ingredient Management",
    submenus: [
      { name: "View Ingredients", path: "/nutritionist/ingredients" },
      { name: "Add New Ingredient", path: "/nutritionist/ingredients/add" },
    ],
  },
  {
    icon: <BookOpenIcon size={20} />,
    name: "Recipe Management",
    path: "/nutritionist/recipes",
  },
  {
    icon: <HeartPulseIcon size={20} />,
    name: "Medical Condition Management",
    submenus: [
      { name: "View Medical Conditions", path: "/nutritionist/medicalConditions" },
      { name: "Add New Medical Condition", path: "/nutritionist/medicalConditions/add" },
    ],
  },
];

const NutritionistLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (item) => {
    if (item.submenus) {
      toggleSubmenu(item.name);
    } else {
      setActiveMenu(item.name);
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (submenu) => {
    setActiveMenu(submenu.name);
    navigate(submenu.path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content and Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-4 flex flex-col">
          <div className="flex items-center mb-6">
            <HomeIcon size={24} className="text-green-600 mr-2" />
            <span className="text-xl font-bold text-green-700">Nutritionist</span>
          </div>
          <nav className="flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.name}>
                <div
                  className={`flex items-center p-3 cursor-pointer rounded hover:bg-green-50 ${
                    location.pathname === item.path || openSubmenus[item.name]
                      ? "bg-green-100 text-green-600"
                      : "text-gray-600"
                  }`}
                  onClick={() => handleMenuClick(item)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-grow">{item.name}</span>
                  {item.submenus && (
                    <span className="ml-auto transition-transform duration-300 ease-in-out">
                      <ChevronDownIcon
                        size={20}
                        className={`${openSubmenus[item.name] ? "rotate-180" : "rotate-0"}`}
                      />
                    </span>
                  )}
                </div>
                {item.submenus && openSubmenus[item.name] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenus.map((submenu) => (
                      <div
                        key={submenu.name}
                        className={`p-2 cursor-pointer rounded hover:bg-green-50 ${
                          location.pathname === submenu.path
                            ? "bg-green-100 text-green-600"
                            : "text-gray-600"
                        }`}
                        onClick={() => handleSubmenuClick(submenu)}
                      >
                        {submenu.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 bg-white shadow overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NutritionistLayout;