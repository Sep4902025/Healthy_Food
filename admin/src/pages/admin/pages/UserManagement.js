import React, { useState, useEffect } from "react";
import UserService from "../../../services/user.service";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon,
  BellIcon,
  MessageCircleIcon,
  GiftIcon,
  CogIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
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
      " Term of Use Management",
    ],
  },
  { icon: <SettingsIcon size={20} />, name: "User Interface" },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState("User Management");
  const [openSubmenus, setOpenSubmenus] = useState({
    "User Management": false,
    Analytics: false,
    "Quiz Management": false,
    "User Interface": false,
  });

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const navigate = useNavigate(); // Hook để điều hướng

  const handleEditUser = (user) => {
    navigate(`/admin/edituser/${user._id}`, { state: { user } });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const response = await UserService.getAllUsers();
      if (response.success) {
        setUsers(response.users);
      } else {
        setError(response.message);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = (_id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== _id));
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu.name);
    if (menu.submenus) {
      toggleSubmenu(menu.name);
    } else {
      const route = `/admin/${menu.name.toLowerCase().replace(/\s+/g, "")}`;
      navigate(route); // Chuyển trang
    }
  };

  const handleSubmenuClick = (mainMenu, submenu) => {
    setActiveMenu(submenu);
    const route = `/admin/${submenu.toLowerCase().replace(/\s+/g, "")}`;
    navigate(route);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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
      <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center">
            <PlusIcon className="mr-2" size={20} />
            Create user
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-gray-500">User Name</th>
                <th className="p-4 text-left text-gray-500">Phone</th>
                <th className="p-4 text-left text-gray-500">Email</th>
                <th className="p-4 text-left text-gray-500">Role</th>
                <th className="p-4 text-left text-gray-500">Status</th>
                <th className="p-4 text-left text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td
                    className="p-4 text-left cursor-pointer hover:underline"
                    onClick={() => handleEditUser(user)}
                    // Xử lý khi bấm vào username
                  >
                    {user.username}
                  </td>
                  <td className="p-4 text-left">{user.phone}</td>
                  <td className="p-4 text-left">{user.email}</td>
                  <td className="p-4 text-left">{user.role}</td>
                  <td className="p-4 text-left">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 flex space-x-2">
                    <button className="text-green-500 hover:bg-green-100 p-2 rounded-full">
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                className="border rounded px-2 py-1"
                onChange={(e) => setUsersPerPage(Number(e.target.value))}
              >
                <option value="5">5 Users</option>
                <option value="10">10 Users</option>
                <option value="15">15 Users</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from(
                { length: Math.ceil(users.length / usersPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-green-500 text-white"
                        : "border hover:bg-gray-100"
                    }`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                )
              )}
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(users.length / usersPerPage)
                }
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
