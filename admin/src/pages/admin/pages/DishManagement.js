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
  EditIcon,
  TrashIcon,
  PlusIcon
} from 'lucide-react';

// Sample dish data
const initialDishes = [
  { 
    id: 1, 
    name: 'Beff Pho', 
    type: 'Heavy Meals', 
    calories: '555 kcal', 
    season: 'All Season', 
    vote: 220,
    status: 'Inactive',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 2, 
    name: 'Spring Rolls', 
    type: 'Heavy Meals', 
    calories: '220 kcal', 
    season: 'Spring', 
    vote: 220,
    status: 'Active',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 3, 
    name: 'Simple Salad', 
    type: 'Light Meals', 
    calories: '220 kcal', 
    season: 'All Season', 
    vote: 220,
    status: 'Active',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 4, 
    name: 'Panna Cotta', 
    type: 'Desserts', 
    calories: '220 kcal', 
    season: 'Autumn', 
    vote: 220,
    status: 'Active',
    image: '/api/placeholder/40/40'
  },
  { 
    id: 5, 
    name: 'Chicken Mein', 
    type: 'Beverages', 
    calories: '220 kcal', 
    season: 'Summer', 
    vote: 220,
    status: 'Active',
    image: '/api/placeholder/40/40'
  }
];

const DishManagement = () => {
  const [dishes, setDishes] = useState(initialDishes);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState('Dish Management');
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

  const handleDeleteDish = (id) => {
    setDishes(dishes.filter(dish => dish.id !== id));
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Dish Management Content */}
        <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Dish Management</h1>
              <p className="text-gray-500">Hi, Samantha. Welcome back to Sedap Admin!</p>
            </div>
            <div>
              <button className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center">
                <PlusIcon className="mr-2" size={20} />
                Create Dish
              </button>
            </div>
          </div>

          {/* Dish Table */}
          <div className="bg-white rounded-lg shadow-md">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-gray-500">Dishes Name</th>
                  <th className="p-4 text-left text-gray-500">Type</th>
                  <th className="p-4 text-left text-gray-500">Calories</th>
                  <th className="p-4 text-left text-gray-500">Seasson</th>
                  <th className="p-4 text-left text-gray-500">Vote</th>
                  <th className="p-4 text-left text-gray-500">Status</th>
                  <th className="p-4 text-left text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => (
                  <tr key={dish.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center">
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        className="w-10 h-10 rounded-full mr-3" 
                      />
                      {dish.name}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        dish.type === 'Heavy Meals' ? 'bg-red-100 text-red-600' :
                        dish.type === 'Light Meals' ? 'bg-green-100 text-green-600' :
                        dish.type === 'Desserts' ? 'bg-pink-100 text-pink-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {dish.type}
                      </span>
                    </td>
                    <td className="p-4">{dish.calories}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        {dish.season}
                      </span>
                    </td>
                    <td className="p-4 flex items-center">
                      <span className="mr-1">⭐</span>
                      {dish.vote}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        dish.status === 'Active' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                      }`}>
                        {dish.status}
                      </span>
                    </td>
                    <td className="p-4 flex space-x-2">
                      <button className="text-green-500 hover:bg-green-100 p-2 rounded-full">
                        <EditIcon size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDish(dish.id)}
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
                <select className="border rounded px-2 py-1">
                  <option>5 Users</option>
                  <option>10 Users</option>
                  <option>20 Users</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="border rounded px-3 py-1 hover:bg-gray-100">&lt;</button>
                <button className="bg-green-500 text-white px-3 py-1 rounded">1</button>
                <button className="border rounded px-3 py-1 hover:bg-gray-100">2</button>
                <button className="border rounded px-3 py-1 hover:bg-gray-100">3</button>
                <button className="border rounded px-3 py-1 hover:bg-gray-100">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishManagement;