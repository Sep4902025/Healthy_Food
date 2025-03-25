import React, { useEffect, useState } from "react";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";
import dishService from "../../../services/nutritionist/dishesServices";
import recipesService from "../../../services/nutritionist/recipesServices";
import {
  HeartPulse,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
} from "lucide-react";

const TableMedicalConditions = () => {
  const [conditions, setConditions] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    restrictedFoods: [],
    recommendedFoods: [],
  });
  const [tempFoodData, setTempFoodData] = useState({
    restrictedFoods: [],
    recommendedFoods: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch medical conditions and dishes with nutritional data
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [conditionsResponse, dishesResponse] = await Promise.all([
        searchTerm
          ? medicalConditionService.searchMedicalConditionByName(searchTerm, currentPage, itemsPerPage)
          : medicalConditionService.getAllMedicalConditions(currentPage, itemsPerPage),
        dishService.getAllDishes(1, 1000), // Lấy tất cả dishes (có thể cần phân trang riêng nếu nhiều dữ liệu)
      ]);

      if (conditionsResponse?.success) {
        setConditions(conditionsResponse.data.items || []);
        setTotalPages(conditionsResponse.data.totalPages || 1);
      } else {
        setConditions([]);
        console.error("❌ Failed to fetch conditions:", conditionsResponse?.message);
      }

      const dishesData =
        dishesResponse?.success && Array.isArray(dishesResponse.data.items)
          ? dishesResponse.data.items
          : [];

      // Fetch nutritional data for each dish with a recipe
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
          return { ...dish, nutritions: { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" } };
        })
      );

      setDishes(enrichedDishes);
    } catch (error) {
      setConditions([]);
      setDishes([]);
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  // Function to calculate nutritional data from recipe ingredients
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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open edit modal
  const handleEditClick = (condition) => {
    setEditData({
      id: condition._id,
      name: condition.name || "",
      description: condition.description || "",
      restrictedFoods: condition.restrictedFoods || [],
      recommendedFoods: condition.recommendedFoods || [],
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medical condition?")) {
      const response = await medicalConditionService.deleteMedicalCondition(id);
      if (response.success) {
        alert("Deleted successfully!");
        fetchData(); // Refresh data after delete
        if (conditions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        alert("Failed to delete medical condition: " + response.message);
      }
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!editData.name.trim()) newErrors.name = "Name is required";
    if (!editData.description.trim()) newErrors.description = "Description is required";
    if (editData.restrictedFoods.some((food) => editData.recommendedFoods.includes(food))) {
      newErrors.foodConflict = "A dish cannot be both restricted and recommended!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save edits
  const handleSaveEdit = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields correctly!");
      return;
    }

    const updatedData = {
      name: editData.name,
      description: editData.description,
      restrictedFoods: editData.restrictedFoods,
      recommendedFoods: editData.recommendedFoods,
    };
    const response = await medicalConditionService.updateMedicalCondition(editData.id, updatedData);
    if (response.success) {
      alert(`Medical condition "${editData.name}" has been updated!`);
      setIsEditModalOpen(false);
      fetchData(); // Refresh data after update
    } else {
      alert("Failed to update medical condition: " + response.message);
    }
  };

  // Open food selection modal
  const handleOpenFoodModal = (type) => {
    setTempFoodData({
      restrictedFoods: [...editData.restrictedFoods],
      recommendedFoods: [...editData.recommendedFoods],
    });
    setIsFoodModalOpen(type);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditData({
      id: "",
      name: "",
      description: "",
      restrictedFoods: [],
      recommendedFoods: [],
    });
    setErrors({});
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">List of Medical Conditions</h2>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by condition name"
            className="w-80 border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {conditions.length > 0 ? (
              conditions.map((condition) => (
                <div
                  key={condition._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center">{condition.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 text-center line-clamp-2">{condition.description}</p>
                  </div>
                  <div className="flex justify-center items-center p-2 bg-gray-100 border-t border-gray-200">
                    <button
                      onClick={() => handleEditClick(condition)}
                      className="text-blue-500 flex items-center px-2 py-1 hover:text-blue-700"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <div className="h-4 border-l border-gray-300 mx-2"></div>
                    <button
                      onClick={() => handleDelete(condition._id)}
                      className="text-red-500 flex items-center px-2 py-1 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500">
                <HeartPulse className="w-24 h-24 text-gray-400 mb-4" />
                <p className="text-lg font-semibold">No medical conditions</p>
                <p className="text-sm">Looks like you haven't added any medical conditions yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {conditions.length > 0 && !isLoading && (
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              className="border rounded px-2 py-1"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="4">4 conditions</option>
              <option value="8">8 conditions</option>
              <option value="12">12 conditions</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"
                }`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Medical Condition Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-6 py-4 px-6">
              <label className="text-xl font-bold text-green-700">Edit Medical Condition</label>
              <div className="ml-auto flex space-x-4">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeEditModal}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    placeholder="Enter condition name"
                    className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="mb-4">
                  <div className="flex border-b border-gray-200 justify-center">
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Description *</label>
                  </div>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restricted Foods</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editData.restrictedFoods.map((foodId) => {
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
                                  restrictedFoods: editData.restrictedFoods.filter((id) => id !== foodId),
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
                    <button
                      onClick={() => handleOpenFoodModal("restricted")}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 w-full"
                    >
                      Add Restricted Foods
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Foods</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editData.recommendedFoods.map((foodId) => {
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
                                  recommendedFoods: editData.recommendedFoods.filter((id) => id !== foodId),
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
                    <button
                      onClick={() => handleOpenFoodModal("recommended")}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 w-full"
                    >
                      Add Recommended Foods
                    </button>
                  </div>
                  {errors.foodConflict && (
                    <p className="text-red-500 text-sm mt-1">{errors.foodConflict}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Food Selection Modal */}
      {isFoodModalOpen && (
        <FoodSelectionModal
          isOpen={!!isFoodModalOpen}
          onClose={() => setIsFoodModalOpen(false)}
          onSelect={(selectedDishes) => {
            if (isFoodModalOpen === "restricted") {
              setEditData({ ...editData, restrictedFoods: selectedDishes });
            } else {
              setEditData({ ...editData, recommendedFoods: selectedDishes });
            }
            setIsFoodModalOpen(false);
          }}
          availableDishes={dishes}
          selectedDishes={isFoodModalOpen === "restricted" ? editData.restrictedFoods : editData.recommendedFoods}
          conflictingDishes={isFoodModalOpen === "restricted" ? editData.recommendedFoods : editData.restrictedFoods}
        />
      )}
    </div>
  );
};

// Food Selection Modal with Type Filter
const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];

const FoodSelectionModal = ({ isOpen, onClose, onSelect, availableDishes, selectedDishes, conflictingDishes }) => {
  const [tempSelectedDishes, setTempSelectedDishes] = useState([...selectedDishes]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const filteredDishes = availableDishes.filter((dish) => {
    const matchesSearch = searchTerm ? dish.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesType = filterType === "all" || dish.type === filterType;
    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCheckboxChange = (dishId) => {
    setTempSelectedDishes((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  const handleConfirm = () => {
    onSelect(tempSelectedDishes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select Dishes</h2>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by dish name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Types</option>
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentDishes.length > 0 ? (
            currentDishes.map((dish) => {
              const isConflicting = conflictingDishes.includes(dish._id);
              return (
                <div
                  key={dish._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                >
                  <img
                    src={dish.imageUrl || "https://via.placeholder.com/300"}
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center">{dish.name}</h3>
                    <div className="text-sm text-gray-600 mt-2 text-center">
                      <div className="flex justify-center items-center">
                        <span className="mr-3 flex items-center">
                          <Flame className="w-4 h-4 mr-1" />
                          {dish.nutritions.calories} kcal
                        </span>
                        <span className="flex items-center">
                          <Dumbbell className="w-4 h-4 mr-1" />
                          {dish.nutritions.protein}g
                        </span>
                      </div>
                      <div className="flex justify-center items-center mt-1">
                        <span className="mr-3 flex items-center">
                          <Wheat className="w-4 h-4 mr-1" />
                          {dish.nutritions.carbs}g
                        </span>
                        <span className="flex items-center">
                          <Droplet className="w-4 h-4 mr-1" />
                          {dish.nutritions.fat}g
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center p-2 bg-gray-100 border-t border-gray-200">
                    <input
                      type="checkbox"
                      checked={tempSelectedDishes.includes(dish._id)}
                      onChange={() => handleCheckboxChange(dish._id)}
                      disabled={isConflicting}
                      className={isConflicting ? "opacity-50 cursor-not-allowed" : ""}
                    />
                    {isConflicting && (
                      <span className="text-sm text-red-500 ml-2">Conflicting</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500">
              <p>No dishes found.</p>
            </div>
          )}
        </div>
        {filteredDishes.length > 0 && (
          <div className="p-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from(
                { length: Math.ceil(filteredDishes.length / itemsPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-green-500 text-white"
                        : "border hover:bg-gray-100"
                    }`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                )
              )}
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredDishes.length / itemsPerPage)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            onClick={handleConfirm}
          >
            Confirm
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableMedicalConditions;