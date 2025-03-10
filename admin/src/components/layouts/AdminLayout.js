import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Icon mở rộng & thu gọn

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
            {/* Footer Management với Dropdown */}
            <li className="mt-2">
              <button
                onClick={() => setIsFooterOpen(!isFooterOpen)}
                className="w-full flex justify-between items-center p-3 text-gray-600 font-semibold hover:bg-gray-200"
              >
                Footer Management
                {isFooterOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {isFooterOpen && (
                <ul className="ml-4 space-y-1 transition-all">
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
