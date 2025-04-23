import React, { useEffect, useState, useCallback, useMemo } from "react";
import recipesService from "../../../services/nutritionist/recipesServices";
import dishService from "../../../services/nutritionist/dishesServices";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";

// Component SearchInput tái sử dụng
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

// Hàm giới hạn số lượng yêu cầu đồng thời
const limitConcurrency = (tasks, limit) => {
  return new Promise((resolve) => {
    const results = new Array(tasks.length);
    let activeTasks = 0;
    let taskIndex = 0;

    const runTask = () => {
      while (activeTasks < limit && taskIndex < tasks.length) {
        const currentIndex = taskIndex++;
        activeTasks++;
        tasks[currentIndex]()
          .then((result) => {
            results[currentIndex] = result;
          })
          .catch((error) => {
            results[currentIndex] = { error };
          })
          .finally(() => {
            activeTasks--;
            if (taskIndex < tasks.length) {
              runTask();
            } else if (activeTasks === 0) {
              resolve(results);
            }
          });
      }
    };

    runTask();
  });
};

const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];

const FoodSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedDishes,
  conflictingDishes,
  foodModalType,
}) => {
  const [dishes, setDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [limit, setLimit] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tempSelectedDishes, setTempSelectedDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Bộ nhớ đệm cho công thức
  const recipeCache = useMemo(() => new Map(), []);

  // Hàm debounce
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

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

  // Khởi tạo tempSelectedDishes dựa trên selectedDishes khi modal mở
  useEffect(() => {
    if (isOpen) {
      const selectedIds = selectedDishes.map((dish) =>
        typeof dish === "object" ? dish._id : dish
      );
      setTempSelectedDishes(selectedIds);
    }
  }, [isOpen, selectedDishes]);

  // Lấy danh sách món ăn từ API với phân trang từ server
  const fetchDishesAndRecipes = async () => {
    setIsLoading(true);
    try {
      const dishesResponse = await dishService.getAllDishes(
        currentPage + 1,
        limit,
        filterType,
        searchTerm
      );

      if (dishesResponse?.success) {
        let dishesData = dishesResponse.data.items || [];

        const recipeTasks = dishesData.map((dish, index) => async () => {
          if (dish.recipeId && typeof dish.recipeId === "string" && !dish.recipe) {
            if (recipeCache.has(dish.recipeId)) {
              return { ...dish, recipe: recipeCache.get(dish.recipeId) };
            }
            try {
              const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
              if (recipeResponse.success) {
                recipeCache.set(dish.recipeId, recipeResponse.data);
                return { ...dish, recipe: recipeResponse.data };
              }
            } catch (error) {
              console.log(`Error fetching recipe for dish ${dish._id}:`, error);
            }
          }
          return dish;
        });

        const dishesWithRecipes = await limitConcurrency(recipeTasks, 5);

        setDishes(dishesWithRecipes);
        setTotalItems(dishesResponse.data.total || 0);
        setTotalPages(dishesResponse.data.totalPages || 1);
      } else {
        setDishes([]);
        toast.error("Failed to load dish list: " + dishesResponse.message);
      }
    } catch (error) {
      setDishes([]);
      toast.error("An error occurred while loading dishes: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDishesAndRecipes();
    }
  }, [isOpen, currentPage, limit, filterType, searchTerm]);

  const handleDishClick = (dishId) => {
    if (tempSelectedDishes.includes(dishId)) {
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
    const selectedPage = data.selected;
    if (selectedPage >= 0 && selectedPage < totalPages) {
      setCurrentPage(selectedPage);
    }
  };

  const isFavorite = (dishId) => {
    return false; // Placeholder logic for favorites
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-5xl h-[95vh] flex flex-col shadow-xl">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-[#40B491]">
            Select {foodModalType === "restricted" ? "Restricted" : "Recommended"} Dishes
          </h2>
          <div className="ml-auto flex space-x-3">
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${
                tempSelectedDishes.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={tempSelectedDishes.length === 0}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setTempSelectedDishes([]);
                setSearchTerm("");
                setInputValue("");
                setFilterType("all");
                setCurrentPage(0);
                onClose();
              }}
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
            {dishes.length > 0 ? (
              dishes.map((dish) => {
                const isConflicting = conflictingDishes.includes(dish._id);
                const isSelected = tempSelectedDishes.includes(dish._id);
                const isAlreadyAdded = selectedDishes.some(
                  (selected) => (typeof selected === "object" ? selected._id : selected) === dish._id
                );
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
                    className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer relative flex flex-col h-[280px] ${
                      isSelected ? "border-[#40B491] border-2" : "border-gray-200"
                    } ${isConflicting || isAlreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !(isConflicting || isAlreadyAdded) && handleDishClick(dish._id)}
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
                      {isAlreadyAdded && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white font-semibold">Added</span>
                        </div>
                      )}
                      {isSelected && !isConflicting && !isAlreadyAdded && (
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
                        <span className="text-sm font-bold text-blue-600 min-w-[100px] text-right whitespace-nowrap">
                          {nutritionData.totalCalories !== "N/A"
                            ? `${nutritionData.totalCalories} kcal`
                            : "N/A"}
                        </span>
                      </div>
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