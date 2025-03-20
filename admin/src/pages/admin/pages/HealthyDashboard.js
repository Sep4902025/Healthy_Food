import React, { useState, useEffect } from "react";
import axios from "axios";
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
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const HealthyDashboard = () => {
  // State for data
  const [orderStats, setOrderStats] = useState({
    total: 75,
    growth: 12.5,
    canceled: 65,
    canceledGrowth: -5,
  });

  const [revenueStats, setRevenueStats] = useState({
    total: 128,
    growth: 15.8,
    unpaidPlans: 12,
  });

  const [summaryStats, setSummaryStats] = useState({
    totalDishes: 124,
    totalIngredients: 87,
    totalUsers: 210,
    activePlans: 63,
  });

  // Toggle states
  const [showValue, setShowValue] = useState(false);
  const [yearFilter, setYearFilter] = useState("2021");
  const [customerView, setCustomerView] = useState("weekly");

  // Sample data (you'll replace these with API calls)
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
    { month: "Mar", year2020: 130, year2021: 200 },
    { month: "Apr", year2020: 110, year2021: 190 },
    { month: "May", year2020: 140, year2021: 210 },
    { month: "Jun", year2020: 150, year2021: 220 },
  ];

  const customerData = [
    { day: "Sun", customers: 70 },
    { day: "Mon", customers: 50 },
    { day: "Tue", customers: 60 },
    { day: "Wed", customers: 75 },
    { day: "Thu", customers: 65 },
    { day: "Fri", customers: 80 },
    { day: "Sat", customers: 85 },
  ];

  const planTypeData = [
    { name: "Fixed Plans", value: 65 },
    { name: "Custom Plans", value: 35 },
  ];


  const mealDistributionData = [
    { name: "Breakfast", count: 145 },
    { name: "Lunch", count: 187 },
    { name: "Dinner", count: 162 },
  ];

  // Colors for charts
  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  // Mock fetch data (you'd replace this with real API calls)
  useEffect(() => {
    // Simulate API call
    // In real implementation, fetch data from your backend
    const fetchDashboardData = async () => {
      try {
        // const response = await fetch('/api/admin/dashboard-stats');
        // const data = await response.json();
        // setOrderStats(data.orderStats);
        // ...
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentStats, setPaymentStats] = useState([]);
  const [revenueByYear, setRevenueByYear] = useState({});
  const [paymentStatusDatas, setPaymentStatusDatas] = useState([]);
  const [revenueByMonth, setRevenueByMonth] = useState({});
  const [yearFilters, setYearFilters] = useState("2025");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/payments/")
      .then((response) => {
        setTotalRevenue(response.data.totalRevenue);
        setPaymentStats(response.data.paymentStats);
        setRevenueByYear(response.data.revenueByYear);
        setPaymentStatusDatas([
          { name: "Paid", value: response.data.paymentStats.paid },
          { name: "Unpaid", value: response.data.paymentStats.unpaid },
        ]);
        setRevenueByMonth(response.data.revenueByMonth);
      })
      .catch((error) => console.error("Lỗi tải dữ liệu Payment:", error));
  }, []);

  const revenueDatas =
    revenueByMonth[yearFilters] &&
    Object.keys(revenueByMonth[yearFilters]).map((month) => ({
      month: `Th${month}`,
      revenue: revenueByMonth[yearFilters][month],
    }));

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6 ml-6 mt-6">
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
                  {orderStats.total}
                  <span
                    className={`text-${
                      orderStats.growth > 0 ? "green" : "red"
                    }-500 text-sm ml-2`}
                  >
                    {orderStats.growth > 0 ? "+" : ""}
                    {orderStats.growth}%
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
                  alt="Total Canceled"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h3 className="text-gray-500">Total Canceled</h3>
                <p className="text-2xl font-bold">
                  {orderStats.canceled}
                  <span
                    className={`text-${
                      orderStats.canceledGrowth > 0 ? "green" : "red"
                    }-500 text-sm ml-2`}
                  >
                    {orderStats.canceledGrowth}%{" "}
                    {orderStats.canceledGrowth > 0 ? "Increased" : "Decreased"}
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
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-500">
                  {totalRevenue.toLocaleString()} VND
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center">
              <div className="mr-4">
                <img
                  src="/api/placeholder/50/50"
                  alt="Unpaid Meal Plans"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h3 className="text-gray-500">Unpaid Meal Plans</h3>
                <p className="text-2xl font-bold">{revenueStats.unpaidPlans}</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6 ml-6">
          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <div className="text-xl font-bold text-blue-600">
              {summaryStats.totalDishes}
            </div>
            <div className="text-gray-500">Total Dishes</div>
          </div>

          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <div className="text-xl font-bold text-green-600">
              {summaryStats.totalIngredients}
            </div>
            <div className="text-gray-500">Total Ingredients</div>
          </div>

          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <div className="text-xl font-bold text-purple-600">
              {summaryStats.totalUsers}
            </div>
            <div className="text-gray-500">Total Users</div>
          </div>

          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <div className="text-xl font-bold text-orange-500">
              {summaryStats.activePlans}
            </div>
            <div className="text-gray-500">Active Meal Plans</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-4 ml-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment & Plan Status</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showValue"
                  className="mr-2"
                  checked={showValue}
                  onChange={() => setShowValue(!showValue)}
                />
                <label htmlFor="showValue">Show Value</label>
              </div>
            </div>
            <div className="flex justify-around">
              <div>
                <h4 className="text-center text-gray-600 mb-2">
                  Payment Status
                </h4>
                <PieChart width={200} height={200}>
                  <Pie
                    data={paymentStatusDatas}
                    cx={100}
                    cy={100}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={showValue}
                  >
                    {paymentStatusDatas.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
              <div>
                <h4 className="text-center text-gray-600 mb-2">Plan Types</h4>
                <PieChart width={200} height={200}>
                  <Pie
                    data={planTypeData}
                    cx={100}
                    cy={100}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={showValue}
                  >
                    {planTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[(index + 2) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Trends</h3>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Save Report
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={orderData}>
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
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-4 mt-4 ml-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Total Revenue</h3>
              <div>
                <button
                  className={`mr-2 px-3 py-1 rounded ${
                    yearFilters === "2025"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setYearFilters("2025")}
                >
                  2025
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    yearFilters === "2026"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setYearFilters("2026")}
                >
                  2026
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueDatas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Meal Distribution</h3>
              <select
                className="border rounded px-2 py-1"
                value={customerView}
                onChange={(e) => setCustomerView(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mealDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4BC0C0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthyDashboard;
