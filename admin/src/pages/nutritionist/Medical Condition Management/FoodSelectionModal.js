import React, { useState, useCallback } from "react";
import { Flame, Dumbbell, Wheat, Droplet } from "lucide-react";
import Pagination from "../../../components/Pagination"; // Đảm bảo import đúng đường dẫn

// Hàm debounce để trì hoãn tìm kiếm
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// SearchInput Component (tái sử dụng từ AddMedicalCondition.js)
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
  const [limit, setLimit] = useState(8); // 8 items per page để vừa với grid 4x2

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(0); // Reset về trang đầu khi tìm kiếm
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
    setCurrentPage(0); // Reset về trang đầu khi lọc
  };

  // Lọc danh sách món ăn dựa trên searchTerm và filterType
  const filteredDishes = availableDishes.filter((dish) => {
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

  const handleCheckboxChange = (dishId) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-5xl h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-[#40B491]">
            Select {foodModalType === "restricted" ? "Restricted" : "Recommended"} Dishes
          </h2>
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
                return (
                  <div
                    key={dish._id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg h-72 flex flex-col"
                  >
                    <img
                      src={dish.imageUrl || "https://via.placeholder.com/300"}
                      alt={dish.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="text-lg font-semibold text-center text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
                        {dish.name}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <Flame className="w-4 h-4 mr-1" />
                            {dish.nutritions.calories} kcal
                          </span>
                          <span className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-1" />
                            {dish.nutritions.protein}g
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
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
                    <div className="p-2 bg-gray-50 border-t border-gray-200 flex justify-center items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(dish._id)}
                        disabled={isConflicting}
                        className={isConflicting ? "opacity-50 cursor-not-allowed" : ""}
                      />
                      {isConflicting && (
                        <span className="text-sm text-gray-500 ml-2">Conflicting</span>
                      )}
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