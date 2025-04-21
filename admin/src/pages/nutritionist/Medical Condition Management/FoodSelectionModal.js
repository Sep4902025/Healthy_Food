import React, { useState, useCallback, useEffect } from "react";
import Pagination from "../../../components/Pagination";
import recipesService from "../../../services/nutritionist/recipesServices";

// Debounce function to delay search
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// SearchInput Component
const SearchInput = React.memo(({ value, onChange }) => {
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

const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];

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
              // Silent error handling
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
  const paginatedDishes = filteredDishes.slice(currentPage * limit, (currentPage + 1) * limit);

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
                  totalCalories: "0",
                  totalProtein: "0",
                  totalCarbs: "0",
                  totalFat: "0",
                };

                return (
                  <div
                    key={dish._id}
                    className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer relative flex flex-col h-[280px] ${isSelected ? "border-[#40B491] border-2" : "border-gray-200"
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
                          <span className="text-white font-semibold">
                            {foodModalType === "restricted" ? "In Recommended" : "In Restricted"}
                          </span>
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
                    <div className="p-3 flex flex-col justify-between h-[100px]">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800 truncate w-[70%]">{dish.name}</h3>
                        {/* Increase min-width and prevent wrapping */}
                        <span className="text-sm font-bold text-blue-600 min-w-[100px] text-right whitespace-nowrap">
                          {nutritionData.totalCalories !== "N/A"
                            ? `${nutritionData.totalCalories} kcal`
                            : "N/A"}
                        </span>
                      </div>
                      {/* Keep nutritional stats aligned */}
                      <div className="text-sm flex flex-col h-[60px] justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 min-w-[60px]">Protein:</span>
                          <span className="font-medium text-right">
                            {nutritionData.totalProtein}{" "}
                            {nutritionData.totalProtein !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 min-w-[60px]">Fat:</span>
                          <span className="font-medium text-right">
                            {nutritionData.totalFat}{" "}
                            {nutritionData.totalFat !== "N/A" ? "g" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 min-w-[60px]">Carbs:</span>
                          <span className="font-medium text-right">
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

export default FoodSelectionModal;