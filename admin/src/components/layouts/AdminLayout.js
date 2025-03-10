import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BiHome, BiTask, BiBookContent, BiUser, BiBarChart, BiMessageSquareDetail, BiPencil } from "react-icons/bi";

const AdminLayout = () => {
  const [isFooterOpen, setIsFooterOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-md flex flex-col"> {/* Tăng chiều rộng */}
        <div className="p-5 text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-green-600">Healthy</span>
          <span className="text-green-500">●</span>
        </div>
        <p className="text-gray-400 text-sm px-5">Admin Dashboard</p>
        <nav className="mt-4 flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink to="/admin/dashboard" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-200">
                <BiHome /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/orders" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-200">
                <BiTask /> Order Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/meal-plan" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-200">
                <BiBookContent /> Meal Plant
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/users" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-200">
                <BiUser /> User Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/analytics" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-200">
                <BiBarChart /> Analytics
              </NavLink>
            </li>
            <li>
              <button
                onClick={() => setIsFooterOpen(!isFooterOpen)}
                className="w-full flex justify-between items-center p-3 text-gray-600 hover:bg-gray-200"
              >
                <span className="flex items-center gap-3">
                  <BiPencil /> Footer Management
                </span>
                {isFooterOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {isFooterOpen && (
                <ul className="ml-6 space-y-1">
                  <li>
                    <NavLink to="/admin/about" className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-200 whitespace-nowrap">
                      <BiMessageSquareDetail /> About Us Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/faqs" className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-200 whitespace-nowrap">
                      <BiMessageSquareDetail /> FAQs Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/contact" className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-200 whitespace-nowrap">
                      <BiMessageSquareDetail /> Contact Us Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/term" className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-200 whitespace-nowrap">
                      <BiMessageSquareDetail /> Term of Use Management
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;