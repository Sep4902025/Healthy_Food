import React, { useEffect, useState } from "react";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";
import dishService from "../../../services/nutritionist/dishesServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading";
import Pagination from "../../../components/Pagination";
import { Flame, Dumbbell, Wheat, Droplet } from "lucide-react";
import FoodSelectionModal from "./FoodSelectionModal"; // Import the standalone FoodSelectionModal

const AddMedicalCondition = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    restrictedFoods: [],
    recommendedFoods: [],
    nutritionalConstraints: {
      carbs: "",
      fat: "",
      protein: "",
      calories: "",
    },
  });
  const [dishes, setDishes] = useState([]);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodModalType, setFoodModalType] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restrictedPage, setRestrictedPage] = useState(0);
  const [recommendedPage, setRecommendedPage] = useState(0);
  const [foodsPerPage, setFoodsPerPage] = useState(5);

  // Fetch all dishes when component mounts
  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      const dishesResponse = await dishService.getAllDishes(1, 1000);
      const dishesData =
        dishesResponse?.success && Array.isArray(dishesResponse.data.items)
          ? dishesResponse.data.items
          : [];
      setDishes(dishesData);
    } catch (error) {
      setDishes([]);
      toast.error("Failed to load dishes.");
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.nutritionalConstraints) {
      setFormData({
        ...formData,
        nutritionalConstraints: {
          ...formData.nutritionalConstraints,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(formData.name)) {
      newErrors.name = "Name must not contain special characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must not exceed 100 characters";
    }

    // Validate Description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(formData.description)) {
      newErrors.description = "Description must not contain special characters";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    // Validate Restricted and Recommended Foods
    if (formData.restrictedFoods.length === 0) {
      newErrors.restrictedFoods = "At least one restricted food is required";
    }
    if (formData.recommendedFoods.length === 0) {
      newErrors.recommendedFoods = "At least one recommended food is required";
    }
    if (formData.restrictedFoods.some((food) => formData.recommendedFoods.includes(food))) {
      newErrors.foodConflict = "A dish cannot be both restricted and recommended";
    }

    // Validate Nutritional Constraints
    ["carbs", "fat", "protein", "calories"].forEach((field) => {
      const value = formData.nutritionalConstraints[field];
      if (value === "" || value === null || value === undefined) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (isNaN(value) || Number(value) < 0) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be a positive number`;
      } else if (Number(value) > 10000) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must not exceed 10000`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly!");
      return;
    }

    setIsSubmitting(true);
    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      restrictedFoods: formData.restrictedFoods,
      recommendedFoods: formData.recommendedFoods,
      nutritionalConstraints: {
        carbs: Number(formData.nutritionalConstraints.carbs),
        fat: Number(formData.nutritionalConstraints.fat),
        protein: Number(formData.nutritionalConstraints.protein),
        calories: Number(formData.nutritionalConstraints.calories),
      },
    };

    try {
      const response = await medicalConditionService.createMedicalCondition(dataToSubmit);
      setIsSubmitting(false);
      if (response.success) {
        toast.success(`Medical condition "${formData.name}" has been created successfully!`);
        setFormData({
          name: "",
          description: "",
          restrictedFoods: [],
          recommendedFoods: [],
          nutritionalConstraints: { carbs: "", fat: "", protein: "", calories: "" },
        });
        navigate("/nutritionist/medicalConditions");
        setErrors({});
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error("An error occurred while creating the medical condition.");
    }
  };

  const handleOpenFoodModal = (type) => {
    setFoodModalType(type);
    setIsFoodModalOpen(true);
  };

  const handleFoodSelect = (selectedDishes) => {
    if (foodModalType === "restricted") {
      setFormData({ ...formData, restrictedFoods: selectedDishes });
    } else if (foodModalType === "recommended") {
      setFormData({ ...formData, recommendedFoods: selectedDishes });
    }
    setIsFoodModalOpen(false);
  };

  // Pagination for restrictedFoods
  const restrictedTotalItems = formData.restrictedFoods.length;
  const restrictedTotalPages = Math.ceil(restrictedTotalItems / foodsPerPage);
  const paginatedRestrictedFoods = formData.restrictedFoods.slice(
    restrictedPage * foodsPerPage,
    (restrictedPage + 1) * foodsPerPage
  );

  // Pagination for recommendedFoods
  const recommendedTotalItems = formData.recommendedFoods.length;
  const recommendedTotalPages = Math.ceil(recommendedTotalItems / foodsPerPage);
  const paginatedRecommendedFoods = formData.recommendedFoods.slice(
    recommendedPage * foodsPerPage,
    (recommendedPage + 1) * foodsPerPage
  );

  const handleRestrictedPageClick = ({ selected }) => {
    setRestrictedPage(selected);
  };

  const handleRecommendedPageClick = ({ selected }) => {
    setRecommendedPage(selected);
  };

  return (
    <div className="p-4">
      <Loading isLoading={isLoading || isSubmitting}>
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Create New Medical Condition
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter condition name"
                  className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isSubmitting}
                  maxLength={100}
                />
                {formData.name && (
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.name.length}/100 characters
                  </p>
                )}
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                {formData.description && (
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.description.length}/500 characters
                  </p>
                )}
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restricted Foods *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {paginatedRestrictedFoods.map((foodId) => {
                    const dish = dishes.find((d) => d._id === foodId);
                    return dish ? (
                      <div
                        key={foodId}
                        className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {dish.name}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              restrictedFoods: formData.restrictedFoods.filter(
                                (id) => id !== foodId
                              ),
                            })
                          }
                          className="ml-2 text-red-500 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          ✕
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                {restrictedTotalItems > foodsPerPage && (
                  <div className="mt-2">
                    <Pagination
                      limit={foodsPerPage}
                      setLimit={(newLimit) => {
                        setFoodsPerPage(newLimit);
                        setRestrictedPage(0);
                      }}
                      totalItems={restrictedTotalItems}
                      handlePageClick={handleRestrictedPageClick}
                      currentPage={restrictedPage}
                      text="Restricted Foods"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("restricted")}
                  className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a] w-full mt-2"
                  disabled={isSubmitting}
                >
                  Add Restricted Foods
                </button>
                {errors.restrictedFoods && (
                  <p className="text-red-500 text-sm mt-1">{errors.restrictedFoods}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommended Foods *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {paginatedRecommendedFoods.map((foodId) => {
                    const dish = dishes.find((d) => d._id === foodId);
                    return dish ? (
                      <div
                        key={foodId}
                        className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {dish.name}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              recommendedFoods: formData.recommendedFoods.filter(
                                (id) => id !== foodId
                              ),
                            })
                          }
                          className="ml-2 text-red-500 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          ✕
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                {recommendedTotalItems > foodsPerPage && (
                  <div className="mt-2">
                    <Pagination
                      limit={foodsPerPage}
                      setLimit={(newLimit) => {
                        setFoodsPerPage(newLimit);
                        setRecommendedPage(0);
                      }}
                      totalItems={recommendedTotalItems}
                      handlePageClick={handleRecommendedPageClick}
                      currentPage={recommendedPage}
                      text="Recommended Foods"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenFoodModal("recommended")}
                  className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a] w-full mt-2"
                  disabled={isSubmitting}
                >
                  Add Recommended Foods
                </button>
                {errors.recommendedFoods && (
                  <p className="text-red-500 text-sm mt-1">{errors.recommendedFoods}</p>
                )}
                {errors.foodConflict && (
                  <p className="text-red-500 text-sm mt-1">{errors.foodConflict}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nutritional Constraints (Max Values) *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Calories (kcal)</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.nutritionalConstraints.calories}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Max calories"
                      className={`w-full border ${errors.calories ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      disabled={isSubmitting}
                    />
                    {errors.calories && (
                      <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Protein (g)</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.nutritionalConstraints.protein}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Max protein"
                      className={`w-full border ${errors.protein ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      disabled={isSubmitting}
                    />
                    {errors.protein && (
                      <p className="text-red-500 text-sm mt-1">{errors.protein}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Carbs (g)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.nutritionalConstraints.carbs}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Max carbs"
                      className={`w-full border ${errors.carbs ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      disabled={isSubmitting}
                    />
                    {errors.carbs && (
                      <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.nutritionalConstraints.fat}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Max fat"
                      className={`w-full border ${errors.fat ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      disabled={isSubmitting}
                    />
                    {errors.fat && <p className="text-red-500 text-sm mt-1">{errors.fat}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className={`bg-[#40B491] text-white px-4 py-2 rounded-md hover:bg-[#359c7a] ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Medical Condition"}
            </button>
          </div>
        </form>
      </Loading>

      {isFoodModalOpen && (
        <FoodSelectionModal
          isOpen={isFoodModalOpen}
          onClose={() => setIsFoodModalOpen(false)}
          onSelect={handleFoodSelect}
          availableDishes={dishes}
          selectedDishes={
            foodModalType === "restricted" ? formData.restrictedFoods : formData.recommendedFoods
          }
          conflictingDishes={
            foodModalType === "restricted" ? formData.recommendedFoods : formData.restrictedFoods
          }
          foodModalType={foodModalType}
        />
      )}
    </div>
  );
};

export default AddMedicalCondition;