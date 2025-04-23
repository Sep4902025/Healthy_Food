import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";
import { EditIcon, TrashIcon } from "lucide-react";

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, mealPlanTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the meal plan <strong>{mealPlanTitle}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TableMealPlan = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [filteredMealPlans, setFilteredMealPlans] = useState([]);
  const [summary, setSummary] = useState({
    totalMealPlans: 0,
    unpaidMealPlans: 0,
    activeMealPlans: 0,
  });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for ReactPaginate
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // Items per page
  const [totalItems, setTotalItems] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState("All"); // Tab hiện tại
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMealPlanId, setDeleteMealPlanId] = useState(null);
  const [deleteMealPlanTitle, setDeleteMealPlanTitle] = useState("");

  // Fetch meal plans
  const fetchMealPlans = async (callback) => {
    setIsTransitioning(true);
    try {
      const response = await mealPlanService.getAllMealPlanNutritionistCreatedBy(
        currentPage + 1,
        limit
      ); // 1-based for API
      console.log("API Response:", response);

      if (response.success) {
        const mealPlanData = response.data.mealPlans || [];
        const summaryData = response.data.summary || {
          totalMealPlans: response.total || mealPlanData.length,
          unpaidMealPlans: 0,
          activeMealPlans: 0,
        };
        setMealPlans(mealPlanData);
        setSummary(summaryData);
        setTotalItems(response.total || mealPlanData.length);
        setTotalPages(
          response.totalPages || Math.ceil((response.total || mealPlanData.length) / limit)
        );
        console.log("Meal Plans Set:", mealPlanData); // Log để kiểm tra dữ liệu
        if (callback) callback(response);
      } else {
        setError(response.message || "Failed to fetch meal plans");
        setMealPlans([]);
        setSummary({ totalMealPlans: 0, unpaidMealPlans: 0, activeMealPlans: 0 });
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An unexpected error occurred while loading meal plans");
      setMealPlans([]);
      setSummary({ totalMealPlans: 0, unpaidMealPlans: 0, activeMealPlans: 0 });
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [currentPage, limit]);

  // Filter meal plans based on active tab
  useEffect(() => {
    const currentDate = new Date();
    const filtered = mealPlans.filter((mealPlan) => {
      const startDate = new Date(mealPlan.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + mealPlan.duration);

      const isUnpaid = !mealPlan.paymentId;
      const isExpired = currentDate > endDate;
      const isPaused = mealPlan.isPause;
      const isBlocked = mealPlan.isBlock;
      const isActive = mealPlan.paymentId && !isExpired && !isPaused && !isBlocked;

      switch (activeTab) {
        case "All":
          return true;
        case "Unpaid":
          return isUnpaid;
        case "Active":
          return isActive;
        case "Expired":
          return isExpired;
        case "Paused":
          return isPaused;
        default:
          return true;
      }
    });
    setFilteredMealPlans(filtered);
    console.log("Filtered Meal Plans:", filtered); // Log để kiểm tra dữ liệu lọc
  }, [mealPlans, activeTab]);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected); // 0-based from ReactPaginate
  };

  // Handle edit
  const handleEdit = (id) => {
    navigate(`/nutritionist/mealplan/edit/${id}`);
  };

  // Handle delete
  const handleDelete = async (id, title) => {
    setDeleteMealPlanId(id);
    setDeleteMealPlanTitle(title);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDeleteMealPlan = async () => {
    try {
      const response = await mealPlanService.deleteMealPlan(deleteMealPlanId);
      if (response.success) {
        fetchMealPlans((result) => {
          const totalItemsAfterDelete = result.total || result.data.mealPlans.length;
          const newTotalPages = Math.ceil(totalItemsAfterDelete / limit) || 1;
          if (result.data.mealPlans.length === 0 && currentPage > 0) {
            setCurrentPage(currentPage - 1);
          } else if (currentPage >= newTotalPages) {
            setCurrentPage(newTotalPages - 1);
          }
        });
        alert(`Meal plan "${deleteMealPlanTitle}" deleted successfully`);
      } else {
        alert("Failed to delete meal plan");
      }
    } catch (error) {
      alert("Error deleting meal plan");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteMealPlanId(null);
      setDeleteMealPlanTitle("");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine status
  const getStatus = (mealPlan) => {
    const startDate = new Date(mealPlan.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + mealPlan.duration);
    const currentDate = new Date();

    if (mealPlan.isPause) return { label: "Paused", className: "bg-yellow-100 text-yellow-800" };
    if (currentDate > endDate) return { label: "Expired", className: "bg-red-100 text-red-800" };
    if (mealPlan.paymentId && !mealPlan.isBlock && !mealPlan.isPause)
      return { label: "Active", className: "bg-[#40B491] text-white" };
    return { label: "Unpaid", className: "bg-gray-100 text-gray-800" };
  };

  // Determine payment status
  const getPaymentStatus = (mealPlan) => {
    return mealPlan.paymentId
      ? { label: "Paid", className: "bg-green-100 text-green-800" }
      : { label: "Unpaid", className: "bg-yellow-100 text-yellow-800" };
  };

  if (isTransitioning) {
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">Meal Plans</h1>
        <button
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
          onClick={() => navigate("/nutritionist/mealplan/create")}
        >
          + Add New
        </button>
      </div>

      {/* Summary Section */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-[#40B491] text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Total Meal Plans</h3>
          <p className="text-2xl">{summary.totalMealPlans}</p>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Unpaid Meal Plans</h3>
          <p className="text-2xl">{summary.unpaidMealPlans}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Active Meal Plans</h3>
          <p className="text-2xl">{summary.activeMealPlans}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex space-x-2">
        {["All", "Unpaid", "Active", "Expired", "Paused"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === tab
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Container */}
      <Loading isLoading={isTransitioning}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-x-auto">
          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            {/* Table Header */}
            <thead className="bg-[#40B491] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[5%]">No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[5%]">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[12%]">Start Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[8%]">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[8%]">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[10%]">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[10%]">Created For</th>
                <th className="px-4 py-3 text-center text-sm font-semibold w-[10%]">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold w-[8%]">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold w-[10%]">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {filteredMealPlans.length > 0 ? (
                filteredMealPlans.map((mealPlan, index) => {
                  const paymentStatus = getPaymentStatus(mealPlan);
                  const status = getStatus(mealPlan);
                  return (
                    <tr
                      key={mealPlan._id}
                      className={`hover:bg-gray-50 transition-opacity duration-300 ${
                        isTransitioning ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-600 text-sm font-medium w-[5%]">
                        {currentPage * limit + index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 w-[5%]">
                        <p className="text-sm truncate"> {mealPlan.title}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm whitespace-nowrap w-[12%]">
                        {formatDate(mealPlan.startDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm w-[8%]">
                        {mealPlan.duration} days
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm w-[8%]">
                        {mealPlan.type === "fixed" ? "Fixed" : "Custom"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm w-[10%]">
                        {mealPlan.price ? `${mealPlan.price.toLocaleString()} ₫` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm w-[10%] h-full">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              mealPlan.userId?.avatarUrl ||
                              "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
                            }
                            alt="Avatar"
                            className="w-8 h-8 rounded-full mr-2 flex-shrink-0 object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg";
                            }}
                          />
                          <p className="truncate">
                            {mealPlan.userId?.username || mealPlan.userId?.email || "Unknown User"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center w-[10%]">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.className}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center w-[8%]">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center w-[10%]">
                        <div className="flex justify-center space-x-3">
                          <button
                            className="p-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                            onClick={() => handleEdit(mealPlan._id)}
                            title="Edit"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            onClick={() => handleDelete(mealPlan._id, mealPlan.title)}
                            title="Delete"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-500">
                    No meal plans found for this status.{" "}
                    <button
                      onClick={() => navigate("/nutritionist/mealplan/create")}
                      className="text-[#40B491] hover:text-[#359c7a] underline"
                    >
                      Create a new meal plan
                    </button>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="p-4 bg-gray-50">
              <Pagination
                limit={limit}
                setLimit={setLimit}
                totalItems={totalItems}
                handlePageClick={handlePageClick}
                currentPage={currentPage}
                text="Meal Plans"
              />
            </div>
          )}
        </div>
      </Loading>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteMealPlanId(null);
          setDeleteMealPlanTitle("");
        }}
        onConfirm={confirmDeleteMealPlan}
        mealPlanTitle={deleteMealPlanTitle}
      />
    </div>
  );
};

export default TableMealPlan;