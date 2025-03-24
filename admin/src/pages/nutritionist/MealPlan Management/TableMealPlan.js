import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";

const TableMealPlan = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  console.log("MLLL", mealPlans);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch meal plans
  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const response = await mealPlanService.getAllMealPlans(currentPage, limit);
      if (response.success) {
        setMealPlans(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      } else {
        setError(response.message);
        setMealPlans([]);
      }
    } catch (err) {
      setError("Error fetching meal plans");
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [currentPage, limit]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  // Handle edit
  const handleEdit = (id) => {
    navigate(`/nutritionist/mealplan/edit/${id}`);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meal plan?")) {
      try {
        const response = await mealPlanService.deleteMealPlan(id);
        if (response.success) {
          fetchMealPlans();
        } else {
          alert("Failed to delete meal plan");
        }
      } catch (error) {
        alert("Error deleting meal plan");
      }
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

  // Check if meal plan is expired
  const isExpired = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration);
    return new Date() > end; // Current date is past the end date
  };

  // Render table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
            Loading...
          </td>
        </tr>
      );
    }

    if (mealPlans.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
            No meal plans found.{" "}
            <button
              onClick={() => navigate("/nutritionist/mealplan/create")}
              className="text-green-500 hover:text-green-700 underline"
            >
              Create a new meal plan
            </button>
            .
          </td>
        </tr>
      );
    }

    return mealPlans.map((mealPlan) => {
      const expired = isExpired(mealPlan.startDate, mealPlan.duration);
      return (
        <tr key={mealPlan._id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {mealPlan.title}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDate(mealPlan.startDate)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {mealPlan.duration} days
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {mealPlan.type === "fixed" ? "Fixed" : "Custom"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {mealPlan.price ? `$${mealPlan.price}` : "N/A"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex items-center">
              <img
                src={
                  mealPlan.userId?.avatarUrl ||
                  "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{mealPlan.userId?.email || "Unknown"}</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                expired
                  ? "bg-red-100 text-red-800"
                  : mealPlan.isPause
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {expired ? "Expired" : mealPlan.isPause ? "Paused" : "Active"}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
            <button
              onClick={() => handleEdit(mealPlan._id)}
              className="text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              ✏️ {/* Pencil icon */}
            </button>
            <button
              onClick={() => handleDelete(mealPlan._id)}
              className="text-red-500 hover:text-red-700"
              title="Delete"
            >
              🗑️ {/* Trash icon */}
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-green-600">Meal Plans</h1>
        <button
          onClick={() => navigate("/nutritionist/mealplan/create")}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Create Meal Plan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created For
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{renderTableContent()}</tbody>
        </table>
      </div>

      {/* Pagination and Limit Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Showing {mealPlans.length} of {totalItems} meal plans
          </span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-1 rounded-md text-sm ${
              currentPage === 1 || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className={`px-3 py-1 rounded-md text-sm ${
              currentPage === totalPages || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableMealPlan;
