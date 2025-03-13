import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  HomeIcon,
  ShoppingCartIcon,
  UserIcon,
  BarChartIcon,
  BookOpenIcon,
  HelpCircleIcon,
  SettingsIcon,
  SettingsIcon as CogIcon,
} from "lucide-react";

import { useNavigate, useNavigationType } from "react-router-dom";

// Sample data (you'll replace these with your actual data sources)
const orderData = [
  { day: "Sunday", orders: 300 },
  { day: "Monday", orders: 400 },
  { day: "Tuesday", orders: 350 },
  { day: "Wednesday", orders: 450 },
  { day: "Thursday", orders: 380 },
  { day: "Friday", orders: 420 },
  { day: "Saturday", orders: 390 },
];

const revenueData = [
  { month: "Jan", year2020: 100, year2021: 150 },
  { month: "Feb", year2020: 120, year2021: 180 },
  // ... add more months
];

const customerData = [
  { day: "Sun", customers: 70 },
  { day: "Mon", customers: 50 },
  { day: "Tue", customers: 60 },
  // ... add more days
];

const HealthyDashboard = () => {
  

  return (
    <div className="flex h-screen">

      {/* Main Content */}
      <div className="flex-grow flex flex-col">      

        {/* Rest of the existing dashboard content remains the same */}
        <div className="grid grid-cols-3 gap-4 mb-6 ml-6">
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
                <p className="text-2xl font-bold">
                  75
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
                <p className="text-2xl font-bold">
                  65
                  <span className="text-red-500 text-sm ml-2">
                    -5% Decreased
                  </span>
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
                <p className="text-2xl font-bold">
                  $128
                  <span className="text-green-500 text-sm ml-2">+15.8%</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 ml-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pie Chart</h3>
              <div className="flex items-center">
                <input type="checkbox" id="showValue" className="mr-2" />
                <label htmlFor="showValue">Show Value</label>
              </div>
            </div>
            <div className="flex justify-around">
              <PieChart width={200} height={200}>
                <Pie
                  data={[
                    { name: "Total Order", value: 81 },
                    { name: "Remaining", value: 19 },
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
                    { name: "Customer Growth", value: 22 },
                    { name: "Remaining", value: 78 },
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
            <LineChart width={500} height={200} data={orderData}>
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

        <div className="grid grid-cols-2 gap-4 mt-4 ml-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Total Revenue</h3>
              <div>
                <button className="mr-2">2020</button>
                <button>2021</button>
              </div>
            </div>
            <LineChart width={500} height={250} data={revenueData}>
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
              <select className="border rounded px-2 py-1" value="weekly">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <LineChart width={500} height={250} data={customerData}>
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
      </div>
    </div>
  );
};

export default HealthyDashboard;
