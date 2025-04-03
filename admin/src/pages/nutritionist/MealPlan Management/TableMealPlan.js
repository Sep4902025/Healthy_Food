import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";
import { EditIcon, TrashIcon } from "lucide-react";

const TableMealPlan = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for ReactPaginate
  const [limit, setLimit] = useState(6); // Default limit
  const [totalItems, setTotalItems] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch meal plans
  const fetchMealPlans = async (callback) => {
    setIsTransitioning(true);
    try {
      const response = await mealPlanService.getAllMealPlans(currentPage + 1, limit); // +1 for 1-based API
      console.log("Fetch Meal Plans Response:", response);
      if (response.success) {
        const data = response.data || [];
        // Fallback: Use data.length if total is 0 or missing
        const total = response.total || response.data?.total || data.length;
        console.log("Extracted Data:", data, "Total:", total);

        // Manually slice the data to enforce pagination
        const startIndex = currentPage * limit;
        const paginatedData = data.slice(startIndex, startIndex + limit);

        setMealPlans(paginatedData);
        setTotalItems(total);
        if (callback) callback(response);
      } else {
        setError(response.message || "Failed to fetch meal plans");
        setMealPlans([]);
        setTotalItems(0);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải dữ liệu");
      setMealPlans([]);
      setTotalItems(0);
      console.error("❌ Fetch Error:", err);
    } finally {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    console.log("Fetching meal plans with page:", currentPage, "limit:", limit);
    fetchMealPlans((result) => {
      const newTotalPages = Math.ceil(totalItems / limit) || 1;
      console.log("New Total Pages:", newTotalPages);
      if (currentPage >= newTotalPages) {
        setCurrentPage(newTotalPages - 1 >= 0 ? newTotalPages - 1 : 0);
      }
    });
  }, [currentPage, limit]);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    console.log("Changing to page:", selected);
    setCurrentPage(selected);
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
          fetchMealPlans((result) => {
            const totalItems = result.total || result.data?.total || result.data.length;
            const newTotalPages = Math.ceil(totalItems / limit) || 1;
            console.log("After Delete - Total Items:", totalItems, "New Total Pages:", newTotalPages);
            if (result.data.length === 0 && currentPage > 0) {
              setCurrentPage(currentPage - 1);
            } else if (currentPage >= newTotalPages) {
              setCurrentPage(newTotalPages - 1 >= 0 ? newTotalPages - 1 : 0);
            }
          });
        } else {
          alert("Failed to delete meal plan: " + response.message);
        }
      } catch (error) {
        alert("Error deleting meal plan");
        console.error("❌ Delete Error:", error);
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

  console.log("Current Page in Render:", currentPage, "Total Items:", totalItems, "Limit:", limit);
  console.log("Calculated Page Count:", Math.ceil(totalItems / limit));

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

      {/* Data Container */}
      <Loading isLoading={isTransitioning}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
            <div className="col-span-1">No.</div>
            <div className="col-span-2">Title</div>
            <div className="col-span-1">Start Date</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-2">Created For</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {mealPlans.length > 0 ? (
              mealPlans.map((mealPlan, index) => {
                const expired = isExpired(mealPlan.startDate, mealPlan.duration);
                return (
                  <div
                    key={mealPlan._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300"
                  >
                    <div className="col-span-1 text-gray-600 font-medium">
                      {currentPage * limit + index + 1}
                    </div>
                    <div className="col-span-2 text-gray-700 text-sm line-clamp-2">
                      {mealPlan.title}
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {formatDate(mealPlan.startDate)}
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">{mealPlan.duration} days</div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {mealPlan.type === "fixed" ? "Fixed" : "Custom"}
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {mealPlan.price ? `$${mealPlan.price}` : "N/A"}
                    </div>
                    <div className="col-span-2 text-gray-700 text-sm flex items-center">
                      <img
                        src={
                          mealPlan.userId?.avatarUrl ||
                          "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
                        }
                        alt="Avatar"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="line-clamp-1">{mealPlan.userId?.email || "Unknown"}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          expired
                            ? "bg-red-100 text-red-800"
                            : mealPlan.isPause
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-[#40B491] text-white"
                        }`}
                      >
                        {expired ? "Expired" : mealPlan.isPause ? "Paused" : "Active"}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center space-x-3">
                      <button
                        className="p-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                        onClick={() => handleEdit(mealPlan._id)}
                        title="Edit"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        onClick={() => handleDelete(mealPlan._id)}
                        title="Delete"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                No meal plans found.{" "}
                <button
                  onClick={() => navigate("/nutritionist/mealplan/create")}
                  className="text-[#40B491] hover:text-[#359c7a] underline"
                >
                  Create a new meal plan
                </button>
                .
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="p-4 bg-gray-50">
              <Pagination
                key={`${currentPage}-${totalItems}`} // Force re-render when currentPage or totalItems changes
                limit={limit}
                setLimit={(newLimit) => {
                  setLimit(newLimit);
                  setCurrentPage(0); // Reset to first page when limit changes
                }}
                totalItems={totalItems}
                handlePageClick={handlePageClick}
                currentPage={currentPage}
                text="Meal Plans"
              />
            </div>
          )}
        </div>
      </Loading>
    </div>
  );
};

export default TableMealPlan;