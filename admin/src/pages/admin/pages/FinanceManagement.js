import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import mealPlanService from "../../../services/mealPlanServices";
import { EyeIcon } from "lucide-react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

Modal.setAppElement("#root");

const FinanceManagement = () => {
  const { user } = useSelector(selectAuth);
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNutri, setSelectedNutri] = useState(null);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchFinanceData();
    }
  }, [user, currentPage, limit]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const response = await mealPlanService.getAllMealPlans2(
        currentPage + 1,
        limit
      );
      if (response.success) {
        const mealPlans = response.data.mealPlans || [];
        const nutriMap = new Map();
        mealPlans.forEach((mp) => {
          const nutriId = mp.createdBy?._id || "unknown";
          const nutriName = mp.createdBy?.username || "Unknown Nutritionist";

          if (!nutriMap.has(nutriId)) {
            nutriMap.set(nutriId, {
              id: nutriId,
              name: nutriName,
              mealPlans: [],
              successCount: 0,
              pendingCount: 0,
            });
          }

          const nutriData = nutriMap.get(nutriId);
          nutriData.mealPlans.push(mp);
          if (!mp.isBlock) {
            nutriData.successCount += 1;
          } else {
            nutriData.pendingCount += 1;
          }
        });

        const nutriStats = Array.from(nutriMap.values()).map((nutri) => ({
          ...nutri,
          mealPlanCount: nutri.mealPlans.length,
        }));

        setNutritionists(nutriStats);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load finance data");
      setNutritionists([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleViewDetails = (nutri) => {
    setSelectedNutri(nutri);
    setDetailsModalOpen(true);
  };

  const handleCalculateSalary = (nutri) => {
    setSelectedNutri(nutri);
    setSalaryModalOpen(true);
  };

  const handleViewHistory = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/payment/salary-history/all",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setSalaryHistory(data.data);
        setHistoryModalOpen(true);
      } else {
        toast.error("Failed to fetch salary history");
      }
    } catch (err) {
      toast.error("Error fetching salary history: " + err.message);
    }
  };

  const handleAcceptSalary = async () => {
    if (!selectedNutri) return;
    try {
      const salary = calculateSalary(selectedNutri);
      const emailResult = await mealPlanService.sendSalaryEmail(
        selectedNutri.id
      );
      if (emailResult.success) {
        const paymentResponse = await fetch(
          "http://localhost:8080/api/v1/payment/vnpay/salary",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              nutriId: selectedNutri.id,
              amount: salary,
            }),
          }
        );
        const paymentData = await paymentResponse.json();
        if (paymentData.status === "success") {
          toast.success(
            "Salary confirmed, email sent, and payment URL generated!"
          );
          window.open(paymentData.paymentUrl, "_blank");
        } else {
          toast.error("Failed to generate payment URL: " + paymentData.message);
        }
        setSalaryModalOpen(false);
      }
    } catch (err) {
      toast.error("Error processing salary: " + err.message);
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
      ? price.toLocaleString("vi-VN") + " VND"
      : "N/A";
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Finance Management Report",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: `Generated on: ${new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "2-digit",
                year: "numeric",
              })}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: "Nutritionists Overview",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            ...nutritionists
              .map((nutri, index) => {
                const salary = calculateSalary(nutri);
                return [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `No. ${currentPage * limit + index + 1}`,
                        bold: true,
                      }),
                      new TextRun({
                        text: `\nNutritionist: ${nutri.name}`,
                        break: 1,
                      }),
                      new TextRun({
                        text: `\nMeal Plans: ${nutri.mealPlanCount}`,
                        break: 1,
                      }),
                      new TextRun({
                        text: `\nSuccess: ${nutri.successCount}`,
                        break: 1,
                      }),
                      new TextRun({
                        text: `\nPending: ${nutri.pendingCount}`,
                        break: 1,
                      }),
                      new TextRun({
                        text: `\nBase Salary: ${formatPrice(5000000)}`,
                        break: 1,
                      }),
                      new TextRun({
                        text: `\nCommission: ${formatPrice(
                          nutri.mealPlans
                            .filter((mp) => !mp.isBlock)
                            .reduce((sum, mp) => sum + (mp.price || 0) * 0.1, 0)
                        )}`,
                        break: 1,
                      }),
                      new TextRun({
                        text: `\nTotal Salary: ${formatPrice(salary)}`,
                        break: 1,
                        bold: true,
                      }),
                    ],
                    spacing: { after: 200, before: 400 },
                  }),
                  new Paragraph({
                    text: `Meal Plans Details for ${nutri.name}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 100 },
                  }),
                  ...nutri.mealPlans.map((mp, idx) => {
                    return new Paragraph({
                      children: [
                        new TextRun(`No. ${idx + 1}`),
                        new TextRun({
                          text: `\nTitle: ${mp.title || "N/A"}`,
                          break: 1,
                        }),
                        new TextRun({
                          text: `\nPrice: ${formatPrice(mp.price)}`,
                          break: 1,
                        }),
                        new TextRun({
                          text: `\nStart Date: ${new Date(
                            mp.startDate
                          ).toLocaleDateString("en-US")}`,
                          break: 1,
                        }),
                        new TextRun({
                          text: `\nDuration: ${mp.duration} days`,
                          break: 1,
                        }),
                        new TextRun({
                          text: `\nStatus: ${
                            !mp.isBlock ? "Success" : "Pending"
                          }`,
                          break: 1,
                        }),
                        new TextRun({
                          text: `\nUser: ${mp.userId?.username || "Unknown"}`,
                          break: 1,
                        }),
                      ],
                      spacing: { after: 150 },
                    });
                  }),
                  new Paragraph({
                    text: `Salary Payment History for ${nutri.name}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: "Note: Payment history requires separate API call per nutritionist",
                    spacing: { after: 150 },
                  }),
                ];
              })
              .flat(),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Total Nutritionists: ${nutritionists.length}`,
                  bold: true,
                }),
              ],
              spacing: { before: 200 },
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Finance_Management_Report.docx");
    });
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
        <div className="space-x-4">
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
          <div className="grid grid-cols-6 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
            <div>No.</div>
            <div>Nutritionist</div>
            <div>Mealplan</div>
            <div>Success</div>
            <div>Pending</div>
            <div>Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {nutritionists.length > 0 ? (
              nutritionists.map((nutri, index) => (
                <div
                  key={nutri.id}
                  className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50"
                >
                  <div>{currentPage * limit + index + 1}</div>
                  <div>{nutri.name}</div>
                  <div>{nutri.mealPlanCount}</div>
                  <div>{nutri.successCount}</div>
                  <div>{nutri.pendingCount}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(nutri)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EyeIcon size={20} />
                    </button>
                    <button
                      onClick={() => handleCalculateSalary(nutri)}
                      className="bg-[#40B491] text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Calculate Salary
                    </button>
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
              totalItems={nutritionists.length}
              handlePageClick={handlePageClick}
              currentPage={currentPage}
              text={"Nutritionists"}
            />
          </div>
        </div>
      </Loading>

      <Modal
        isOpen={detailsModalOpen}
        onRequestClose={() => setDetailsModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >
        {selectedNutri && (
          <>
            <h2 className="text-2xl font-bold text-[#40B491] mb-4">
              Meal Plans for {selectedNutri.name}
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
            <button
              onClick={() => setDetailsModalOpen(false)}
              className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </>
        )}
      </Modal>

      <Modal
        isOpen={salaryModalOpen}
        onRequestClose={() => setSalaryModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >
        {selectedNutri && (
          <>
            <h2 className="text-2xl font-bold text-[#40B491] mb-4">
              Salary for {selectedNutri.name}
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
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleAcceptSalary}
                className="bg-[#40B491] text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Accept & Process Payment
              </button>
              <button
                onClick={() => setSalaryModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={historyModalOpen}
        onRequestClose={() => setHistoryModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >
        <>
          <h2 className="text-2xl font-bold text-[#40B491] mb-4">
            Salary Payment History for Nutritionists
          </h2>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
              <div>No.</div>
              <div>Nutritionist</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Date</div>
              <div>Transaction ID</div>
            </div>
            {salaryHistory.map((payment, idx) => (
              <div
                key={payment._id}
                className="grid grid-cols-6 gap-4 p-4 border-b"
              >
                <div>{idx + 1}</div>
                <div>
                  {nutritionists.find((n) => n.id === payment.userId)?.name ||
                    "Unknown"}
                </div>
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
                <div>{payment.transactionNo || "N/A"}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setHistoryModalOpen(false)}
            className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </>
      </Modal>
    </div>
  );
};

export default FinanceManagement;
