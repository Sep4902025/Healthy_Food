import React, { useState, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../Header";
import {
  UtensilsIcon,
  LeafIcon,
  BookOpenIcon,
  HomeIcon,
  HeartPulseIcon,
  MessageSquareIcon,
  ChevronDownIcon,
  CalendarHeart,
} from "lucide-react";

const menuItems = [
  {
    icon: <MessageSquareIcon size={20} />,
    name: "Chat Support",
    path: "/nutritionist/chat",
  },
  {
    icon: <CalendarHeart size={20} />,
    name: "Meal Plans Management",
    submenus: [
      { name: "View Meal Plans", path: "/nutritionist/mealPlan" },
      { name: "Meal Plans Analytics", path: "/nutritionist/mealPlan/analytics" },
    ],
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
    name: "Health Conditions Management",
    submenus: [
      { name: "View Health Conditions", path: "/nutritionist/medicalConditions" },
      { name: "Add New Health Conditions", path: "/nutritionist/medicalConditions/add" },
    ],
  },
];

const NutritionistLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);

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
      scrollToTop();
    }
  };

  const handleSubmenuClick = (submenu, parentMenu) => {
    setActiveMenu(submenu.name); // Đặt activeMenu là submenu được chọn
    navigate(submenu.path);
    scrollToTop();
  };

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Hàm kiểm tra xem menu chính có nên active không
  const isMenuActive = (item) => {
    if (!item.submenus) {
      return location.pathname === item.path || activeMenu === item.name;
    }
    // Nếu menu có submenu, kiểm tra xem có submenu nào đang active không
    return item.submenus?.some((submenu) => location.pathname === submenu.path);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r p-4 flex flex-col left-0 min-h-[calc(100vh-60px)]">
          <div className="flex items-center mb-6 shrink-0">
            <HomeIcon size={24} className="text-[#40B491] mr-2" />
            <span className="text-xl font-bold text-[#40B491]">Nutritionist</span>
          </div>
          <nav className="flex-1 max-h-[calc(100vh-60px-72px)] scrollbar-hidden">
            {menuItems.map((item) => (
              <div key={item.name}>
                <div
                  className={`flex items-center p-3 cursor-pointer rounded hover:bg-[#40B491]/10 ${
                    isMenuActive(item) ? "bg-[#40B491]/20 text-[#40B491]" : "text-gray-600"
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
                        key={submenu.name}
                        className={`p-2 cursor-pointer rounded hover:bg-[#40B491]/10 ${
                          location.pathname === submenu.path
                            ? "bg-[#40B491]/20 text-[#40B491]"
                            : "text-gray-600"
                        }`}
                        onClick={() => handleSubmenuClick(submenu, item.name)}
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
        <main ref={mainRef} className="bg-white shadow min-h-[calc(100vh-60px)] flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default NutritionistLayout;
