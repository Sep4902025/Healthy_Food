import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import medicalConditionService from "../../services/nutritionist/medicalConditionServices";
import dishesService from "../../services/nutritionist/dishesServices";
import { toast } from "react-toastify";
import { selectAuth } from "../../store/selectors/authSelectors";

// Modal để hiển thị chi tiết điều kiện y tế
const MedicalDetailModal = ({ isOpen, onClose, condition, loading }) => {
  const navigate = useNavigate();

  if (!isOpen || !condition) return null;

  const handleFoodClick = (foodId) => {
    navigate(`/dishes/${foodId}`); // Điều hướng đến trang chi tiết món ăn
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        {loading ? (
          <p className="text-center text-gray-600">Loading details...</p>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{condition.name}</h2>
            <p className="text-gray-600 mb-6">{condition.description || "No description available."}</p>

            {/* Recommended Foods */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Recommended Foods:</h3>
              {condition.recommendedFoods && condition.recommendedFoods.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {condition.recommendedFoods.map((food, index) => (
                    <div
                      key={food._id || index}
                      className="flex flex-col items-center cursor-pointer hover:opacity-80 transition duration-200"
                      onClick={() => handleFoodClick(food._id)}
                    >
                      <img
                        src={food.imageUrl || "https://via.placeholder.com/100"}
                        alt={food.name || "Unknown food"}
                        className="w-20 h-20 rounded-full object-cover mb-2"
                      />
                      <p className="text-gray-700 text-sm text-center">{food.name || "Unknown food"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No recommended foods specified for this condition.</p>
              )}
            </div>

            {/* Restricted Foods */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Restricted Foods:</h3>
              {condition.foodsToAvoid && condition.foodsToAvoid.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {condition.foodsToAvoid.map((food, index) => (
                    <div
                      key={food._id || index}
                      className="flex flex-col items-center cursor-pointer hover:opacity-80 transition duration-200"
                      onClick={() => handleFoodClick(food._id)}
                    >
                      <img
                        src={food.imageUrl || "https://via.placeholder.com/100"}
                        alt={food.name || "Unknown food"}
                        className="w-20 h-20 rounded-full object-cover mb-2"
                      />
                      <p className="text-gray-700 text-sm text-center">{food.name || "Unknown food"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No restricted foods specified for this condition.</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Medical = () => {
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const user = auth?.user;
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const limit = 8;

  // Fetch danh sách điều kiện y tế
  const fetchMedicalConditions = async (page) => {
    setLoading(true);
    try {
      const response = await medicalConditionService.getAllMedicalConditions(page, limit);
      console.log("API Response:", response);
      if (response.success) {
        setMedicalConditions(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        toast.error(response.message || "Failed to load medical conditions!");
      }
    } catch (error) {
      console.error("Error fetching medical conditions:", error);
      toast.error("Error loading medical conditions!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch chi tiết điều kiện y tế và thông tin món ăn
  const fetchMedicalConditionDetails = async (id) => {
    if (!id) {
      toast.error("Invalid medical condition ID!");
      return;
    }

    setModalLoading(true);
    setModalOpen(true);
    try {
      const response = await medicalConditionService.getMedicalConditionById(id);
      if (!response.success) {
        toast.error(response.message || "Failed to load condition details!");
        setModalOpen(false);
        return;
      }

      const condition = response.data;
      console.log("Condition Data:", condition);
      console.log("Recommended Foods IDs:", condition.recommendedFoods);
      // Kiểm tra cả foodsToAvoid và restrictedFoods để xử lý không nhất quán
      const restrictedFoodsField = condition.foodsToAvoid || condition.restrictedFoods;
      console.log("Restricted Foods Field (foodsToAvoid or restrictedFoods):", restrictedFoodsField);

      const fetchFoodDetails = async (foodId) => {
        try {
          const foodResponse = await dishesService.getDishById(foodId);
          return foodResponse.success ? foodResponse.data : null;
        } catch (error) {
          console.error(`Error fetching dish ${foodId}:`, error);
          return null;
        }
      };

      const recommendedFoods = condition.recommendedFoods && Array.isArray(condition.recommendedFoods)
        ? (await Promise.all(condition.recommendedFoods.map(fetchFoodDetails))).filter(food => food !== null)
        : [];
      console.log("Fetched Recommended Foods:", recommendedFoods);

      const foodsToAvoid = Array.isArray(restrictedFoodsField)
        ? (await Promise.all(restrictedFoodsField.map(fetchFoodDetails))).filter(food => food !== null)
        : [];
      console.log("Fetched Foods to Avoid:", foodsToAvoid);

      setSelectedCondition({ ...condition, recommendedFoods, foodsToAvoid });
    } catch (error) {
      console.error("Error fetching condition details:", error);
      toast.error("Error loading medical condition details!");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view medical conditions!");
      navigate("/signin");
      return;
    }

    fetchMedicalConditions(currentPage);
  }, [currentPage, user, navigate]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-600">Loading medical conditions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-[#40B491] to-[#2e8b6e] text-white py-8 px-6 rounded-xl mb-12 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Syne'] text-center">
            Medical Conditions
          </h1>
          <p className="text-lg md:text-xl mt-4 text-center max-w-2xl mx-auto">
            Explore medical conditions and suitable dietary recommendations.
          </p>
        </div>
      </section>

      {/* Medical Conditions List */}
      <section className="container mx-auto">
        {medicalConditions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {medicalConditions.map((condition) => (
              <div
                key={condition._id}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition duration-300"
                onClick={() => fetchMedicalConditionDetails(condition._id)}
              >
                
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 font-['Inter'] mb-2">
                    {condition.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-['Inter'] line-clamp-2">
                    {condition.description || "No description available."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No medical conditions found.
          </p>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                currentPage === index + 1
                  ? "bg-[#40B491] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition duration-200`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal chi tiết điều kiện y tế */}
      <MedicalDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        condition={selectedCondition}
        loading={modalLoading}
      />
    </div>
  );
};

export default Medical;