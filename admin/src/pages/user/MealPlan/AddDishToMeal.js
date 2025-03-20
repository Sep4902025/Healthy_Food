import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import homeService from "../../../services/home.service";

const AddDishToMeal = ({ mealPlanId, mealDayId, mealId, onClose, onDishAdded, userId }) => {
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [existingDishes, setExistingDishes] = useState([]);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  console.log("FDDDD", favoriteDishes);

  const [activeFilter, setActiveFilter] = useState("all");
  const [dishTypes, setDishTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [dishesResponse, mealResponse, favoritesResponse] = await Promise.all([
          mealPlanService.getAllDishes(),
          mealPlanService.getMealByMealId(mealPlanId, mealDayId, mealId),
          homeService.getFavoriteDishes(userId),
        ]);

        // Process dishes
        if (dishesResponse.success) {
          setDishes(dishesResponse.data);

          // Extract unique dish types
          const types = [
            ...new Set(dishesResponse.data.filter((dish) => dish.type).map((dish) => dish.type)),
          ];

          setDishTypes(types);
        } else {
          setError(dishesResponse.message || "Không thể lấy danh sách món ăn");
        }

        // Process meal data
        if (mealResponse.success && mealResponse.data && mealResponse.data.dishes) {
          setExistingDishes(mealResponse.data.dishes);
        }
        console.log("FAV", favoritesResponse);
        // Process favorites
        if (Array.isArray(favoritesResponse)) {
          const dishIds = favoritesResponse.map((dish) => dish.dishId);
          console.log("Mapped Dish IDs:", dishIds); // Kiểm tra kết quả sau khi map
          setFavoriteDishes(dishIds);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu:", error);
        setError("Không thể lấy dữ liệu món ăn");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [mealPlanId, mealDayId, mealId, userId]);

  // Kiểm tra xem món ăn đã có trong bữa ăn chưa
  const isDishAlreadyAdded = (dish) => {
    if (!existingDishes || existingDishes.length === 0) return false;

    return existingDishes.some(
      (existingDish) =>
        (existingDish.dishId && existingDish.dishId === dish._id) ||
        existingDish._id === dish._id ||
        existingDish.name === dish.name
    );
  };

  // Check if dish is in favorites
  const isFavorite = (dishId) => {
    return favoriteDishes.includes(dishId);
  };

  const handleAddDish = async () => {
    if (!selectedDish) {
      alert("Vui lòng chọn một món ăn!");
      return;
    }

    // Kiểm tra nếu món ăn đã tồn tại
    if (isDishAlreadyAdded(selectedDish)) {
      alert("Món ăn này đã được thêm vào bữa ăn!");
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
        onDishAdded(); // Callback để cập nhật danh sách món ăn sau khi thêm thành công
        onClose(); // Đóng modal
      } else {
        setError(response.message || "Thêm món ăn thất bại");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn:", error);
      setError("Không thể thêm món ăn");
      setIsAdding(false);
    }
  };

  // Filter dishes based on active filter, selected type and search query
  const filteredDishes = dishes.filter((dish) => {
    // Filter by favorite status
    if (activeFilter === "favorites" && !isFavorite(dish._id)) {
      return false;
    }

    // Filter by dish type
    if (selectedType !== "all" && dish.type !== selectedType) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Nếu không lấy được danh sách món ăn, hiển thị lỗi và nút đóng
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4">Đang tải danh sách món ăn...</p>
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
              Đóng
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
          <h2 className="text-xl font-semibold">Chọn món ăn</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {/* Search bar */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Tất cả
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
              Yêu thích
            </button>

            {/* Type selection dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="all">Tất cả loại</option>
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
                          <span className="text-white font-semibold">Đã thêm</span>
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
              <p className="text-gray-500 mt-4">Không có món ăn nào phù hợp với tìm kiếm của bạn</p>
            </div>
          )}
        </div>

        {/* Selected dish information */}
        {selectedDish && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">Món ăn đã chọn</h3>
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

        {/* Action buttons */}
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
            {isAdding ? "Đang thêm..." : "Thêm món ăn"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            disabled={isAdding}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDishToMeal;
