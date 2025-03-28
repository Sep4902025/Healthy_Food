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
    monthlyRevenue: [],
    totalMealPlans: 0,
    expiredMealPlans: 0,
    pausedMealPlans: 0,
    activeMealPlans: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showValue, setShowValue] = useState(false);
  const [yearFilter, setYearFilter] = useState("2025");

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy danh sách MealPlan hiện tại
      const mealPlansResponse = await mealPlanService.getAllMealPlans();
      const mealPlans = mealPlansResponse.success ? mealPlansResponse.data : [];

      // Lấy lịch sử MealPlan của tất cả user
      const allUsersHistory = await Promise.all(
        mealPlans.map(async (plan) => {
          const historyResponse = await mealPlanService.getMealPlanHistory(plan.userId._id);
          return historyResponse.success ? historyResponse.data : [];
        })
      );
      const historicalMealPlans = allUsersHistory.flat().map((h) => h.mealPlanId);

      // Kết hợp MealPlan hiện tại và lịch sử
      const allMealPlans = [...mealPlans, ...historicalMealPlans];

      // Tính số lượng Fixed và Custom Meal Plans
      const totalFixed = allMealPlans.filter((plan) => plan.type === "fixed").length;
      const totalCustom = allMealPlans.filter((plan) => plan.type === "custom").length;

      // Tính số lượng Paid và Unpaid Meal Plans
      const paidMealPlans = allMealPlans.filter((plan) => plan.paymentId !== null).length;
      const unpaidMealPlans = allMealPlans.filter((plan) => plan.paymentId === null).length;

      // Tính tổng số MealPlan và phân loại theo trạng thái dựa trên endDate
      const totalMealPlans = allMealPlans.length;
      const expiredMealPlans = allMealPlans.filter(
        (plan) => new Date(plan.endDate) < new Date()
      ).length;
      const pausedMealPlans = allMealPlans.filter((plan) => plan.isPause === true).length;
      const activeMealPlans = allMealPlans.filter(
        (plan) => new Date(plan.endDate) >= new Date() && !plan.isPause
      ).length;

      // Lấy danh sách paymentId từ các MealPlan đã thanh toán
      const paymentIds = allMealPlans
        .filter((plan) => plan.paymentId !== null)
        .map((plan) => plan.paymentId);

      let payments = [];
      if (paymentIds.length > 0) {
        const paymentsResponse = await Promise.all(
          paymentIds.map(async (paymentId) => {
            const response = await mealPlanService.checkPaymentStatus(paymentId);
            return response.success ? response.data : null;
          })
        );
        payments = paymentsResponse.filter((payment) => payment !== null);
      }

      // Tính tổng thu nhập theo từng tháng
      const monthlyRevenueMap = {};
      payments.forEach((payment) => {
        if (payment.status === "success") {
          const paymentDate = new Date(payment.paymentDate);
          const year = paymentDate.getFullYear();
          const month = paymentDate.getMonth() + 1;
          const monthYear = `${year}-${String(month).padStart(2, "0")}`;

          if (!monthlyRevenueMap[year]) {
            monthlyRevenueMap[year] = {};
          }
          if (!monthlyRevenueMap[year][month]) {
            monthlyRevenueMap[year][month] = 0;
          }
          monthlyRevenueMap[year][month] += payment.amount;
        }
      });

      const monthlyRevenue = {};
      Object.keys(monthlyRevenueMap).forEach((year) => {
        monthlyRevenue[year] = Object.keys(monthlyRevenueMap[year])
          .sort((a, b) => a - b)
          .map((month) => ({
            month: `Th${month}`,
            revenue: monthlyRevenueMap[year][month],
          }));
      });

      setAnalyticsData({
        totalFixed,
        totalCustom,
        paidMealPlans,
        unpaidMealPlans,
        monthlyRevenue,
        totalMealPlans,
        expiredMealPlans,
        pausedMealPlans,
        activeMealPlans,
      });
    } catch (err) {
      console.error("Error fetching analytics data:", err.message);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing analytics data...");
      fetchAnalyticsData();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

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

  const revenueData = analyticsData.monthlyRevenue[yearFilter] || [];

  if (loading) {
    return <div className="flex justify-center items-center h-full"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full"><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meal Plans Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Meal Plans</h3>
          <p className="text-2xl font-bold">{analyticsData.totalFixed + analyticsData.totalCustom}</p>
          <p>Fixed: {analyticsData.totalFixed} | Custom: {analyticsData.totalCustom}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Paid Meal Plans</h3>
          <p className="text-2xl font-bold text-green-600">{analyticsData.paidMealPlans}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Unpaid Meal Plans</h3>
          <p className="text-2xl font-bold text-red-600">{analyticsData.unpaidMealPlans}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Meal Plan Types</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValueType"
                className="mr-2"
                checked={showValue}
                onChange={() => setShowValue(!showValue)}
              />
              <label htmlFor="showValueType">Show Value</label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={showValue}
              >
                {typeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Payment Status</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValuePayment"
                className="mr-2"
                checked={showValue}
                onChange={() => setShowValue(!showValue)}
              />
              <label htmlFor="showValuePayment">Show Value</label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentStatusChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={showValue}
              >
                {paymentStatusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Meal Plan Status</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValueStatus"
                className="mr-2"
                checked={showValue}
                onChange={() => setShowValue(!showValue)}
              />
              <label htmlFor="showValueStatus">Show Value</label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={showValue}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Monthly Revenue</h3>
          <div>
            <button
              className={`mr-2 px-3 py-1 rounded ${yearFilter === "2025" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setYearFilter("2025")}
            >
              2025
            </button>
            <button
              className={`px-3 py-1 rounded ${yearFilter === "2026" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setYearFilter("2026")}
            >
              2026
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MealPlansAnalytics;



