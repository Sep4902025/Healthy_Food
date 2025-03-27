import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import homeService from "../../../services/home.service";

const AddDishToMeal = ({ mealPlanId, mealDayId, mealId, onClose, onDishAdded, userId }) => {
  // Ensure initial state is an empty array
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [existingDishes, setExistingDishes] = useState([]);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [dishTypes, setDishTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [dishesResponse, mealResponse, favoritesResponse] = await Promise.all([
          mealPlanService.getAllDishes(currentPage, limit, searchQuery),
          mealPlanService.getMealByMealId(mealPlanId, mealDayId, mealId),
          homeService.getFavoriteDishes(userId),
        ]);

        // Process dishes with safety checks
        if (dishesResponse.success && dishesResponse.data) {
          // Ensure items is an array, default to empty array if not
          const dishItems = Array.isArray(dishesResponse.data.items) 
            ? dishesResponse.data.items 
            : [];
          setDishes(dishItems);
          setTotalPages(dishesResponse.data.totalPages || 1);
          
          const types = [
            ...new Set(dishItems.filter((dish) => dish?.type).map((dish) => dish.type)),
          ];
          setDishTypes(types);
        } else {
          setDishes([]); // Set to empty array on failure
          setError(dishesResponse.message || "Could not fetch dishes");
        }

        if (mealResponse.success && mealResponse.data && mealResponse.data.dishes) {
          setExistingDishes(mealResponse.data.dishes);
        }

        if (Array.isArray(favoritesResponse)) {
          const dishIds = favoritesResponse.map((dish) => dish.dishId);
          setFavoriteDishes(dishIds);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError("Could not fetch dishes data");
        setDishes([]); // Ensure dishes is an array even on error
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [mealPlanId, mealDayId, mealId, userId, currentPage, searchQuery]);

  const isDishAlreadyAdded = (dish) => {
    if (!existingDishes || !Array.isArray(existingDishes) || existingDishes.length === 0) return false;
    return existingDishes.some(
      (existingDish) =>
        (existingDish.dishId && existingDish.dishId === dish._id) ||
        existingDish._id === dish._id ||
        existingDish.name === dish.name
    );
  };

  const isFavorite = (dishId) => {
    return favoriteDishes.includes(dishId);
  };

  const handleAddDish = async () => {
    if (!selectedDish) {
      alert("Please select a dish!");
      return;
    }

    if (isDishAlreadyAdded(selectedDish)) {
      alert("This dish has already been added to the meal!");
      return;
    }

    try {
      setIsAdding(true);
      const newDish = {
        dishId: selectedDish._id,
        recipeId: selectedDish?.recipeId,
        imageUrl: selectedDish?.imageUrl,
        name: selectedDish?.name,
        calories: selectedDish?.calories,
        protein: selectedDish?.protein,
        carbs: selectedDish?.carbs,
        fat: selectedDish?.fat,
      };

      const response = await mealPlanService.addDishToMeal(
        mealPlanId,
        mealDayId,
        mealId,
        newDish,
        userId
      );
      if (response.success) {
        onDishAdded();
        onClose();
      } else {
        setError(response.message || "Failed to add dish");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("❌ Error adding dish:", error);
      setError("Could not add dish");
      setIsAdding(false);
    }
  };

  // Ensure dishes is an array before filtering
  const filteredDishes = Array.isArray(dishes) ? dishes.filter((dish) => {
    if (activeFilter === "favorites" && !isFavorite(dish._id)) {
      return false;
    }
    if (selectedType !== "all" && dish.type !== selectedType) {
      return false;
    }
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }) : [];

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4">Loading dishes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
          <p className="text-red-500 text-center mb-4">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select a Dish</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="mb-4 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for a dish..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("favorites")}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center ${
                activeFilter === "favorites"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <span className="mr-1">⭐</span>
              Favorites
            </button>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="all">All Types</option>
              {dishTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {filteredDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish) => {
                const isAlreadyAdded = isDishAlreadyAdded(dish);
                const dishFavorite = isFavorite(dish._id);

                return (
                  <div
                    key={dish._id}
                    className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${
                      selectedDish?._id === dish._id ? "ring-2 ring-blue-500" : ""
                    } ${isAlreadyAdded ? "opacity-50" : ""}`}
                    onClick={() => !isAdding && !isAlreadyAdded && setSelectedDish(dish)}
                  >
                    <div className="relative h-40 bg-gray-200">
                      {dish.imageUrl ? (
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <span>No image</span>
                        </div>
                      )}
                      {dishFavorite && (
                        <span className="absolute top-2 right-2 text-yellow-500 text-xl">⭐</span>
                      )}
                      {isAlreadyAdded && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white font-semibold">Added</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800">{dish.name}</h3>
                        <span className="text-sm font-bold text-blue-600">
                          {dish.calories} kcal
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <div>
                          <span className="inline-block bg-red-100 rounded-full px-2 py-1">
                            Pro: {dish.protein || 0}g
                          </span>
                        </div>
                        <div>
                          <span className="inline-block bg-green-100 rounded-full px-2 py-1">
                            Carbs: {dish.carbs || 0}g
                          </span>
                        </div>
                        <div>
                          <span className="inline-block bg-yellow-100 rounded-full px-2 py-1">
                            Fat: {dish.fat || 0}g
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text-gray-500 mt-4">No dishes match your search criteria</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {selectedDish && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">Selected Dish</h3>
            <div className="flex items-center mt-2">
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                {selectedDish.imageUrl ? (
                  <img
                    src={selectedDish.imageUrl}
                    alt={selectedDish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>No img</span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <p className="font-medium">{selectedDish.name}</p>
                <div className="flex space-x-3 text-sm mt-1">
                  <span className="text-blue-600 font-semibold">{selectedDish.calories} kcal</span>
                  <span>Pro: {selectedDish.protein || 0}g</span>
                  <span>Carbs: {selectedDish.carbs || 0}g</span>
                  <span>Fat: {selectedDish.fat || 0}g</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleAddDish}
            className={`${
              isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-4 py-2 rounded-lg`}
            disabled={
              isAdding || !selectedDish || (selectedDish && isDishAlreadyAdded(selectedDish))
            }
          >
            {isAdding ? "Adding..." : "Add Dish"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            disabled={isAdding}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDishToMeal;