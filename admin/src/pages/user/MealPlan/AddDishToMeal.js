import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import homeService from "../../../services/home.service";
import UserService from "../../../services/user.service";

// Debounce function to delay search API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Skeleton Loader Component for Dish Cards
const DishSkeleton = () => (
  <div className="border rounded-lg overflow-hidden shadow-sm transition-all relative w-full h-64 bg-gray-200 animate-pulse">
    <div className="relative h-40 bg-gray-300"></div>
    <div className="p-3">
      <div className="flex justify-between items-start">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-5 bg-gray-300 rounded w-1/4"></div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-600">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

// Memoized Dish Card Component to Prevent Unnecessary Re-renders
const DishCard = memo(
  ({
    dish,
    index,
    page,
    isAlreadyAdded,
    dishFavorite,
    selectedDish,
    isAdding,
    setSelectedDish,
    isLast,
    lastDishElementRef,
  }) => (
    <div
      key={`${dish._id}-${index}-${page}`} // Thêm page để đảm bảo key duy nhất qua các lần fetch
      ref={isLast ? lastDishElementRef : null} // Use isLast prop instead of accessing filteredDishes
      className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer relative transform transition-opacity duration-300 ${
        selectedDish?._id === dish._id ? "border-custom-green border-2" : "border-gray-200"
      } ${isAlreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={() => !isAdding && !isAlreadyAdded && setSelectedDish(dish)}
    >
      <div className="relative h-40 bg-gray-200">
        {dish.imageUrl ? (
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <img
              src="https://via.placeholder.com/150?text=No+Image"
              alt="No image available"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {dishFavorite && <span className="absolute top-2 right-2 text-yellow-500 text-xl">⭐</span>}
        {isAlreadyAdded && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-semibold">Added</span>
          </div>
        )}
        {selectedDish?._id === dish._id && !isAlreadyAdded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-custom-green text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">
              Choice
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800">{dish.name}</h3>
          <span className="text-sm font-bold text-blue-600">
            {(dish.calories / (dish.totalServing || 1)).toFixed(2)} kcal
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">Serves: {dish.totalServing || 1}</div>
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span className="inline-block bg-red-100 rounded-full px-2 py-1">
            Pro: {(dish.protein / (dish.totalServing || 1)).toFixed(2)}g
          </span>
          <span className="inline-block bg-green-100 rounded-full px-2 py-1">
            Carbs: {(dish.carbs / (dish.totalServing || 1)).toFixed(2)}g
          </span>
          <span className="inline-block bg-yellow-100 rounded-full px-2 py-1">
            Fat: {(dish.fat / (dish.totalServing || 1)).toFixed(2)}g
          </span>
        </div>
      </div>
    </div>
  )
);

const AddDishToMeal = ({ mealPlanId, mealDayId, mealId, onClose, onDishAdded, userId }) => {
  const [dishes, setDishes] = useState([]);
  const [prevDishes, setPrevDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [existingDishes, setExistingDishes] = useState([]);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [forYouDishes, setForYouDishes] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dishTypes, setDishTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [limit] = useState(6);
  const [userPreferenceId, setUserPreferenceId] = useState(null);

  const observer = useRef();

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setPage(1);
      setHasMore(true);
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const lastDishElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    const fetchUserPreference = async () => {
      try {
        const userResponse = await UserService.getUserById(userId);
        if (userResponse.success && userResponse.data && userResponse.data.userPreferenceId) {
          setUserPreferenceId(userResponse.data.userPreferenceId);
        }
      } catch (error) {
        console.error("❌ Error fetching user preference:", error);
      }
    };

    fetchUserPreference();
  }, [userId]);

  const removeDuplicateDishes = (dishesArray) => {
    const seen = new Set();
    return dishesArray.filter((dish) => {
      if (seen.has(dish._id)) {
        return false;
      }
      seen.add(dish._id);
      return true;
    });
  };

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        let dishesResponse;
        if (activeFilter === "foryou" && userPreferenceId) {
          dishesResponse = await UserService.getForyou(userId, {
            page,
            limit,
            type: selectedType === "all" ? "" : selectedType,
            search: searchQuery,
          });
        } else {
          dishesResponse = await mealPlanService.getAllDishes(page, limit, searchQuery);
        }

        if (dishesResponse.success) {
          const newDishes = dishesResponse.data.items || [];
          const uniqueNewDishes = removeDuplicateDishes(newDishes);

          if (page === 1) {
            setPrevDishes(dishes);
            setDishes(uniqueNewDishes);
          } else {
            setDishes((prevDishes) => {
              const combinedDishes = [...prevDishes, ...uniqueNewDishes];
              return removeDuplicateDishes(combinedDishes);
            });
          }
          setHasMore(uniqueNewDishes.length === limit);

          if (activeFilter === "foryou") {
            setForYouDishes((prev) => {
              const combinedForYou = page === 1 ? uniqueNewDishes : [...prev, ...uniqueNewDishes];
              return removeDuplicateDishes(combinedForYou);
            });
          }

          if (page === 1) {
            const types = [
              ...new Set(uniqueNewDishes.filter((dish) => dish.type).map((dish) => dish.type)),
            ];
            setDishTypes(types);
          }
        } else {
          setError(dishesResponse.message || "Could not fetch dishes");
        }
      } catch (error) {
        console.error("❌ Error fetching dishes:", error);
        setError("Could not fetch dishes data");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchDishes();
  }, [page, activeFilter, selectedType, searchQuery, userId, userPreferenceId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [mealResponse, favoritesResponse] = await Promise.all([
          mealPlanService.getMealByMealId(mealPlanId, mealDayId, mealId),
          homeService.getFavoriteDishes(userId),
        ]);

        if (mealResponse.success && mealResponse.data && mealResponse.data.dishes) {
          setExistingDishes(mealResponse.data.dishes);
        }

        if (Array.isArray(favoritesResponse)) {
          const dishIds = favoritesResponse.map((dish) => dish.dishId);
          setFavoriteDishes(dishIds);
        }
      } catch (error) {
        console.error("❌ Error fetching initial data:", error);
        setError("Could not fetch initial data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [mealPlanId, mealDayId, mealId, userId]);

  const isDishAlreadyAdded = (dish) => {
    if (!existingDishes || existingDishes.length === 0) return false;
    return existingDishes.some(
      (existingDish) =>
        (existingDish.dishId && existingDish.dishId === dish._id) ||
        existingDish._id === dish._id ||
        existingDish.name === dish.name
    );
  };

  const isFavorite = (dishId) => favoriteDishes.includes(dishId);

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
      const servingSize = selectedDish.totalServing || 1;
      const newDish = {
        dishId: selectedDish._id,
        recipeId: selectedDish?.recipeId,
        imageUrl: selectedDish?.imageUrl,
        name: selectedDish?.name,
        calories: (selectedDish?.calories || 0) / servingSize,
        protein: (selectedDish?.protein || 0) / servingSize,
        carbs: (selectedDish?.carbs || 0) / servingSize,
        fat: (selectedDish?.fat || 0) / servingSize,
        totalServing: servingSize,
      };

      const response = await mealPlanService.addDishToMeal(mealPlanId, mealDayId, mealId, newDish);
      if (response.success) {
        onDishAdded();
        onClose();
      } else {
        setError(response.message);
        setIsAdding(false);
      }
    } catch (error) {
      console.error("❌ Error adding dish:", error);
      setError("Failed to add dish");
      setIsAdding(false);
    }
  };

  const filteredDishes = removeDuplicateDishes(
    dishes.filter((dish) => {
      if (activeFilter === "favorites" && !isFavorite(dish._id)) return false;
      if (selectedType !== "all" && dish.type !== selectedType) return false;
      return true;
    })
  );

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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for a dish..."
              value={inputValue}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveFilter("all");
                setPage(1);
                setHasMore(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setActiveFilter("favorites");
                setPage(1);
                setHasMore(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center ${
                activeFilter === "favorites"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <span className="mr-1">⭐</span>
              Favorites
            </button>
            {userPreferenceId && (
              <button
                onClick={() => {
                  setActiveFilter("foryou");
                  setPage(1);
                  setHasMore(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center ${
                  activeFilter === "foryou"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                <span className="mr-1">🎯</span>
                For You
              </button>
            )}

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
                setHasMore(true);
              }}
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

        {/* Dishes display */}
        <div className="flex-grow overflow-y-auto">
          {loading && page === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <DishSkeleton key={index} />
              ))}
            </div>
          ) : filteredDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish, index) => {
                const isAlreadyAdded = isDishAlreadyAdded(dish);
                const dishFavorite = isFavorite(dish._id);

                return (
                  <DishCard
                    key={`${dish._id}-${index}-${page}`}
                    dish={dish}
                    index={index}
                    page={page}
                    isAlreadyAdded={isAlreadyAdded}
                    dishFavorite={dishFavorite}
                    selectedDish={selectedDish}
                    isAdding={isAdding}
                    setSelectedDish={setSelectedDish}
                    isLast={index === filteredDishes.length - 1} // Pass isLast as a prop
                    lastDishElementRef={lastDishElementRef}
                  />
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
              <p className="text-gray-500 mt-4">No dishes match your criteria</p>
            </div>
          )}

          {loadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <DishSkeleton key={`loading-more-${index}`} />
              ))}
            </div>
          )}

          {!hasMore && filteredDishes.length > 0 && (
            <p className="text-center text-gray-500 my-4">No more dishes to load</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex justify-end space-x-2">
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
