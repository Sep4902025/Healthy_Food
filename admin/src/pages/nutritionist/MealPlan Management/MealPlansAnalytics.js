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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Pagination from "../../../components/Pagination";

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
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [paymentPage, setPaymentPage] = useState(0); // 0-based for ReactPaginate
  const [paymentItemsPerPage] = useState(10);
  const [allMealPlans, setAllMealPlans] = useState([]); // Store all meal plans

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      let allMealPlans = [];
      let page = 1;
      const limit = 100;
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

        const totalItems = mealPlansResponse.total || mealPlans.length;
        const totalPages = mealPlansResponse.totalPages || Math.ceil(totalItems / limit);
        hasMore = page < totalPages;
        page += 1;
      }

      setAllMealPlans(allMealPlans);

      const monthlyRevenueMap = {};
      const paidPlans = allMealPlans.filter((plan) => plan.paymentId);
      paidPlans.forEach((plan) => {
        if (plan.startDate && plan.price) {
          const paymentDate = new Date(plan.startDate);
          const year = paymentDate.getFullYear().toString();
          const month = paymentDate.getMonth() + 1;
          if (!monthlyRevenueMap[year]) monthlyRevenueMap[year] = {};
          if (!monthlyRevenueMap[year][month]) monthlyRevenueMap[year][month] = 0;
          monthlyRevenueMap[year][month] += Number(plan.price);
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Meal Plans Analytics";
    workbook.created = new Date();

    // Sheet 1: Summary Metrics
    const summarySheet = workbook.addWorksheet("Summary Metrics");
    summarySheet.addRow(["Meal Plans Analytics Report"]).font = { size: 16, bold: true };
    summarySheet.addRow([
      `Generated on: ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })}`,
    ]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Summary Metrics"]).font = { bold: true };
    summarySheet.addRow(["Metric", "Value", "Description"]).font = { bold: true };
    const summaryData = [
      ["Total Plans", analyticsData.totalMealPlans, "Total number of meal plans created"],
      ["Paid Plans", analyticsData.paidMealPlans, "Plans with successful payments"],
      ["Unpaid Plans", analyticsData.unpaidMealPlans, "Plans awaiting payment"],
    ];
    summaryData.forEach((row) => summarySheet.addRow(row));
    summarySheet.getColumn(1).width = 20;
    summarySheet.getColumn(2).width = 15;
    summarySheet.getColumn(3).width = 40;

    // Sheet 2: Meal Plans Breakdown
    const planSheet = workbook.addWorksheet("Meal Plans Breakdown");
    planSheet.addRow(["Meal Plans Breakdown"]).font = { bold: true };
    planSheet.addRow(["Type", "Count", "Percentage"]).font = { bold: true };
    const totalPlans = analyticsData.totalMealPlans;
    const planData = [
      [
        "Fixed Plans",
        analyticsData.totalFixed,
        totalPlans ? `${((analyticsData.totalFixed / totalPlans) * 100).toFixed(1)}%` : "0.0%",
      ],
      [
        "Custom Plans",
        analyticsData.totalCustom,
        totalPlans ? `${((analyticsData.totalCustom / totalPlans) * 100).toFixed(1)}%` : "0.0%",
      ],
      ["Total", totalPlans, "100.0%"],
    ];
    planData.forEach((row) => planSheet.addRow(row));
    planSheet.getColumn(1).width = 20;
    planSheet.getColumn(2).width = 15;
    planSheet.getColumn(3).width = 15;

    // Sheet 3: Payment Status
    const paymentSheet = workbook.addWorksheet("Payment Status");
    paymentSheet.addRow(["Payment Status"]).font = { bold: true };
    paymentSheet.addRow(["Status", "Count", "Percentage"]).font = { bold: true };
    const paymentData = [
      [
        "Paid",
        analyticsData.paidMealPlans,
        totalPlans ? `${((analyticsData.paidMealPlans / totalPlans) * 100).toFixed(1)}%` : "0.0%",
      ],
      [
        "Unpaid",
        analyticsData.unpaidMealPlans,
        totalPlans ? `${((analyticsData.unpaidMealPlans / totalPlans) * 100).toFixed(1)}%` : "0.0%",
      ],
    ];
    paymentData.forEach((row) => paymentSheet.addRow(row));
    paymentSheet.getColumn(1).width = 20;
    paymentSheet.getColumn(2).width = 15;
    paymentSheet.getColumn(3).width = 15;

    // Sheet 4: Plan Status
    const statusSheet = workbook.addWorksheet("Plan Status");
    statusSheet.addRow(["Plan Status"]).font = { bold: true };
    statusSheet.addRow(["Status", "Count", "Percentage"]).font = { bold: true };
    const statusData = [
      [
        "Active",
        analyticsData.activeMealPlans,
        totalPlans ? `${((analyticsData.activeMealPlans / totalPlans) * 100).toFixed(1)}%` : "0.0%",
      ],
      [
        "Paused",
        analyticsData.pausedMealPlans,
        totalPlans ? `${((analyticsData.pausedMealPlans / totalPlans) * 100).toFixed(1)}%` : "0.0%",
      ],
      [
        "Expired",
        analyticsData.expiredMealPlans,
        totalPlans ? `${((analyticsData.expiredMealPlans / totalPlans) * 100).toFixed(1)}%` : "0.0%",
      ],
    ];
    statusData.forEach((row) => statusSheet.addRow(row));
    statusSheet.getColumn(1).width = 20;
    statusSheet.getColumn(2).width = 15;
    statusSheet.getColumn(3).width = 15;

    // Sheet 5: Monthly Revenue
    const revenueSheet = workbook.addWorksheet("Monthly Revenue");
    revenueSheet.addRow([`Monthly Revenue - ${yearFilter}`]).font = { bold: true };
    revenueSheet.addRow(["Month", "Revenue (VND)", "Percentage of Annual Total"]).font = { bold: true };
    const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
    revenueData.forEach((data) => {
      revenueSheet.addRow([
        data.month,
        data.revenue,
        totalRevenue ? `${((data.revenue / totalRevenue) * 100).toFixed(1)}%` : "0.0%",
      ]);
    });
    revenueSheet.getColumn(1).width = 15;
    revenueSheet.getColumn(2).width = 20;
    revenueSheet.getColumn(3).width = 25;
    revenueSheet.getColumn(2).numFmt = "#,##0";

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Meal_Plans_Analytics_Report_${yearFilter}.xlsx`);
  };

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

  const revenueData =
    analyticsData.monthlyRevenue[yearFilter] ||
    Array(12)
      .fill(null)
      .map((_, index) => ({
        month: `M${String(index + 1).padStart(2, "0")}`,
        revenue: 0,
      }));

  const availableYears =
    Object.keys(analyticsData.monthlyRevenue).length > 0
      ? Object.keys(analyticsData.monthlyRevenue).sort((a, b) => b - a)
      : [new Date().getFullYear().toString()];

  const handleHistoryPageClick = ({ selected }) => {
    setPaymentPage(selected); // 0-based for ReactPaginate
  };

  // Format date to match TableMealPlan
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine payment status to match TableMealPlan
  const getPaymentStatus = (mealPlan) => {
    return mealPlan.paymentId
      ? { label: "Paid", className: "bg-green-100 text-green-800" }
      : { label: "Unpaid", className: "bg-yellow-100 text-yellow-800" };
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-custom-green">Meal Plans Analytics</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            View History
          </button>
          <button
            onClick={exportToExcel}
            className="bg-custom-green text-white px-4 py-2 rounded hover:bg-[#359c7a]"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
          <button
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={fetchAnalyticsData}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Meal Plan Types</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <text x="10%" y="15%" fill="#666" fontSize={14} dominantBaseline="middle">
                  </text>
                  <Tooltip formatter={(value) => `${value} plans`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Payment Status</h3>
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
                    labelLine={false}
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
                    labelLine={false}
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
        </>
      )}

      {/* History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#40B491] mb-4">
              Payment History for Nutritionist
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-[#40B491] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-[8%]">No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-[27%]">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-[20%]">Amount</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold w-[15%]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-[30%]">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allMealPlans.length > 0 ? (
                    allMealPlans
                      .slice(
                        paymentPage * paymentItemsPerPage,
                        (paymentPage + 1) * paymentItemsPerPage
                      )
                      .map((mealPlan, index) => {
                        const paymentStatus = getPaymentStatus(mealPlan);
                        return (
                          <tr key={mealPlan._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-600 text-sm font-medium w-[10%]">
                              {paymentPage * paymentItemsPerPage + index + 1}
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-sm w-[20%] truncate">
                              {mealPlan.title || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-sm w-[20%]">
                              {mealPlan.price ? `${mealPlan.price.toLocaleString()} ₫` : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-center w-[20%]">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.className}`}
                              >
                                {paymentStatus.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-sm w-[30%] whitespace-nowrap">
                              {mealPlan.paymentId && mealPlan.startDate
                                ? formatDate(mealPlan.startDate)
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500">
                        No meal plans found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50">
              <Pagination
                limit={paymentItemsPerPage}
                setLimit={() => {}} // Not modifiable in this context
                totalItems={allMealPlans.length}
                handlePageClick={handleHistoryPageClick}
                currentPage={paymentPage}
                text="Meal Plans"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlansAnalytics;