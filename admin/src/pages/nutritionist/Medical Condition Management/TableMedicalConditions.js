import React, { useEffect, useState, useCallback, memo } from "react";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";
import dishService from "../../../services/nutritionist/dishesServices";
import recipesService from "../../../services/nutritionist/recipesServices";
import { HeartPulse, Pencil, Trash2, Eye } from "lucide-react";
import FoodSelectionModal from "./FoodSelectionModal"; // Ensure correct import path
import Pagination from "../../../components/Pagination";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Debounce function
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
      placeholder="Search by condition name"
      className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
      value={value}
      onChange={onChange}
    />
  );
});

// ConditionList Component (unchanged for brevity)
const ConditionList = memo(
  ({ conditions, onEdit, onView, onDelete }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {conditions.length > 0 ? (
        conditions.map((condition) => (
          <div
            key={condition._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg h-[170px]"
          >
            <div className="p-4 h-[120px] flex flex-col justify-between">
              <h3 className="text-lg font-semibold text-center text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {condition.name}
              </h3>
              <p className="text-sm text-gray-600 mt-2 text-center line-clamp-2 h-[40px]">
                {condition.description}
              </p>
            </div>
            <div className="flex justify-center items-center p-2 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => onView(condition)}
                className="text-[#40B491] flex items-center px-2 py-1 hover:text-[#359c7a] transition"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <div className="h-4 border-l border-gray-300 mx-2"></div>
              <button
                onClick={() => onEdit(condition)}
                className="text-[#40B491] flex items-center px-2 py-1 hover:text-[#359c7a] transition"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </button>
              <div className="h-4 border-l border-gray-300 mx-2"></div>
              <button
                onClick={() => onDelete(condition._id)}
                className="text-red-500 flex items-center px-2 py-1 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
          <HeartPulse className="w-24 h-24 text-gray-400 mb-4" />
          <p className="text-lg font-semibold">No medical conditions</p>
          <p className="text-sm">Looks like you haven't added any medical conditions yet.</p>
        </div>
      )}
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.conditions === nextProps.conditions &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onView === nextProps.onView &&
    prevProps.onDelete === nextProps.onDelete
);

const TableMedicalConditions = () => {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    restrictedFoods: [],
    recommendedFoods: [],
    nutritionalConstraints: { carbs: "", fat: "", protein: "", calories: "" },
  });
  const [viewData, setViewData] = useState(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodModalType, setFoodModalType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [restrictedPage, setRestrictedPage] = useState(0);
  const [recommendedPage, setRecommendedPage] = useState(0);
  const [foodsPerPage, setFoodsPerPage] = useState(5);

  // Fetch conditions and dishes (unchanged)
  const fetchConditions = async () => {
    try {
      const response = searchTerm
        ? await medicalConditionService.searchMedicalConditionByName(searchTerm, currentPage + 1, itemsPerPage)
        : await medicalConditionService.getAllMedicalConditions(currentPage + 1, itemsPerPage);

      if (response?.success) {
        const formattedConditions = response.data.items.map((condition) => ({
          ...condition,
          restrictedFoods: condition.restrictedFoods.map((food) =>
            typeof food === "object" && food._id ? food._id : food.toString()
          ),
          recommendedFoods: condition.recommendedFoods.map((food) =>
            typeof food === "object" && food._id ? food._id : food.toString()
          ),
        }));
        setConditions(formattedConditions || []);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setConditions([]);
        setTotalItems(0);
        setTotalPages(1);
        toast.error("Failed to fetch medical conditions: " + response?.message);
      }
    } catch (error) {
      setConditions([]);
      setTotalItems(0);
      setTotalPages(1);
      toast.error("Error fetching conditions: " + error.message);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await dishService.getAllDishes(1, 1000);
      if (response?.success) {
        const dishesData = Array.isArray(response.data.items) ? response.data.items : [];
        const enrichedDishes = await Promise.all(
          dishesData.map(async (dish) => {
            if (dish.recipeId) {
              try {
                const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
                if (recipeResponse.success && recipeResponse.data?.status === "success") {
                  const recipe = recipeResponse.data.data;
                  const nutritions = calculateNutritionFromRecipe(recipe);
                  return { ...dish, nutritions };
                }
              } catch (error) {
                console.error(`Error fetching recipe for dish ${dish._id}:`, error);
              }
            }
            return {
              ...dish,
              nutritions: { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" },
            };
          })
        );
        setDishes(enrichedDishes);
      } else {
        setDishes([]);
        toast.error("Failed to fetch dishes: " + response?.message);
      }
    } catch (error) {
      setDishes([]);
      toast.error("Error fetching dishes: " + error.message);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(0);
    }, 500),
    []
  );

  useEffect(() => {
    fetchConditions();
    fetchDishes();
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const calculateNutritionFromRecipe = (recipe) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing) => {
        const ingredient = ing.ingredientId;
        if (ingredient && ing.quantity && ing.unit) {
          let conversionFactor;
          if (ing.unit === "g" || ing.unit === "ml") {
            conversionFactor = ing.quantity / 100;
          } else if (ing.unit === "tbsp") {
            conversionFactor = (ing.quantity * 15) / 100;
          } else if (ing.unit === "tsp" || ing.unit === "tp") {
            conversionFactor = (ing.quantity * 5) / 100;
          } else {
            conversionFactor = ing.quantity / 100;
          }
          totalCalories += (ingredient.calories || 0) * conversionFactor;
          totalProtein += (ingredient.protein || 0) * conversionFactor;
          totalFat += (ingredient.fat || 0) * conversionFactor;
          totalCarbs += (ingredient.carbs || 0) * conversionFactor;
        }
      });
    }

    return {
      calories: totalCalories.toFixed(2),
      protein: totalProtein.toFixed(2),
      carbs: totalCarbs.toFixed(2),
      fat: totalFat.toFixed(2),
    };
  };

  const handleEditClick = (condition) => {
    const normalizedRestrictedFoods = condition.restrictedFoods.map((food) =>
      typeof food === "object" && food._id ? food._id : food.toString()
    );
    const normalizedRecommendedFoods = condition.recommendedFoods.map((food) =>
      typeof food === "object" && food._id ? food._id : food.toString()
    );

    setEditData({
      id: condition._id,
      name: condition.name || "",
      description: condition.description || "",
      restrictedFoods: normalizedRestrictedFoods || [],
      recommendedFoods: normalizedRecommendedFoods || [],
      nutritionalConstraints: {
        carbs: condition.nutritionalConstraints?.carbs || "",
        fat: condition.nutritionalConstraints?.fat || "",
        protein: condition.nutritionalConstraints?.protein || "",
        calories: condition.nutritionalConstraints?.calories || "",
      },
    });
    setErrors({});
    setRestrictedPage(0);
    setRecommendedPage(0);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (condition) => {
    const normalizedRestrictedFoods = condition.restrictedFoods.map((food) =>
      typeof food === "object" && food._id ? food._id : food.toString()
    );
    const normalizedRecommendedFoods = condition.recommendedFoods.map((food) =>
      typeof food === "object" && food._id ? food._id : food.toString()
    );

    setViewData({
      ...condition,
      restrictedFoods: normalizedRestrictedFoods,
      recommendedFoods: normalizedRecommendedFoods,
    });
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medical condition?")) {
      const response = await medicalConditionService.deleteMedicalCondition(id);
      if (response.success) {
        toast.success("Deleted successfully!");
        fetchConditions();
        if (conditions.length === 1 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error("Failed to delete medical condition: " + response.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in editData.nutritionalConstraints) {
      let constrainedValue = value;
      if (value !== "" && !isNaN(value)) {
        constrainedValue = Math.min(Number(value), 10000).toString();
      }
      setEditData({
        ...editData,
        nutritionalConstraints: {
          ...editData.nutritionalConstraints,
          [name]: constrainedValue,
        },
      });
    } else {
      setEditData({ ...editData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name.trim()) newErrors.name = "Name is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(editData.name)) {
      newErrors.name = "Input must not contain special characters.";
    }
    if (!editData.description.trim()) newErrors.description = "Description is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():;\-\/]/i.test(editData.description)) {
      newErrors.description = "Input must not contain special characters.";
    }
    if (editData.restrictedFoods.length === 0)
      newErrors.restrictedFoods = "At least one restricted food is required";
    if (editData.recommendedFoods.length === 0)
      newErrors.recommendedFoods = "At least one recommended food is required";
    if (editData.restrictedFoods.some((food) => editData.recommendedFoods.includes(food))) {
      newErrors.foodConflict = "A dish cannot be both restricted and recommended!";
    }

    ["carbs", "fat", "protein", "calories"].forEach((field) => {
      const value = editData.nutritionalConstraints[field];
      if (value === "" || value === null || value === undefined) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (isNaN(value) || Number(value) < 0) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be a positive number`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly!");
      return;
    }

    setIsSaving(true);
    const updatedData = {
      name: editData.name,
      description: editData.description,
      restrictedFoods: editData.restrictedFoods,
      recommendedFoods: editData.recommendedFoods,
      nutritionalConstraints: {
        carbs: Number(editData.nutritionalConstraints.carbs),
        fat: Number(editData.nutritionalConstraints.fat),
        protein: Number(editData.nutritionalConstraints.protein),
        calories: Number(editData.nutritionalConstraints.calories),
      },
    };
    const response = await medicalConditionService.updateMedicalCondition(editData.id, updatedData);
    setIsSaving(false);

    if (response.success) {
      toast.success(`Medical condition "${editData.name}" has been updated!`);
      setIsEditModalOpen(false);
      fetchConditions();
    } else {
      toast.error("Failed to update medical condition: " + response.message);
    }
  };

  const handleOpenFoodModal = (type) => {
    setFoodModalType(type);
    setIsFoodModalOpen(true);
  };

  const handleFoodSelect = (selectedDishes) => {
    if (foodModalType === "restricted") {
      setEditData({ ...editData, restrictedFoods: selectedDishes });
      setRestrictedPage(0);
    } else if (foodModalType === "recommended") {
      setEditData({ ...editData, recommendedFoods: selectedDishes });
      setRecommendedPage(0);
    }
    setIsFoodModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditData({
      id: "",
      name: "",
      description: "",
      restrictedFoods: [],
      recommendedFoods: [],
      nutritionalConstraints: { carbs: "", fat: "", protein: "", calories: "" },
    });
    setErrors({});
    setRestrictedPage(0);
    setRecommendedPage(0);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewData(null);
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const restrictedTotalItems = editData.restrictedFoods.length;
  const restrictedTotalPages = Math.ceil(restrictedTotalItems / foodsPerPage);
  const paginatedRestrictedFoods = editData.restrictedFoods.slice(
    restrictedPage * foodsPerPage,
    (restrictedPage + 1) * foodsPerPage
  );

  const recommendedTotalItems = editData.recommendedFoods.length;
  const recommendedTotalPages = Math.ceil(recommendedTotalItems / foodsPerPage);
  const paginatedRecommendedFoods = editData.recommendedFoods.slice(
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
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          List of Medical Conditions
        </h2>
        <button
          onClick={() => navigate("/nutritionist/medicalConditions/add")}
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
        >
          + Add Medical Condition
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center">
          <SearchInput value={inputValue} onChange={handleInputChange} />
        </div>
      </div>

      <div className="min-h-[calc(100vh-200px)]">
        <ConditionList
          conditions={conditions}
          onEdit={handleEditClick}
          onView={handleViewClick}
          onDelete={handleDelete}
        />
      </div>

      {totalItems > 0 && (
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={(newLimit) => {
              setItemsPerPage(newLimit);
              setCurrentPage(0);
            }}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            currentPage={currentPage}
            text="Conditions"
          />
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {isSaving && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50">
              <div className="loader"></div>
              <p className="mt-4 text-white text-lg">Saving...</p>
            </div>
          )}
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">Edit Medical Condition</h2>
              <div className="ml-auto flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#40B491] mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    placeholder="Enter condition name"
                    className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#40B491] mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#40B491] mb-1">Restricted Foods *</label>
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
                              setEditData({
                                ...editData,
                                restrictedFoods: editData.restrictedFoods.filter(
                                  (id) => id !== foodId
                                ),
                              })
                            }
                            className="ml-2 text-red-500 hover:text-red-700"
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
                  >
                    Add Restricted Foods
                  </button>
                  {errors.restrictedFoods && (
                    <p className="text-red-500 text-sm mt-1">{errors.restrictedFoods}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#40B491] mb-1">Recommended Foods *</label>
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
                              setEditData({
                                ...editData,
                                recommendedFoods: editData.recommendedFoods.filter(
                                  (id) => id !== foodId
                                ),
                              })
                            }
                            className="ml-2 text-red-500 hover:text-red-700"
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
                  <label className="block text-sm font-bold text-[#40B491] mb-1">
                    Nutritional Constraints (Max Values) *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Calories (kcal)</label>
                      <input
                        type="number"
                        name="calories"
                        value={editData.nutritionalConstraints.calories}
                        onChange={handleChange}
                        placeholder="Max calories"
                        className={`w-full border ${errors.calories ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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
                        value={editData.nutritionalConstraints.protein}
                        onChange={handleChange}
                        placeholder="Max protein"
                        className={`w-full border ${errors.protein ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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
                        value={editData.nutritionalConstraints.carbs}
                        onChange={handleChange}
                        placeholder="Max carbs"
                        className={`w-full border ${errors.carbs ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      />
                      {errors.carbs && <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>}
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Fat (g)</label>
                      <input
                        type="number"
                        name="fat"
                        value={editData.nutritionalConstraints.fat}
                        onChange={handleChange}
                        placeholder="Max fat"
                        className={`w-full border ${errors.fat ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      />
                      {errors.fat && <p className="text-red-500 text-sm mt-1">{errors.fat}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">View Medical Condition</h2>
              <button
                className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#40B491] mb-1">Name</label>
                  <p className="text-lg font-semibold text-gray-800">{viewData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#40B491] mb-1">Restricted Foods</label>
                  <div className="flex flex-wrap gap-2">
                    {viewData.restrictedFoods.length > 0 ? (
                      viewData.restrictedFoods.map((foodId) => {
                        const dish = dishes.find((d) => d._id === foodId);
                        return (
                          <span
                            key={foodId}
                            className={`rounded-full px-3 py-1 text-sm ${
                              dish ? "bg-gray-200" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {dish ? dish.name : `[Dish not found: ${foodId}]`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">No restricted foods.</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#40B491] mb-1">Recommended Foods</label>
                  <div className="flex flex-wrap gap-2">
                    {viewData.recommendedFoods.length > 0 ? (
                      viewData.recommendedFoods.map((foodId) => {
                        const dish = dishes.find((d) => d._id === foodId);
                        return (
                          <span
                            key={foodId}
                            className={`rounded-full px-3 py-1 text-sm ${
                              dish ? "bg-gray-200" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {dish ? dish.name : `[Dish not found: ${foodId}]`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">No recommended foods.</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#40B491] mb-1">
                    Nutritional Constraints (Max Values)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Calories (kcal)</label>
                      <p className="text-gray-900">
                        {viewData.nutritionalConstraints?.calories || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Protein (g)</label>
                      <p className="text-gray-900">
                        {viewData.nutritionalConstraints?.protein || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Carbs (g)</label>
                      <p className="text-gray-900">
                        {viewData.nutritionalConstraints?.carbs || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Fat (g)</label>
                      <p className="text-gray-900">
                        {viewData.nutritionalConstraints?.fat || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#40B491] mb-1">Description</label>
                <div
                  className="text-gray-900 h-96 overflow-y-auto p-3 border border-gray-300 rounded-md whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: viewData.description.replace(/\n/g, '<br />') }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isFoodModalOpen && (
        <FoodSelectionModal
          isOpen={isFoodModalOpen}
          onClose={() => setIsFoodModalOpen(false)}
          onSelect={handleFoodSelect}
          availableDishes={dishes}
          selectedDishes={foodModalType === "restricted" ? editData.restrictedFoods : editData.recommendedFoods}
          conflictingDishes={foodModalType === "restricted" ? editData.recommendedFoods : editData.restrictedFoods}
          foodModalType={foodModalType}
        />
      )}
    </div>
  );
};

export default TableMedicalConditions;