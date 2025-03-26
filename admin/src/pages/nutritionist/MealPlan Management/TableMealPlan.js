import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading"; // Import the new Loading component

const TableMealPlan = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false); // Track transition/loading state

  // Fetch meal plans
  const fetchMealPlans = async () => {
    setIsTransitioning(true); // Start transition/loading
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
      setIsTransitioning(false); // End transition/loading
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [currentPage, limit]);

  // Handle page change for Pagination component
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; // ReactPaginate uses 0-based index
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
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
    return new Date() > end;
  };

  // Render table content
  const renderTableContent = () => {
    // If there are no meal plans and we're not loading, show the "No meal plans" message
    if (mealPlans.length === 0 && !isTransitioning) {
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

    // Render the meal plans with a fade effect
    return mealPlans.map((mealPlan) => {
      const expired = isExpired(mealPlan.startDate, mealPlan.duration);
      return (
        <tr
          key={mealPlan._id}
          className={`hover:bg-gray-50 transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
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
              ✏️
            </button>
            <button
              onClick={() => handleDelete(mealPlan._id)}
              className="text-red-500 hover:text-red-700"
              title="Delete"
            >
              🗑️
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#40B491]">Meal Plans</h1>
        <button
          onClick={() => navigate("/nutritionist/mealplan/create")}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Create Meal Plan
        </button>
      </div>

      {/* Table wrapped in Loading component */}
      <Loading isLoading={isTransitioning}>
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
      </Loading>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          limit={limit}
          setLimit={setLimit}
          totalItems={totalItems}
          handlePageClick={handlePageClick}
          text={"Meal Plans"}
        />
      </div>
    </div>
  );
};

export default TableMealPlan;
