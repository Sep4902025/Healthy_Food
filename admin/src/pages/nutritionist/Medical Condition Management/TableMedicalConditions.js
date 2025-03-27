import React, { useEffect, useState } from "react";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";
import dishService from "../../../services/nutritionist/dishesServices";
import recipesService from "../../../services/nutritionist/recipesServices";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  EditIcon,
  TrashIcon,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Clock,
  Users,
} from "lucide-react";
import Pagination from "../../../components/Pagination"; // Assuming the same Pagination component is available

const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];

const TableMedicalConditions = () => {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Added for pagination
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
        dishService.getAllDishes(1, 1000),
      ]);

      if (conditionsResponse?.success) {
        setConditions(conditionsResponse.data.items || []);
        setTotalPages(conditionsResponse.data.totalPages || 1);
        setTotalItems(conditionsResponse.data.total || 0); // Set total items for pagination
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
                return {
                  ...dish,
                  cookingTime: recipe.cookingTime || "N/A",
                  totalServing: recipe.totalServing || "N/A",
                  nutritions,
                };
              }
            } catch (error) {
              console.error(`Error fetching recipe for dish ${dish._id}:`, error);
            }
          }
          return {
            ...dish,
            cookingTime: "N/A",
            totalServing: "N/A",
            nutritions: { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" },
          };
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

  // Handle edit click
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
        fetchData();
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
      fetchData();
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

  // Pagination handler
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          List of Medical Conditions
        </h2>
        <button
          onClick={() => navigate("add")}
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
        >
          + Add Medical Condition
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by condition name"
            className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Conditions Grid */}
      {isLoading ? (
        <div className="text-center py-4">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="min-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {conditions.length > 0 ? (
              conditions.map((condition) => (
                <div
                  key={condition._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg"
                >
               
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center text-gray-800">
                      {condition.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 text-center line-clamp-2">
                      {condition.description}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 border-t border-gray-200 h-16 flex items-center justify-center">
                    <div className="flex w-full justify-center items-center gap-2">
                      <button
                        onClick={() => handleEditClick(condition)}
                        className="flex-1 text-[#40B491] flex items-center justify-center px-2 py-1 hover:text-[#359c7a] transition"
                      >
                        <EditIcon className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <div className="h-4 border-l border-gray-300 mx-2"></div>
                      <button
                        onClick={() => handleDelete(condition._id)}
                        className="flex-1 text-red-500 flex items-center justify-center px-2 py-1 hover:text-red-600 transition"
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
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
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && !isLoading && (
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text={"Conditions"}
          />
        </div>
      )}

      {/* Edit Medical Condition Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">Edit Medical Condition</h2>
              <div className="ml-auto flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                >
                  Save
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
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
                    className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a] w-full"
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
                    className="bg-[#40B491] text-white px-3 py-1 rounded-md hover:bg-[#359c7a] w-full"
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
          typeOptions={TYPE_OPTIONS}
        />
      )}
    </div>
  );
};

// Updated Food Selection Modal
const FoodSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  availableDishes,
  selectedDishes,
  conflictingDishes,
  typeOptions,
}) => {
  const [tempSelectedDishes, setTempSelectedDishes] = useState([...selectedDishes]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentDishes, setCurrentDishes] = useState([]);

  useEffect(() => {
    const filteredDishes = availableDishes.filter((dish) => {
      const matchesSearch = searchTerm ? dish.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const matchesType = filterType === "all" || dish.type === filterType;
      return matchesSearch && matchesType;
    });

    setTotalItems(filteredDishes.length);
    setTotalPages(Math.ceil(filteredDishes.length / itemsPerPage));

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentDishes(filteredDishes.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, itemsPerPage, searchTerm, filterType, availableDishes]);

  const handleCheckboxChange = (dishId) => {
    setTempSelectedDishes((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  const handleConfirm = () => {
    onSelect(tempSelectedDishes);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-3/4 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-[#40B491]">Select Dishes</h2>
          <div className="ml-auto flex space-x-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
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
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilterType("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md font-semibold ${
                filterType === "all"
                  ? "bg-[#40B491] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition duration-200`}
            >
              All
            </button>
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${
                  filterType === type
                    ? "bg-[#40B491] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition duration-200`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search by dish name"
              className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentDishes.length > 0 ? (
            currentDishes.map((dish) => {
              const isConflicting = conflictingDishes.includes(dish._id);
              return (
                <div
                  key={dish._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg"
                >
                  <img
                    src={dish.imageUrl || "https://via.placeholder.com/300"}
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center text-gray-800">
                      {dish.name}
                    </h3>
                    <div className="text-sm text-gray-600 mt-2 space-y-2">
                      {/* First Row: Cooking Time, Servings, Calories */}
                      <div className="flex justify-between items-center px-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.cookingTime} mins
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.totalServing} servings
                        </span>
                        <span className="flex items-center">
                          <Flame className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.nutritions.calories} kcal
                        </span>
                      </div>
                      {/* Second Row: Protein, Carbs, Fat */}
                      <div className="flex justify-between items-center px-4">
                        <span className="flex items-center">
                          <Dumbbell className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.nutritions.protein}g
                        </span>
                        <span className="flex items-center">
                          <Wheat className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.nutritions.carbs}g
                        </span>
                        <span className="flex items-center">
                          <Droplet className="w-4 h-4 mr-1 text-gray-500" />
                          {dish.nutritions.fat}g
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center p-2 bg-gray-50 border-t border-gray-200">
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
        {totalItems > 0 && (
          <div className="p-4 bg-gray-50">
            <Pagination
              limit={itemsPerPage}
              setLimit={setItemsPerPage}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              text={"Dishes"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TableMedicalConditions;