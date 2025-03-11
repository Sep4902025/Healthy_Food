import React, { useState } from 'react';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  UserIcon, 
  BarChartIcon, 
  BookOpenIcon, 
  HelpCircleIcon, 
  SettingsIcon,
  SearchIcon,
  BellIcon,
  MessageCircleIcon,
  GiftIcon,
  CogIcon,
  UploadIcon
} from 'lucide-react';

const EditUser = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');

  const [activeMenu, setActiveMenu] = useState('User Management');
  const [openSubmenus, setOpenSubmenus] = useState({
    'User Management': false,
    'Analytics': false,
    'Quiz Management': false,
    'User Interface': false
  });

  const menuItems = [
    { icon: <HomeIcon size={20} />, name: 'Dashboard' },
    { icon: <ShoppingCartIcon size={20} />, name: 'Order Management' },
    { icon: <BookOpenIcon size={20} />, name: 'Meal Plant' },
    { 
      icon: <UserIcon size={20} />, 
      name: 'User Management', 
      submenus: ['Manage Users', 'User Roles', 'Permissions'] 
    },
    { 
      icon: <BarChartIcon size={20} />, 
      name: 'Analytics', 
      submenus: ['Sales Analytics', 'User Analytics', 'Performance'] 
    },
    { icon: <HelpCircleIcon size={20} />, name: 'Quiz Management' },
    { icon: <BookOpenIcon size={20} />, name: 'Dish Preferences' },
    { icon: <HelpCircleIcon size={20} />, name: 'FAQs Management' },
    { icon: <SettingsIcon size={20} />, name: 'User Interface' }
  ];

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleSave = () => {
    // Implement save logic here
    console.log('Saving user:', { userName, email, phoneNumber, gender, status, role });
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
                  activeMenu === item.name ? 'bg-green-100 text-green-600' : 'text-gray-600'
                }`}
                onClick={() => {
                  setActiveMenu(item.name);
                  if (item.submenus) {
                    toggleSubmenu(item.name);
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="flex-grow">{item.name}</span>
                {item.submenus && (
                  <span className="ml-auto">
                    {openSubmenus[item.name] ? '▲' : '▼'}
                  </span>
                )}
              </div>
              {item.submenus && openSubmenus[item.name] && (
                <div className="pl-10 mt-1">
                  {item.submenus.map((submenu) => (
                    <div 
                      key={submenu} 
                      className="p-2 text-sm text-gray-500 hover:bg-green-50 cursor-pointer"
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
        {/* Top Header with Search and Buttons */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-grow max-w-xl mr-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="text-gray-400" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search here..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <BellIcon className="text-gray-600" size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <MessageCircleIcon className="text-gray-600" size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <GiftIcon className="text-gray-600" size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <CogIcon className="text-gray-600" size={20} />
            </button>

            {/* User Profile */}
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

        {/* Add User Content */}
        <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-500">Hi, Samantha. Welcome back to Sedap Admin!</p>
          </div>

          {/* Add User Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Edit user</h2>
            
            <div className="space-y-4">
              {/* User Name */}
              <div>
                <label className="block text-gray-700 mb-2">User Name</label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-gray-700 mb-2">Email address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 mb-2">Phone number</label>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Dropdowns Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Gender Dropdown */}
                <div>
                  <label className="block text-gray-700 mb-2">Gender</label>
                  <div className="relative">
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <div className="relative">
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <div className="relative">
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="nutritionist">Nutritionist</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 mb-2">Image</label>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                  <UploadIcon className="mr-2" size={20} />
                  Import Image
                </button>
              </div>

              {/* Save Button */}
              <div className="mt-6">
                <button 
                  onClick={handleSave}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg w-full hover:bg-red-600 transition duration-300"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;