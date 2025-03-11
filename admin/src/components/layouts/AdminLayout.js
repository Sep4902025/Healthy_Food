import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BiHome, BiTask, BiBookContent, BiUser, BiBarChart, BiMessageSquareDetail, BiPencil } from "react-icons/bi";

const AdminLayout = () => {
  const [isFooterOpen, setIsFooterOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 text-2xl font-bold text-green-700">
          Admin Dashboard
        </div>
        <nav className="mt-4">
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
                    <NavLink
                      to="/admin/about"
                      className="block p-2 hover:bg-gray-200"
                    >
                      About Us Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/faqs"
                      className="block p-2 hover:bg-gray-200"
                    >
                      FAQs Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/contact"
                      className="block p-2 hover:bg-gray-200"
                    >
                      Contact Us Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/term"
                      className="block p-2 hover:bg-gray-200"
                    >
                      Term of Use Management
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