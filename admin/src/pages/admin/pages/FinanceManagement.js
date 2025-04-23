import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import mealPlanService from "../../../services/mealPlanServices";
import { EyeIcon } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import paymentService from "../../../services/payment.service";
import { useLocation, useNavigate } from "react-router-dom";

const FinanceManagement = () => {
  const { user } = useSelector(selectAuth);
  const location = useLocation();
  const navigate = useNavigate();
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNutri, setSelectedNutri] = useState(null);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalItems, setHistoryTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Gộp fetchSalaryHistory và fetchFinanceData vào một hàm để tránh gọi API trùng lặp
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [historyResult, financeResult] = await Promise.all([
        paymentService.getSalaryHistoryByMonthYear(
          selectedMonth,
          selectedYear,
          1,
          1000
        ),
        mealPlanService.getAllNutritionistsWithMealPlans(
          currentPage + 1,
          limit,
          selectedMonth,
          selectedYear
        ),
      ]);

      // Xử lý dữ liệu từ fetchSalaryHistory
      if (historyResult.success) {
        console.log("Updated Salary History:", historyResult.data);
        setSalaryHistory(historyResult.data || []);
      } else {
        toast.error(historyResult.message || "Failed to fetch salary history");
      }

      // Xử lý dữ liệu từ fetchFinanceData
      if (financeResult.success) {
        console.log("Updated Nutritionists:", financeResult.data.nutritionists);
        setNutritionists(financeResult.data.nutritionists || []);
        setTotalItems(financeResult.total || 0);
        setTotalPages(financeResult.totalPages || 1);
      } else {
        setError(financeResult.message || "Failed to load finance data");
        setNutritionists([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Error fetching data");
      setError("Failed to load data");
      setNutritionists([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu khi các dependency thay đổi
  useEffect(() => {
    if (user?.role === "admin") {
      fetchAllData();
    }
  }, [user, currentPage, limit, selectedMonth, selectedYear]);

  // Xử lý redirect từ VNPay
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const message = query.get("message");
    if (status && message) {
      if (status === "success") {
        toast.success(message.replace(/\+/g, " "));
        fetchAllData(); // Gọi lại dữ liệu để cập nhật UI
      } else {
        toast.error(message.replace(/\+/g, " "));
      }
      navigate("/admin/financemanagement", { replace: true });
    }
  }, [location, navigate]);

  const fetchSalaryHistoryForModal = async (
    page = historyPage,
    limit = historyLimit
  ) => {
    try {
      const result = await paymentService.getSalaryHistoryByMonthYear(
        selectedMonth,
        selectedYear,
        page,
        limit
      );
      if (result.success) {
        setSalaryHistory(result.data || []);
        setHistoryTotalItems(result.pagination.total || 0);
        setHistoryTotalPages(result.pagination.totalPages || 1);
        setHistoryPage(page);
        setHistoryLimit(limit);
      } else {
        toast.error(result.message || "Failed to fetch salary history");
      }
    } catch (err) {
      toast.error("Error fetching salary history");
      console.error(err);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleHistoryPageClick = (data) => {
    const newPage = data.selected + 1;
    fetchSalaryHistoryForModal(newPage, historyLimit);
  };

  const handleViewDetails = (nutri) => {
    setSelectedNutri(nutri);
    setDetailsModalOpen(true);
  };

  const handleCalculateSalary = (nutri) => {
    setSelectedNutri(nutri);
    setSalaryModalOpen(true);
  };

  const handleViewHistory = () => {
    setHistoryModalOpen(true);
    fetchSalaryHistoryForModal(1, historyLimit);
  };

  const handleAcceptSalary = async () => {
    console.log("AccEPT");
    console.log("Selected Nutritionist:", selectedNutri);

    if (!selectedNutri) {
      toast.error("No nutritionist selected");
      return;
    }

    const salary = calculateSalary(selectedNutri);
    console.log("Salary:", salary);

    try {
      const paymentResult = await paymentService.acceptSalary(
        selectedNutri.id,
        salary,
        selectedMonth,
        selectedYear
      );
      console.log("Payment Result:", paymentResult);

      if (paymentResult.success) {
        const paymentUrl = paymentResult.data.paymentUrl;
        console.log("Payment URL:", paymentUrl);

        if (paymentUrl) {
          toast.success("Redirecting to payment gateway...");
          window.location.href = paymentUrl; // Chuyển hướng trong cùng tab
        } else {
          toast.error("Payment URL not provided by the server");
        }
      } else {
        console.log("Payment failed:", paymentResult.message);
        toast.error(paymentResult.message || "Failed to process payment");
      }
    } catch (err) {
      console.error("Error in handleAcceptSalary:", err);
      toast.error(err.message || "Failed to process payment");
    } finally {
      setSalaryModalOpen(false);
    }
  };

  const calculateSalary = (nutri) => {
    const baseSalary = 5000000;
    const commission = nutri.mealPlans
      .filter((mp) => !mp.isBlock)
      .reduce((sum, mp) => sum + (mp.price || 0) * 0.1, 0);
    return baseSalary + commission;
  };

  const formatPrice = (price) => {
    return price !== undefined && price !== null
      ? price.toLocaleString("en-US") + " VND"
      : "N/A";
  };

  const isPaidForMonth = (nutriId) => {
    return salaryHistory.some(
      (payment) =>
        payment.userId._id === nutriId &&
        payment.month === selectedMonth &&
        payment.year === selectedYear &&
        payment.status === "success"
    );
  };

  const getPaymentStatus = (nutriId) => {
    const payment = salaryHistory.find(
      (payment) =>
        payment.userId._id === nutriId &&
        payment.month === selectedMonth &&
        payment.year === selectedYear
    );
    return payment ? payment.status : "Not Paid";
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Finance Management";
    workbook.created = new Date();

    // Fetch all nutritionists without pagination
    let allNutritionists = [];
    try {
      const financeResult =
        await mealPlanService.getAllNutritionistsWithMealPlans(
          1,
          1000,
          selectedMonth,
          selectedYear
        );
      if (financeResult.success) {
        allNutritionists = financeResult.data.nutritionists || [];
      } else {
        console.error(
          "Failed to fetch all nutritionists:",
          financeResult.message
        );
      }
    } catch (error) {
      console.error("Error fetching all nutritionists:", error.message);
    }

    // Sheet 1: Nutritionist Summary
    const summarySheet = workbook.addWorksheet("Nutritionist Summary", {
      properties: { tabColor: { argb: "FF40B491" } },
    });

    summarySheet.addRow([
      `Finance Management Report - Month ${selectedMonth}/${selectedYear}`,
    ]).font = {
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
    summarySheet.addRow(["Nutritionist Summary"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    summarySheet.getCell("A4").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    summarySheet.addRow([
      "No.",
      "Nutritionist",
      "Meal Plans",
      "Success",
      "Pending",
      "Base Salary (VND)",
      "Commission (VND)",
      "Total Salary (VND)",
      "Status",
    ]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    ["A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5"].forEach((cell) => {
      summarySheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF40B491" },
      };
    });

    allNutritionists.forEach((nutri, index) => {
      summarySheet.addRow([
        index + 1,
        nutri.name || "N/A",
        nutri.mealPlanCount || 0,
        nutri.successCount || 0,
        nutri.pendingCount || 0,
        5000000,
        nutri.mealPlans
          .filter((mp) => !mp.isBlock)
          .reduce((sum, mp) => sum + (mp.price || 0) * 0.1, 0),
        calculateSalary(nutri),
        getPaymentStatus(nutri.id),
      ]);
    });

    summarySheet.addRow(["Total Nutritionists", allNutritionists.length]).font =
      { bold: true };

    summarySheet.getRows(5, allNutritionists.length + 2).forEach((row) => {
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

    summarySheet.columns = [
      { key: "no", width: 5 },
      { key: "nutritionist", width: 20 },
      { key: "mealPlans", width: 10 },
      { key: "success", width: 10 },
      { key: "pending", width: 10 },
      { key: "baseSalary", width: 15 },
      { key: "commission", width: 15 },
      { key: "totalSalary", width: 15 },
      { key: "status", width: 15 },
    ];

    // Sheet 2: Meal Plans
    const mealPlanSheet = workbook.addWorksheet("Meal Plans");
    mealPlanSheet.addRow([
      `Meal Plans - Month ${selectedMonth}/${selectedYear}`,
    ]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    mealPlanSheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    let currentRow = 2;
    allNutritionists.forEach((nutri) => {
      mealPlanSheet.addRow([`Nutritionist: ${nutri.name || "N/A"}`]).font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      mealPlanSheet.getCell(`A${currentRow}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF40B491" },
      };
      currentRow++;

      mealPlanSheet.addRow([
        "No.",
        "Title",
        "Price (VND)",
        "Start Date",
        "Duration (Days)",
        "Status",
        "User",
      ]).font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
        mealPlanSheet.getCell(`${col}${currentRow}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF40B491" },
        };
      });
      currentRow++;

      nutri.mealPlans.forEach((mp, index) => {
        mealPlanSheet.addRow([
          index + 1,
          mp.title || "N/A",
          mp.price || 0,
          mp.startDate
            ? new Date(mp.startDate).toLocaleDateString("en-US")
            : "N/A",
          mp.duration || 0,
          !mp.isBlock ? "Success" : "Pending",
          mp.userId?.username || "Unknown",
        ]);
        currentRow++;
      });

      mealPlanSheet.addRow([]); // Spacer row
      currentRow++;
    });

    mealPlanSheet.getRows(2, currentRow - 2).forEach((row) => {
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

    mealPlanSheet.columns = [
      { key: "no", width: 5 },
      { key: "title", width: 30 },
      { key: "price", width: 15 },
      { key: "startDate", width: 15 },
      { key: "duration", width: 15 },
      { key: "status", width: 10 },
      { key: "user", width: 20 },
    ];

    // Sheet 3: Salary History
    const historySheet = workbook.addWorksheet("Salary History");
    historySheet.addRow([
      `Salary History - Month ${selectedMonth}/${selectedYear}`,
    ]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    historySheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    historySheet.addRow([
      "No.",
      "Nutritionist",
      "Amount (VND)",
      "Status",
      "Date",
      "Month/Year",
      "Transaction ID",
    ]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    ["A2", "B2", "C2", "D2", "E2", "F2", "G2"].forEach((cell) => {
      historySheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF40B491" },
      };
    });

    salaryHistory.forEach((payment, index) => {
      historySheet.addRow([
        index + 1,
        payment.userId?.username || "Unknown",
        payment.amount || 0,
        payment.status || "N/A",
        payment.paymentDate
          ? new Date(payment.paymentDate).toLocaleDateString("en-US")
          : "N/A",
        `${payment.month}/${payment.year}`,
        payment.transactionNo || "N/A",
      ]);
    });

    historySheet.addRow(["Total Payments", salaryHistory.length]).font = {
      bold: true,
    };

    historySheet.getRows(2, salaryHistory.length + 2).forEach((row) => {
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

    historySheet.columns = [
      { key: "no", width: 5 },
      { key: "nutritionist", width: 20 },
      { key: "amount", width: 15 },
      { key: "status", width: 10 },
      { key: "date", width: 15 },
      { key: "monthYear", width: 15 },
      { key: "transactionId", width: 20 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Finance_Report_${selectedMonth}_${selectedYear}.xlsx`);
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">
          Access Denied: Admin Only
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-[#40B491] text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Finance Management
        </h1>
        <div className="space-x-4 flex items-center">
          <div className="flex space-x-4 items-center">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491] focus:border-custom-green"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#40B491] focus:border-custom-green"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - 2 + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleViewHistory}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            View Salary History
          </button>
          <button
            onClick={exportToExcel}
            className="bg-custom-green text-white px-4 py-2 rounded hover:bg-[#359c7a]"
          >
            Export to Excel
          </button>
        </div>
      </div>
      <Loading isLoading={loading}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
            <div>No.</div>
            <div>Nutritionist</div>
            <div>Meal Plans</div>
            <div>Success</div>
            <div>Pending</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {nutritionists.length > 0 ? (
              nutritionists.map((nutri, index) => (
                <div
                  key={nutri.id}
                  className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-50"
                >
                  <div>{currentPage * limit + index + 1}</div>
                  <div>{nutri.name}</div>
                  <div>{nutri.mealPlanCount}</div>
                  <div>{nutri.successCount}</div>
                  <div>{nutri.pendingCount}</div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        getPaymentStatus(nutri.id) === "success"
                          ? "bg-green-100 text-green-800"
                          : getPaymentStatus(nutri.id) === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : getPaymentStatus(nutri.id) === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getPaymentStatus(nutri.id)}
                    </span>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <button
                      onClick={() => handleViewDetails(nutri)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EyeIcon size={20} />
                    </button>
                    {isPaidForMonth(nutri.id) ? (
                      <button
                        className="bg-gray-400 text-white px-4 py-1 rounded cursor-not-allowed flex justify-center w-20"
                        disabled
                      >
                        Paid
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCalculateSalary(nutri)}
                        className="bg-[#40B491] text-white px-4 w-20 py-1 rounded hover:bg-[#359c7a]"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No nutritionists found.
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50">
            <Pagination
              limit={limit}
              setLimit={setLimit}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              currentPage={currentPage}
              text={"Nutritionists"}
            />
          </div>
        </div>
      </Loading>

      {/* Details Modal */}
      {detailsModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedNutri && (
              <>
                <h2 className="text-2xl font-bold text-[#40B491] mb-4">
                  Meal Plans for {selectedNutri.name} (Month {selectedMonth}/
                  {selectedYear})
                </h2>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-7 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
                    <div>No.</div>
                    <div>Title</div>
                    <div>Price</div>
                    <div>Start Date</div>
                    <div>Duration</div>
                    <div>Status</div>
                    <div>User</div>
                  </div>
                  {selectedNutri.mealPlans.map((mp, idx) => (
                    <div
                      key={mp._id}
                      className="grid grid-cols-7 gap-4 p-4 border-b"
                    >
                      <div>{idx + 1}</div>
                      <div>{mp.title}</div>
                      <div>{formatPrice(mp.price)}</div>
                      <div>
                        {new Date(mp.startDate).toLocaleDateString("en-US")}
                      </div>
                      <div>{mp.duration} days</div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            !mp.isBlock
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {!mp.isBlock ? "Success" : "Pending"}
                        </span>
                      </div>
                      <div>{mp.userId?.username || "Unknown"}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setDetailsModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Salary Modal */}
      {salaryModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            {selectedNutri && (
              <>
                <h2 className="text-2xl font-bold text-[#40B491] mb-4">
                  Salary for {selectedNutri.name} (Month {selectedMonth}/
                  {selectedYear})
                </h2>
                <div className="space-y-2">
                  <p>Base Salary: {formatPrice(5000000)}</p>
                  <p>
                    Commission (10% of successful meal plans):{" "}
                    {formatPrice(
                      selectedNutri.mealPlans
                        .filter((mp) => !mp.isBlock)
                        .reduce((sum, mp) => sum + (mp.price || 0) * 0.1, 0)
                    )}
                  </p>
                  <p className="font-semibold">
                    Total Salary: {formatPrice(calculateSalary(selectedNutri))}
                  </p>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={handleAcceptSalary}
                    className="px-4 py-2 bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition"
                  >
                    Accept & Process Payment
                  </button>
                  <button
                    onClick={() => setSalaryModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <>
              <h2 className="text-2xl font-bold text-[#40B491] mb-4">
                Salary Payment History for Nutritionists (Month {selectedMonth}/
                {selectedYear})
              </h2>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
                  <div>No.</div>
                  <div>Nutritionist</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Date</div>
                  <div>Month/Year</div>
                  <div>Transaction ID</div>
                </div>
                {salaryHistory.length > 0 ? (
                  salaryHistory.map((payment, idx) => (
                    <div
                      key={payment._id}
                      className="grid grid-cols-7 gap-4 p-4 border-b"
                    >
                      <div>{(historyPage - 1) * historyLimit + idx + 1}</div>
                      <div>{payment.userId?.username || "Unknown"}</div>
                      <div>{formatPrice(payment.amount)}</div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div>
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString(
                              "en-US"
                            )
                          : "N/A"}
                      </div>
                      <div>{`${payment.month}/${payment.year}`}</div>
                      <div>{payment.transactionNo || "N/A"}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No salary payments found for this month and year.
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50">
                <Pagination
                  limit={historyLimit}
                  setLimit={setHistoryLimit}
                  totalItems={historyTotalItems}
                  handlePageClick={handleHistoryPageClick}
                  currentPage={historyPage - 1}
                  text={"Payments"}
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
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;
