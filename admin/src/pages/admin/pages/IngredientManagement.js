import React, { useState } from "react";
import {
  HomeIcon,
  ShoppingCartIcon,
  UserIcon,
  BarChartIcon,
  BookOpenIcon,
  HelpCircleIcon,
  SettingsIcon,
  SearchIcon,
  MessageCircleIcon,
} from "lucide-react";

const IngredientsManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(
    "17 April 2020 - 21 May 2020"
  );
  const [activeMenu, setActiveMenu] = useState("Ingredient Management");
  const [searchTerm, setSearchTerm] = useState("");

  const menuItems = [
    { icon: <HomeIcon size={20} />, name: "Dashboard" },
    { icon: <ShoppingCartIcon size={20} />, name: "Order Management" },
    { icon: <BookOpenIcon size={20} />, name: "Meal Plant" },
    {
      icon: <UserIcon size={20} />,
      name: "User Management",
      submenus: ["Manage Users", "User Roles", "Permissions"],
    },
    {
      icon: <BarChartIcon size={20} />,
      name: "Analytics",
      submenus: ["Sales Analytics", "User Analytics", "Performance"],
    },
    { icon: <HelpCircleIcon size={20} />, name: "Quiz Management" },
    { icon: <BookOpenIcon size={20} />, name: "Dish Preferences" },
    { icon: <HelpCircleIcon size={20} />, name: "FAQs Management" },
    { icon: <SettingsIcon size={20} />, name: "User Interface" },
  ];

  const ingredients = [
    {
      name: "Beff",
      type: "Meat",
      calories: "555 kcal",
      nutritious: "Protein, Fat",
      recipesUsed: 22,
      status: "Inactive",
    },
    {
      name: "Chicken Eggs",
      type: "Egg",
      calories: "220 kcal",
      nutritious: "Protein, Fat",
      recipesUsed: 22,
      status: "Active",
    },
    {
      name: "Broccoli",
      type: "Vegetable",
      calories: "220 kcal",
      nutritious: "Protein, Fiber",
      recipesUsed: 22,
      status: "Active",
    },
    {
      name: "Apple",
      type: "Fruit",
      calories: "220 kcal",
      nutritious: "Carbohydrates, Fiber",
      recipesUsed: 22,
      status: "Active",
    },
    {
      name: "Salmon",
      type: "Aquatic",
      calories: "220 kcal",
      nutritious: "Protein, Omega-3",
      recipesUsed: 22,
      status: "Active",
    },
  ];

  const getTypeColor = (type) => {
    const typeColors = {
      Meat: "bg-red-100 text-red-800",
      Egg: "bg-yellow-100 text-yellow-800",
      Vegetable: "bg-green-100 text-green-800",
      Fruit: "bg-orange-100 text-orange-800",
      Aquatic: "bg-blue-100 text-blue-800",
    };
    return typeColors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <div className="flex items-center mb-8">
          <span className="text-2xl font-bold text-green-600">Healthy</span>
          <span className="text-sm ml-1 text-gray-500">.Admin</span>
        </div>

        <nav>
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`flex items-center px-4 py-2 mb-2 rounded-lg cursor-pointer ${
                activeMenu === item.name
                  ? "bg-green-50 text-green-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveMenu(item.name)}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
              {item.submenus && <span className="ml-auto text-xs">▼</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <input
              type="text"
              placeholder="Search here..."
              className="border rounded-lg px-4 py-2 w-96"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <MessageCircleIcon className="text-gray-600" size={20} />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </div>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                5
              </span>
            </div>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex items-center ml-4">
              <span className="mr-2 text-gray-700">Hello, Samantha</span>
              <img
                src="/api/placeholder/40/40"
                alt="Profile"
                className="rounded-full w-10 h-10 border-2 border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Ingredients Management Content */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Ingredient Management
              </h1>
              <p className="text-gray-500">
                Hi, Samantha. Welcome back to Seday Admin!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="border rounded px-3 py-2 text-gray-600">
                {selectedPeriod}
              </div>
              <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition">
                Create
              </button>
            </div>
          </div>

          {/* Ingredients Table */}
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nutritious
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipes Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <img
                      src={`/api/placeholder/40/40?text=${ingredient.name.charAt(
                        0
                      )}`}
                      alt={ingredient.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <span className="font-medium">{ingredient.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                        ingredient.type
                      )}`}
                    >
                      {ingredient.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ingredient.calories}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ingredient.nutritious}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{ingredient.recipesUsed}</span>
                      <img
                        src="/api/placeholder/20/20"
                        alt="Recipes"
                        className="w-5 h-5 rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        ingredient.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ingredient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-green-500 hover:text-green-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a22 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-6 border-t">
            <div className="text-sm text-gray-600">
              Show <span className="font-semibold text-green-600">5</span> Users
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                &lt;
              </button>
              <button className="px-3 py-1 bg-green-500 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 hover:bg-gray-50 border rounded">
                2
              </button>
              <button className="px-3 py-1 hover:bg-gray-50 border rounded">
                3
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientsManagement;
