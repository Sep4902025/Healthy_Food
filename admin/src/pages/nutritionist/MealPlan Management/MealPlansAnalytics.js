import React, { useState, useEffect } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const MealPlansAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalFixed: 0,
    totalCustom: 0,
    paidMealPlans: 0,
    unpaidMealPlans: 0,
    monthlyRevenue: {},
    totalMealPlans: 0,
    expiredMealPlans: 0,
    pausedMealPlans: 0,
    activeMealPlans: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showValue, setShowValue] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all meal plans with pagination
      let allMealPlans = [];
      let page = 1;
      const limit = 100; // Set a high limit to fetch more data per request
      let hasMore = true;

      while (hasMore) {
        const mealPlansResponse = await mealPlanService.getAllMealPlanNutritionistCreatedBy(
          page,
          limit
        );
        if (!mealPlansResponse.success) {
          throw new Error(`Unable to fetch Meal Plans list: ${mealPlansResponse.message}`);
        }

        const mealPlans = mealPlansResponse.data.mealPlans || [];
        allMealPlans = [...allMealPlans, ...mealPlans];

        // Check if there are more pages
        const totalItems = mealPlansResponse.total || mealPlans.length;
        const totalPages = mealPlansResponse.totalPages || Math.ceil(totalItems / limit);
        hasMore = page < totalPages;
        page += 1;
      }

      // Fetch payment history
      let allPayments = [];
      try {
        const paymentResponse = await mealPlanService.getPaymentHistoryForNutritionist();
        if (paymentResponse.success) {
          allPayments = paymentResponse.data || [];
        } else {
          throw new Error(`Unable to fetch payment history: ${paymentResponse.message}`);
        }
      } catch (paymentError) {
        throw new Error(`Error calling payment history API: ${paymentError.message}`);
      }

      // Process payment data for monthly revenue
      const monthlyRevenueMap = {};
      allPayments.forEach((payment, index) => {
        if (payment.status === "success" && payment.paymentDate && payment.amount) {
          const paymentDate = new Date(payment.paymentDate);
          if (isNaN(paymentDate.getTime())) {
            throw new Error(`Invalid payment date at payment ${index}: ${payment.paymentDate}`);
          }
          const year = paymentDate.getFullYear().toString();
          const month = paymentDate.getMonth() + 1; // Month from 1-12
          if (!monthlyRevenueMap[year]) monthlyRevenueMap[year] = {};
          if (!monthlyRevenueMap[year][month]) monthlyRevenueMap[year][month] = 0;
          monthlyRevenueMap[year][month] += Number(payment.amount);
        }
      });

      const monthlyRevenue = {};
      Object.keys(monthlyRevenueMap).forEach((year) => {
        monthlyRevenue[year] = Array(12)
          .fill(null)
          .map((_, index) => ({
            month: `M${String(index + 1).padStart(2, "0")}`,
            revenue: monthlyRevenueMap[year][index + 1] || 0,
          }));
      });

      const currentYear = new Date().getFullYear().toString();
      if (!monthlyRevenue[currentYear]) {
        monthlyRevenue[currentYear] = Array(12)
          .fill(null)
          .map((_, index) => ({
            month: `M${String(index + 1).padStart(2, "0")}`,
            revenue: 0,
          }));
      }

      // Calculate analytics data
      const currentDate = new Date();
      setAnalyticsData({
        totalFixed: allMealPlans.filter((plan) => plan.type === "fixed").length,
        totalCustom: allMealPlans.filter((plan) => plan.type === "custom").length,
        paidMealPlans: allMealPlans.filter((plan) => plan.paymentId !== null).length,
        unpaidMealPlans: allMealPlans.filter((plan) => plan.paymentId === null).length,
        monthlyRevenue,
        totalMealPlans: allMealPlans.length,
        expiredMealPlans: allMealPlans.filter((plan) => {
          const startDate = new Date(plan.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + plan.duration);
          return endDate < currentDate;
        }).length,
        pausedMealPlans: allMealPlans.filter((plan) => plan.isPause === true).length,
        activeMealPlans: allMealPlans.filter((plan) => {
          const startDate = new Date(plan.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + plan.duration);
          return endDate >= currentDate && !plan.isPause && !plan.isBlock;
        }).length,
      });
    } catch (err) {
      setError(`Unable to load analytics data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const intervalId = setInterval(() => {
      fetchAnalyticsData();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Data for Pie charts
  const typeChartData = [
    { name: "Fixed Plans", value: analyticsData.totalFixed },
    { name: "Custom Plans", value: analyticsData.totalCustom },
  ];

  const paymentStatusChartData = [
    { name: "Paid", value: analyticsData.paidMealPlans },
    { name: "Unpaid", value: analyticsData.unpaidMealPlans },
  ];

  const statusChartData = [
    { name: "Expired", value: analyticsData.expiredMealPlans },
    { name: "Paused", value: analyticsData.pausedMealPlans },
    { name: "Active", value: analyticsData.activeMealPlans },
  ];

  // Data for Line chart
  const revenueData =
    analyticsData.monthlyRevenue[yearFilter] ||
    Array(12)
      .fill(null)
      .map((_, index) => ({
        month: `M${String(index + 1).padStart(2, "0")}`,
        revenue: 0,
      }));

  // Get list of available years
  const availableYears =
    Object.keys(analyticsData.monthlyRevenue).length > 0
      ? Object.keys(analyticsData.monthlyRevenue).sort((a, b) => b - a)
      : [new Date().getFullYear().toString()];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">{error}</p>
        <button
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={fetchAnalyticsData}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Meal Plans Analytics</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Meal Plans</h3>
          <p className="text-3xl font-bold text-gray-800">
            {analyticsData.totalFixed + analyticsData.totalCustom}
          </p>
          <p className="text-sm text-gray-600">
            Fixed: {analyticsData.totalFixed} | Custom: {analyticsData.totalCustom}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Paid Meal Plans</h3>
          <p className="text-3xl font-bold text-green-600">{analyticsData.paidMealPlans}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Unpaid Meal Plans</h3>
          <p className="text-3xl font-bold text-red-600">{analyticsData.unpaidMealPlans}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Meal Plan Types</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValueType"
                className="mr-2"
                checked={showValue}
                onChange={() => setShowValue(!showValue)}
              />
              <label htmlFor="showValueType" className="text-sm text-gray-600">
                Show Values
              </label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={showValue ? ({ name, value }) => `${name}: ${value}` : false}
                labelLine={showValue}
              >
                {typeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} plans`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Payment Status</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValuePayment"
                className="mr-2"
                checked={showValue}
                onChange={() => setShowValue(!showValue)}
              />
              <label htmlFor="showValuePayment" className="text-sm text-gray-600">
                Show Values
              </label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentStatusChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={showValue ? ({ name, value }) => `${name}: ${value}` : false}
                labelLine={showValue}
              >
                {paymentStatusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} plans`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Meal Plan Status</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValueStatus"
                className="mr-2"
                checked={showValue}
                onChange={() => setShowValue(!showValue)}
              />
              <label htmlFor="showValueStatus" className="text-sm text-gray-600">
                Show Values
              </label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={showValue ? ({ name, value }) => `${name}: ${value}` : false}
                labelLine={showValue}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} plans`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Monthly Revenue</h3>
          <div className="flex space-x-2">
            {availableYears.map((year) => (
              <button
                key={year}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  yearFilter === year
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setYearFilter(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip formatter={(value) => `${Number(value).toLocaleString("en-US")} VND`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MealPlansAnalytics;
