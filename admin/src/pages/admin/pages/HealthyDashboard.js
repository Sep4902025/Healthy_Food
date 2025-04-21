import React, { useState, useEffect } from "react";
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
  Legend,
} from "recharts";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import mealPlanService from "../../../services/mealPlanServices";
import dishService from "../../../services/nutritionist/dishesServices";
import userService from "../../../services/user.service";
import paymentService from "../../../services/payment.service";

const HealthyDashboard = () => {
  const [summaryStats, setSummaryStats] = useState({
    totalMealPlans: 0,
    unpaidMealPlans: 0,
    activeMealPlans: 0,
    totalRevenue: 0,
  });

  const [planTypeData, setPlanTypeData] = useState([]);
  const [showValue, setShowValue] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentStatusDatas, setPaymentStatusDatas] = useState([]);
  const [revenueByMonth, setRevenueByMonth] = useState({});
  const [yearFilters, setYearFilters] = useState("2025");

  const [systemOverview, setSystemOverview] = useState({
    dishes: [],
    users: [],
    totalDishes: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const mealPlanResponse = await mealPlanService.getAllMealPlanAdmin();
        const paymentResponse = await paymentService.getPaymentDashboardData();
        const dishResponse = await dishService.getAllDishes();
        const userResponse = await userService.getAllUsers();

        console.log("mealPlanResponse:", mealPlanResponse);
        console.log("paymentResponse:", paymentResponse.data);
        console.log("dishResponse:", dishResponse);
        console.log("userResponse:", userResponse);

        if (mealPlanResponse.success && mealPlanResponse.data?.summary) {
          const mealPlans = mealPlanResponse.data.mealPlans || [];
          const planTypeCounts = mealPlans.reduce((acc, plan) => {
            const type = plan.type ? plan.type.toLowerCase() : "unknown";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});

          const allPlanTypes = [
            { name: "Fixed Plans", type: "predetermined" },
            { name: "Custom Plans", type: "custom" }, // Adjusted to match Excel output
          ];

          const planTypeDataFormatted = allPlanTypes.map(({ name, type }) => ({
            name,
            value: planTypeCounts[type] || 0,
          }));

          setPlanTypeData(planTypeDataFormatted);

          setSummaryStats({
            totalMealPlans: mealPlanResponse.data.summary.totalMealPlans || 0,
            unpaidMealPlans: paymentResponse.data.paymentStats?.unpaid || 0,
            activeMealPlans: paymentResponse.data.paymentStats?.paid || 0,
            totalRevenue: paymentResponse.data.totalRevenue || 0,
          });
        }

        if (dishResponse.success && userResponse.success) {
          setSystemOverview({
            dishes: dishResponse.data?.items?.slice() || [],
            users: userResponse.users?.slice() || [],
            totalDishes: dishResponse.data?.total || 0,
            totalUsers: userResponse.total || 0,
            totalRevenue: paymentResponse.data.totalRevenue || 0,
          });
        }

        if (paymentResponse.data?.paymentStats) {
          setPaymentStatusDatas([
            {
              name: "Paid",
              value: paymentResponse.data.paymentStats.paid || 0,
            },
            {
              name: "Unpaid",
              value: paymentResponse.data.paymentStats.unpaid || 0,
            },
          ]);
          setRevenueByMonth(paymentResponse.data.revenueByMonth || {});
          setTotalRevenue(paymentResponse.data.totalRevenue || 0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const revenueDatas = revenueByMonth[yearFilters]
    ? Object.keys(revenueByMonth[yearFilters])
        .sort((a, b) => Number(a) - Number(b))
        .map((month) => ({
          month: new Date(2025, Number(month) - 1).toLocaleString("en-US", {
            month: "long",
          }),
          revenue: revenueByMonth[yearFilters][month],
        }))
    : [];

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Healthy Dashboard";
    workbook.created = new Date();

    // Sheet 1: Summary Statistics
    const summarySheet = workbook.addWorksheet("Summary", {
      properties: { tabColor: { argb: "FF00FF00" } },
    });

    summarySheet.addRow(["Healthy Dashboard Statistics Report"]).font = {
      size: 16,
      bold: true,
    };
    summarySheet.addRow([
      `Generated on: ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })}`,
    ]);
    summarySheet.addRow([]);

    summarySheet.addRow(["Summary Statistics"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    summarySheet.getCell("A4").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    summarySheet.addRow(["Category", "Value"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    summarySheet.getCell("A5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    summarySheet.getCell("B5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    const summaryData = [
      ["Total Meal Plans", summaryStats.totalMealPlans],
      ["Unpaid Meal Plans", paymentStatusDatas[1]?.value || 0],
      ["Active Meal Plans", paymentStatusDatas[0]?.value || 0],
      ["Total Revenue", summaryStats.totalRevenue.toLocaleString() + " VND"],
    ];

    summaryData.forEach(([category, value]) => {
      summarySheet.addRow([category, value]);
    });

    summarySheet.getRows(5, summaryData.length + 1).forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    });

    summarySheet.columns = [
      { key: "category", width: 30 },
      { key: "value", width: 20 },
    ];

    // Sheet 2: System Overview
    const systemSheet = workbook.addWorksheet("System Overview");
    systemSheet.addRow(["System Overview"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    systemSheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    systemSheet.addRow(["Category", "Value"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    systemSheet.getCell("A2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    systemSheet.getCell("B2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    const systemData = [
      ["Total Dishes", systemOverview.totalDishes],
      ["Total Users", systemOverview.totalUsers],
    ];

    systemData.forEach(([category, value]) => {
      systemSheet.addRow([category, value]);
    });

    systemSheet.getRows(2, systemData.length + 1).forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    });

    systemSheet.columns = [
      { key: "category", width: 30 },
      { key: "value", width: 20 },
    ];

    // Sheet 3: Payment Status
    const paymentSheet = workbook.addWorksheet("Payment Status");
    paymentSheet.addRow(["Payment Status"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    paymentSheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    paymentSheet.addRow(["Status", "Value"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    paymentSheet.getCell("A2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    paymentSheet.getCell("B2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    const paymentData = [
      ["Paid", paymentStatusDatas[0]?.value || 0],
      ["Unpaid", paymentStatusDatas[1]?.value || 0],
    ];

    paymentData.forEach(([status, value]) => {
      paymentSheet.addRow([status, value]);
    });

    paymentSheet.getRows(2, paymentData.length + 1).forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    });

    paymentSheet.columns = [
      { key: "status", width: 30 },
      { key: "value", width: 20 },
    ];

    // Sheet 4: Plan Types
    const planSheet = workbook.addWorksheet("Plan Types");
    planSheet.addRow(["Plan Types"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    planSheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    planSheet.addRow(["Plan Type", "Value"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    planSheet.getCell("A2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    planSheet.getCell("B2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    planTypeData.forEach((plan) => {
      planSheet.addRow([plan.name, plan.value]);
    });

    planSheet.getRows(2, planTypeData.length + 1).forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    });

    planSheet.columns = [
      { key: "name", width: 30 },
      { key: "value", width: 20 },
    ];

    // Sheet 5: Revenue Statistics
    const revenueSheet = workbook.addWorksheet("Revenue");
    revenueSheet.addRow([`Revenue Statistics (${yearFilters})`]).font = {
      bold: true,
    };
    revenueSheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    revenueSheet.addRow(["Month", "Revenue (VND)"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    revenueSheet.getCell("A2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    revenueSheet.getCell("B2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    revenueDatas.forEach((data) => {
      revenueSheet.addRow([data.month, data.revenue]);
    });

    revenueSheet.addRow(["Total Revenue", totalRevenue]).font = { bold: true };

    revenueSheet.getRows(2, revenueDatas.length + 2).forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        if (cell.value && typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    revenueSheet.columns = [
      { key: "month", width: 20 },
      { key: "revenue", width: 25 },
    ];

    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Healthy_Dashboard_Stats.xlsx");
  };

  return (
    <div className="flex w-full h-full">
      <div className="flex-grow flex flex-col">
        <div className="flex justify-end mr-6 mt-6">
          <button
            onClick={exportToExcel}
            className="bg-custom-green text-white px-4 py-2 rounded hover:bg-[#359c7a]"
          >
            Export to Excel
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 ml-6 mt-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500">Total Meal Plans</h3>
            <p className="text-2xl font-bold">{summaryStats.totalMealPlans}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500">Unpaid Meal Plans</h3>
            <p className="text-2xl font-bold">
              {paymentStatusDatas[1]?.value || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500">Active Meal Plans</h3>
            <p className="text-2xl font-bold">
              {paymentStatusDatas[0]?.value || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 ml-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 mb-2">Total Dishes</h3>
            <p className="text-2xl font-bold mb-2">
              {systemOverview.totalDishes}
            </p>
            <div className="max-h-40 overflow-y-auto">
              {systemOverview.dishes.map((dish) => (
                <div key={dish._id} className="flex items-center mb-2">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-8 h-8 mr-2 rounded"
                    onError={(e) => (e.target.src = "/api/placeholder/32/32")}
                  />
                  <span>{dish.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 mb-2">Total Users</h3>
            <p className="text-2xl font-bold mb-2">
              {systemOverview.totalUsers}
            </p>
            <div className="max-h-40 overflow-y-auto">
              {systemOverview.users.map((user) => (
                <div key={user._id} className="flex items-center mb-2">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 mr-2 rounded-full"
                    onError={(e) => (e.target.src = "/api/placeholder/32/32")}
                  />
                  <span>{user.username}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500">Total Revenue</h3>
            <p className="text-xl font-bold text-custom-green">
              {totalRevenue.toLocaleString()} VND
            </p>
          </div>
        </div>

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
                <PieChart width={220} height={220}>
                  <Pie
                    data={paymentStatusDatas}
                    cx={110}
                    cy={110}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={
                      showValue
                        ? ({ name, value, cx, cy, midAngle, outerRadius }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 20;
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#666"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                              >
                                {value}
                              </text>
                            );
                          }
                        : false
                    }
                    labelLine={showValue}
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
                <PieChart width={260} height={220}>
                  <Pie
                    data={planTypeData}
                    cx={130} // Center adjusted for new width (260 / 2)
                    cy={110}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={
                      showValue
                        ? ({ name, value, cx, cy, midAngle, outerRadius }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 10; // Reduced from +20 to +10
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#666"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                              >
                                {value}
                              </text>
                            );
                          }
                        : false
                    }
                    labelLine={showValue}
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
              <LineChart
                data={revenueDatas}
                margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  width={80}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(1)}K`
                      : value
                  }
                />
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
        </div>
      </div>
    </div>
  );
};

export default HealthyDashboard;
