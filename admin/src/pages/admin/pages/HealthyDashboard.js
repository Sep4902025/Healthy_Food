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
  Legend,
} from "recharts";

import * as XLSX from "xlsx";
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

  const [planTypeData, setPlanTypeData] = useState([]); // Thay vì hard-coded

  const [showValue, setShowValue] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentStats, setPaymentStats] = useState([]);
  const [revenueByYear, setRevenueByYear] = useState({});
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
          setSummaryStats({
            totalMealPlans: mealPlanResponse.data.summary.totalMealPlans || 0,
            unpaidMealPlans: mealPlanResponse.data.summary.unpaidMealPlans || 0,
            activeMealPlans: mealPlanResponse.data.summary.activeMealPlans || 0,
            totalRevenue: paymentResponse.data.totalRevenue || 0,
          });

          // Tính toán Plan Types từ mealPlans
          const mealPlans = mealPlanResponse.data.mealPlans || [];
          const planTypeCounts = mealPlans.reduce((acc, plan) => {
            const type = plan.type || "unknown"; // Giả định có trường type, mặc định là "unknown" nếu không có
            acc[type] = (acc[type] || 0) + 1; // Tăng số đếm cho type tương ứng
            return acc;
          }, {});

          const planTypeDataFormatted = Object.keys(planTypeCounts).map((type) => ({
            name:
              type === "predetermined"
                ? "Fixed Plans"
                : type.charAt(0).toUpperCase() + type.slice(1) + " Plans", // Đổi "predetermined" thành "Fixed Plans"
            value: planTypeCounts[type],
          }));
          setPlanTypeData(planTypeDataFormatted);
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
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await paymentService.getPaymentDashboardData();

        if (response.success) {
          setTotalRevenue(response.data.totalRevenue);
          setPaymentStats(response.data.paymentStats);
          setRevenueByYear(response.data.revenueByYear);
          setPaymentStatusDatas([
            { name: "Paid", value: response.data.paymentStats?.paid || 0 },
            { name: "Unpaid", value: response.data.paymentStats?.unpaid || 0 },
          ]);
          setRevenueByMonth(response.data.revenueByMonth);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Payment:", error);
      }
    };
    fetchPaymentData();
  }, []);

  const revenueDatas =
    revenueByMonth[yearFilters] &&
    Object.keys(revenueByMonth[yearFilters]).map((month) => ({
      month: `Mo${month}`,
      revenue: revenueByMonth[yearFilters][month],
    }));

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Healthy Dashboard";
    workbook.created = new Date();

    // Sheet 1: Summary Statistics
    const summarySheet = workbook.addWorksheet("Summary", {
      properties: { tabColor: { argb: "FF00FF00" } }, // Màu tab xanh lá
    });

    summarySheet.columns = [
      { header: "Category", key: "category", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

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
    summarySheet.getRow(4).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" }, // Màu nền xanh phù hợp giao diện
    };

    const summaryData = [
      ["Total Meal Plans", summaryStats.totalMealPlans],
      ["Unpaid Meal Plans", summaryStats.unpaidMealPlans],
      ["Active Meal Plans", summaryStats.activeMealPlans],
    ];

    summaryData.forEach(([category, value]) => {
      summarySheet.addRow({ category, value });
    });

    // Định dạng bảng (bao gồm tiêu đề)
    summarySheet.getRows(4, summaryData.length + 1).forEach((row) => {
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

    // Sheet 2: System Overview
    const systemSheet = workbook.addWorksheet("System Overview");
    systemSheet.columns = [
      { header: "Category", key: "category", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

    systemSheet.addRow(["System Overview"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    systemSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    systemSheet.addRow(["Total Dishes", systemOverview.totalDishes]);
    systemSheet.addRow(["Total Users", systemOverview.totalUsers]);

    systemSheet.getRows(1, 3).forEach((row) => {
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

    // Sheet 3: Payment Status
    const paymentSheet = workbook.addWorksheet("Payment Status");
    paymentSheet.columns = [
      { header: "Status", key: "status", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

    paymentSheet.addRow(["Payment Status"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    paymentSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    paymentSheet.addRow(["Paid", paymentStatusDatas[0]?.value || 0]);
    paymentSheet.addRow(["Unpaid", paymentStatusDatas[1]?.value || 0]);

    paymentSheet.getRows(1, 3).forEach((row) => {
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

    // Sheet 4: Plan Types
    const planSheet = workbook.addWorksheet("Plan Types");
    planSheet.columns = [
      { header: "Plan Type", key: "name", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

    planSheet.addRow(["Plan Types"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    planSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };
    planTypeData.forEach((plan) => {
      planSheet.addRow(plan);
    });

    planSheet.getRows(1, planTypeData.length + 1).forEach((row) => {
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

    // Sheet 5: Revenue Statistics
    const revenueSheet = workbook.addWorksheet("Revenue");
    revenueSheet.columns = [
      { header: "Month", key: "month", width: 20 },
      { header: "Revenue (VND)", key: "revenue", width: 25 },
    ];

    revenueSheet.addRow([`Revenue Statistics (${yearFilters})`]).font = {
      bold: true,
    };
    revenueSheet.addRow(["Month", "Revenue (VND)"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    revenueSheet.getRow(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    revenueDatas?.forEach((data) => {
      revenueSheet.addRow({
        month: `Month ${data.month.slice(2)}`,
        revenue: data.revenue,
      });
    });

    revenueSheet.addRow(["Total Revenue", totalRevenue]).font = { bold: true };

    // Định dạng bảng (bao gồm cả hàng tổng cộng)
    revenueSheet.getRows(2, (revenueDatas?.length || 0) + 2).forEach((row) => {
      // +2 để bao gồm tiêu đề và tổng cộng
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        if (cell.value && typeof cell.value === "number") {
          cell.numFmt = "#,##0"; // Định dạng số với dấu phân cách hàng nghìn
        }
      });
    });

    // Lưu file
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
            <p className="text-2xl font-bold">{paymentStats.unpaid || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500">Active Meal Plans</h3>
            <p className="text-2xl font-bold">{paymentStats.paid || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 ml-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 mb-2">Total Dishes</h3>
            <p className="text-2xl font-bold mb-2">{systemOverview.totalDishes}</p>
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
            <p className="text-2xl font-bold mb-2">{systemOverview.totalUsers}</p>
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
                <h4 className="text-center text-gray-600 mb-2">Payment Status</h4>
                <PieChart width={220} height={220}>
                  {" "}
                  {/* Tăng kích thước một chút */}
                  <Pie
                    data={paymentStatusDatas}
                    cx={110} // Giữ tâm ở giữa
                    cy={110}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={
                      showValue
                        ? ({ name, value, cx, cy, midAngle, outerRadius }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 20; // Di chuyển nhãn ra xa tâm
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
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
                    labelLine={showValue} // Hiển thị đường dẫn từ nhãn đến phần biểu đồ
                  >
                    {paymentStatusDatas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
              <div>
                <h4 className="text-center text-gray-600 mb-2">Plan Types</h4>
                <PieChart width={220} height={220}>
                  {" "}
                  {/* Tăng kích thước một chút */}
                  <Pie
                    data={planTypeData}
                    cx={110} // Giữ tâm ở giữa
                    cy={110}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={
                      showValue
                        ? ({ name, value, cx, cy, midAngle, outerRadius }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 20; // Di chuyển nhãn ra xa tâm
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
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
                    labelLine={showValue} // Hiển thị đường dẫn từ nhãn đến phần biểu đồ
                  >
                    {planTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
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
                    yearFilters === "2025" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setYearFilters("2025")}
                >
                  2025
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    yearFilters === "2026" ? "bg-blue-500 text-white" : "bg-gray-200"
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
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthyDashboard;
