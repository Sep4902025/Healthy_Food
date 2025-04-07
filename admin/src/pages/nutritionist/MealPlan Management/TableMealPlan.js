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
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(6); // Khớp với giao diện (6 bản ghi/trang)
  const [totalItems, setTotalItems] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchMealPlans = async () => {
    setIsTransitioning(true);
    try {
      const apiPage = currentPage + 1; // Convert to 1-based for API
      console.log("Fetching page:", apiPage, "with limit:", limit);
      const response = await mealPlanService.getAllMealPlans(apiPage, limit);
      console.log("API Response:", response);

      if (response.success) {
        const mealPlanData = Array.isArray(response.data) ? response.data : [];
        setMealPlans(mealPlanData);
        setTotalItems(response.total || mealPlanData.length); // Đảm bảo totalItems đúng
        setTotalPages(
          response.totalPages || Math.ceil((response.total || mealPlanData.length) / limit)
        );
      } else {
        setError(response.message || "Failed to fetch meal plans");
        setMealPlans([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An unexpected error occurred while loading meal plans");
      setMealPlans([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [currentPage, limit]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleEdit = (id) => {
    navigate(`/nutritionist/mealplan/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meal plan?")) {
      try {
        const response = await mealPlanService.deleteMealPlan(id);
        if (response.success) {
          const totalItemsAfterDelete = totalItems - 1;
          const newTotalPages = Math.ceil(totalItemsAfterDelete / limit) || 1;
          if (mealPlans.length === 1 && currentPage > 0) {
            setCurrentPage(currentPage - 1);
          } else if (currentPage >= newTotalPages) {
            setCurrentPage(newTotalPages - 1);
          } else {
            fetchMealPlans();
          }
          setTotalItems(totalItemsAfterDelete);
          setTotalPages(newTotalPages);
        } else {
          alert("Failed to delete meal plan");
        }
      } catch (error) {
        alert("Error deleting meal plan");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">Meal Plans</h1>
        <button
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
          onClick={() => navigate("/nutritionist/mealplan/create")}
        >
          + Add New
        </button>
      </div>

      <Loading isLoading={isTransitioning}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
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

          <div className="divide-y divide-gray-200">
            {mealPlans.length > 0 ? (
              mealPlans.map((mealPlan, index) => {
                const expired = isExpired(mealPlan.startDate, mealPlan.duration);
                return (
                  <div
                    key={mealPlan._id}
                    className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 ${
                      isTransitioning ? "opacity-0" : "opacity-100"
                    }`}
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
    </div>
  );
};

export default TableMealPlan;