import React, { useEffect, useState, useCallback, memo } from "react";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";
import dishService from "../../../services/nutritionist/dishesServices";
import recipesService from "../../../services/nutritionist/recipesServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading";
import Pagination from "../../../components/Pagination";
import { Flame, Dumbbell, Wheat, Droplet } from "lucide-react";

// Debounce function to delay search
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// SearchInput Component
const SearchInput = memo(({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search by dish name"
      className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
      value={value}
      onChange={onChange}
    />
  );
});

// Dish type options
const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];

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
      setDishes(dishesData); // Store raw dishes; enrichment happens in modal
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setDishes([]);
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.nutritionalConstraints) {
      let constrainedValue = value;
      if (value !== "" && !isNaN(value)) {
        constrainedValue = Math.min(Number(value), 10000).toString();
      }
      setFormData({
        ...formData,
        nutritionalConstraints: {
          ...formData.nutritionalConstraints,
          [name]: constrainedValue,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(formData.name)) {
      newErrors.name = "Input must not contain special characters.";
    }
    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(formData.description)) {
      newErrors.description = "Input must not contain special characters.";
    }
    if (formData.restrictedFoods.length === 0)
      newErrors.restrictedFoods = "At least one restricted food is required";
    if (formData.recommendedFoods.length === 0)
      newErrors.recommendedFoods = "At least one recommended food is required";
    if (formData.restrictedFoods.some((food) => formData.recommendedFoods.includes(food))) {
      newErrors.foodConflict = "A dish cannot be both restricted and recommended!";
    }

    ["carbs", "fat", "protein", "calories"].forEach((field) => {
      const value = formData.nutritionalConstraints[field];
      if (value === "" || value === null || value === undefined) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (isNaN(value) || Number(value) < 0) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be a positive number`;
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
      console.error("Error creating medical condition:", error);
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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter condition name"
                  className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isSubmitting}
                />
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
                  className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isSubmitting}
                />
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
                      className={`w-full border ${errors.calories ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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
                      className={`w-full border ${errors.protein ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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
                      className={`w-full border ${errors.carbs ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      disabled={isSubmitting}
                    />
                    {errors.carbs && <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>}
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
                      className={`w-full border ${errors.fat ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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
              className={`bg-[#40B491] text-white px-4 py-2 rounded-md hover:bg-[#359c7a] ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
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

// Updated FoodSelectionModal (from first snippet)
const FoodSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  availableDishes,
  selectedDishes,
  conflictingDishes,
  foodModalType,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [tempSelectedDishes, setTempSelectedDishes] = useState(selectedDishes || []);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit, setLimit] = useState(8);
  const [enrichedDishes, setEnrichedDishes] = useState([]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(0);
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(0);
  };

  // Fetch recipe data for dishes with recipeId
  useEffect(() => {
    const fetchRecipeData = async () => {
      const dishesWithRecipes = await Promise.all(
        availableDishes.map(async (dish) => {
          if (dish.recipeId && !dish.recipe) {
            try {
              const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
              if (recipeResponse.success) {
                return { ...dish, recipe: recipeResponse.data };
              }
            } catch (error) {
              console.error(`Failed to fetch recipe for dish ${dish._id}:`, error);
            }
          }
          return dish;
        })
      );
      setEnrichedDishes(dishesWithRecipes);
    };

    if (isOpen && availableDishes.length > 0) {
      fetchRecipeData();
    }
  }, [isOpen, availableDishes]);

  // Filter dishes based on searchTerm and filterType
  const filteredDishes = enrichedDishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || dish.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalItems = filteredDishes.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedDishes = filteredDishes.slice(
    currentPage * limit,
    (currentPage + 1) * limit
  );

  const handleDishClick = (dishId) => {
    if (conflictingDishes.includes(dishId)) return;
    const isSelected = tempSelectedDishes.includes(dishId);
    if (isSelected) {
      setTempSelectedDishes(tempSelectedDishes.filter((id) => id !== dishId));
    } else {
      setTempSelectedDishes([...tempSelectedDishes, dishId]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelectedDishes);
    setTempSelectedDishes([]);
    setSearchTerm("");
    setInputValue("");
    setFilterType("all");
    setCurrentPage(0);
    onClose();
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const isFavorite = (dishId) => false; // Placeholder; integrate with actual favorites if available

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-5xl h-[100vh] flex flex-col shadow-xl">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-[#40B491]">
            Select {foodModalType === "restricted" ? "Restricted" : "Recommended"} Dishes
          </h2>
          <div className="ml-auto flex space-x-3">
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${tempSelectedDishes.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={tempSelectedDishes.length === 0}
            >
              Confirm
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <SearchInput value={inputValue} onChange={handleInputChange} />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
            value={filterType}
            onChange={handleFilterChange}
          >
            <option value="all">All Types</option>
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedDishes.length > 0 ? (
              paginatedDishes.map((dish) => {
                const isConflicting = conflictingDishes.includes(dish._id);
                const isSelected = tempSelectedDishes.includes(dish._id);
                const dishFavorite = isFavorite(dish._id);
                const nutritionData = dish.recipe || {
                  totalCalories: "N/A",
                  totalProtein: "N/A",
                  totalCarbs: "N/A",
                  totalFat: "N/A",
                };

                return (
                  <div
                    key={dish._id}
                    className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer relative ${isSelected ? "border-[#40B491] border-2" : "border-gray-200"
                      } ${isConflicting ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !isConflicting && handleDishClick(dish._id)}
                  >
                    <div className="relative h-40 bg-gray-200">
                      {dish.imageUrl ? (
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <img
                            src="https://via.placeholder.com/150?text=No+Image"
                            alt="No image available"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {dishFavorite && (
                        <span className="absolute top-2 right-2 text-yellow-500 text-xl">⭐</span>
                      )}
                      {isConflicting && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white font-semibold">Added</span>
                        </div>
                      )}
                      {isSelected && !isConflicting && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-[#40B491] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">
                            Choice
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800">{dish.name}</h3>
                        <span className="text-sm font-bold text-blue-600">
                          {nutritionData.totalCalories}{" "}
                          {nutritionData.totalCalories !== "N/A" ? "kcal" : ""}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Protein:</span>
                          <span className="font-medium">
                            {nutritionData.totalProtein}{" "}
                            {nutritionData.totalProtein !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Fat:</span>
                          <span className="font-medium">
                            {nutritionData.totalFat}{" "}
                            {nutritionData.totalFat !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Carbs:</span>
                          <span className="font-medium">
                            {nutritionData.totalCarbs}{" "}
                            {nutritionData.totalCarbs !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  className="w-24 h-24 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-lg font-semibold">No dishes found</p>
                <p className="text-sm">Try adjusting your search term.</p>
              </div>
            )}
          </div>
        </div>

        {totalItems > 0 && (
          <div className="mt-6 p-4 bg-gray-50">
            <Pagination
              limit={limit}
              setLimit={setLimit}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              currentPage={currentPage}
              text="Dishes"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMedicalCondition;