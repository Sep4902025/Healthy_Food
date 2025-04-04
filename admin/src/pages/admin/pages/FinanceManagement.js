import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import mealPlanService from "../../../services/mealPlanServices";
import { EyeIcon } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";
import { Document, HeadingLevel, Packer, Paragraph, TextRun, AlignmentType } from "docx";
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

  useEffect(() => {
    if (user?.role === "admin") {
      fetchFinanceData();
      fetchSalaryHistory();
    }
  }, [user, currentPage, limit, selectedMonth, selectedYear]);

  // Handle redirect from VNPay
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const message = query.get("message");
    if (status && message) {
      if (status === "success") {
        toast.success(message.replace(/\+/g, " "));
        fetchSalaryHistory();
        fetchFinanceData();
      } else {
        toast.error(message.replace(/\+/g, " "));
      }
      navigate("/admin/financemanagement", { replace: true });
    }
  }, [location, navigate]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const response = await mealPlanService.getAllNutritionistsWithMealPlans(
        currentPage + 1,
        limit,
        selectedMonth,
        selectedYear
      );
      if (response.success) {
        setNutritionists(response.data.nutritionists || []);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load finance data");
      setNutritionists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryHistory = async () => {
    try {
      const result = await paymentService.getSalaryHistoryByMonthYear(
        selectedMonth,
        selectedYear,
        1, // Fetch only the first page for the table
        1000 // Use a large limit to ensure we get all relevant records for the table
      );
      if (result.success) {
        setSalaryHistory(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch salary history");
      }
    } catch (err) {
      toast.error("Error fetching salary history");
      console.error(err);
    }
  };

  const fetchSalaryHistoryForModal = async (page = historyPage, limit = historyLimit) => {
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
    fetchSalaryHistoryForModal(1, historyLimit); // Fetch the first page when opening the modal
  };

  const handleAcceptSalary = async () => {
    if (!selectedNutri) return;
    const salary = calculateSalary(selectedNutri);
    try {
      const paymentResult = await paymentService.acceptSalary(
        selectedNutri.id,
        salary,
        selectedMonth,
        selectedYear
      );
      if (paymentResult.status === "success") {
        toast.success("Redirecting to payment gateway...");
        window.open(paymentResult.data.paymentUrl, "_blank");
      } else {
        toast.error(paymentResult.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to process payment");
    } finally {
      await fetchSalaryHistory();
      await fetchFinanceData();
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
    return price !== undefined && price !== null ? price.toLocaleString("en-US") + " VND" : "N/A";
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

  const exportToWord = () => {
    // Keep your existing exportToWord logic
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Access Denied: Admin Only</p>
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
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
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
            onClick={exportToWord}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Export to Word
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
                <div key={nutri.id} className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-50">
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
                        className="bg-[#40B491] text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Pay Salary
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No nutritionists found.</div>
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
                  Meal Plans for {selectedNutri.name} (Month {selectedMonth}/{selectedYear})
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
                    <div key={mp._id} className="grid grid-cols-7 gap-4 p-4 border-b">
                      <div>{idx + 1}</div>
                      <div>{mp.title}</div>
                      <div>{formatPrice(mp.price)}</div>
                      <div>{new Date(mp.startDate).toLocaleDateString("en-US")}</div>
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
                  Salary for {selectedNutri.name} (Month {selectedMonth}/{selectedYear})
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
                Salary Payment History for Nutritionists (Month {selectedMonth}/{selectedYear})
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
                    <div key={payment._id} className="grid grid-cols-7 gap-4 p-4 border-b">
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
                          ? new Date(payment.paymentDate).toLocaleDateString("en-US")
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
