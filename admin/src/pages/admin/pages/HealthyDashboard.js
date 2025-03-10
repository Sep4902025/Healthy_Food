import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
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
  SettingsIcon as CogIcon
} from 'lucide-react';

// Sample data (you'll replace these with your actual data sources)
const orderData = [
  { day: 'Sunday', orders: 300 },
  { day: 'Monday', orders: 400 },
  { day: 'Tuesday', orders: 350 },
  { day: 'Wednesday', orders: 450 },
  { day: 'Thursday', orders: 380 },
  { day: 'Friday', orders: 420 },
  { day: 'Saturday', orders: 390 }
];

const revenueData = [
  { month: 'Jan', year2020: 100, year2021: 150 },
  { month: 'Feb', year2020: 120, year2021: 180 },
  // ... add more months
];

const customerData = [
  { day: 'Sun', customers: 70 },
  { day: 'Mon', customers: 50 },
  { day: 'Tue', customers: 60 },
  // ... add more days
];

const HealthyDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('17 April 2020 - 11 May 2020');
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
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

        {/* Rest of the existing dashboard content remains the same */}
        <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <div className="mr-4">
              <img 
                src="/api/placeholder/50/50" 
                alt="Total Orders" 
                className="w-12 h-12"
              />
            </div>
            <div>
              <h3 className="text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold">75 
                <span className="text-green-500 text-sm ml-2">+12.5%</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <div className="mr-4">
              <img 
                src="/api/placeholder/50/50" 
                alt="Total Canceled" 
                className="w-12 h-12"
              />
            </div>
            <div>
              <h3 className="text-gray-500">Total Canceled</h3>
              <p className="text-2xl font-bold">65 
                <span className="text-red-500 text-sm ml-2">-5% Decreased</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <div className="mr-4">
              <img 
                src="/api/placeholder/50/50" 
                alt="Total Revenue" 
                className="w-12 h-12"
              />
            </div>
            <div>
              <h3 className="text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold">$128 
                <span className="text-green-500 text-sm ml-2">+15.8%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Pie Chart</h3>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="showValue" 
                className="mr-2"
              />
              <label htmlFor="showValue">Show Value</label>
            </div>
          </div>
          <div className="flex justify-around">
            <PieChart width={200} height={200}>
              <Pie
                data={[
                  { name: 'Total Order', value: 81 },
                  { name: 'Remaining', value: 19 }
                ]}
                cx={100}
                cy={100}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell key="total" fill="#FF6384" />
                <Cell key="remaining" fill="#36A2EB" />
              </Pie>
              <Tooltip />
            </PieChart>
            <PieChart width={200} height={200}>
              <Pie
                data={[
                  { name: 'Customer Growth', value: 22 },
                  { name: 'Remaining', value: 78 }
                ]}
                cx={100}
                cy={100}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell key="growth" fill="#FFCE56" />
                <Cell key="remaining" fill="#36A2EB" />
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chart Order</h3>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Save Report
            </button>
          </div>
          <LineChart 
            width={500} 
            height={200} 
            data={orderData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#8884d8" 
              strokeWidth={2}
            />
          </LineChart>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <div>
              <button className="mr-2">2020</button>
              <button>2021</button>
            </div>
          </div>
          <LineChart 
            width={500} 
            height={250} 
            data={revenueData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="year2020" 
              stroke="#8884d8" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="year2021" 
              stroke="#FF6384" 
              strokeWidth={2}
            />
          </LineChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Customer Map</h3>
            <select 
              className="border rounded px-2 py-1"
              value="weekly"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <LineChart 
            width={500} 
            height={250} 
            data={customerData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="customers" 
              stroke="#FFCE56" 
              strokeWidth={2}
            />
          </LineChart>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center">
          <img 
            src="/api/placeholder/50/50" 
            alt="Add Menus" 
            className="w-12 h-12 mr-4"
          />
          <div>
            <h4 className="font-semibold">Please organize your menu through button below!</h4>
            <button className="mt-2 bg-white text-green-500 px-4 py-2 rounded">
              + Add Menus
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default HealthyDashboard;