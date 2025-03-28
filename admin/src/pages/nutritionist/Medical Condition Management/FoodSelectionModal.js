import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Dumbbell, Wheat, Droplet } from "lucide-react";

const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];

const FoodSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  availableDishes,
  selectedDishes,
  conflictingDishes,
}) => {
  const [tempSelectedDishes, setTempSelectedDishes] = useState([...selectedDishes]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Lọc danh sách món ăn dựa trên searchTerm và filterType
  const filteredDishes = availableDishes.filter((dish) => {
    const matchesSearch = searchTerm
      ? dish.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesType = filterType === "all" || dish.type === filterType;
    return matchesSearch && matchesType;
  });

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);

  // Xử lý phân trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Xử lý chọn/bỏ chọn món ăn
  const handleCheckboxChange = (dishId) => {
    setTempSelectedDishes((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  // Xác nhận lựa chọn
  const handleConfirm = () => {
    onSelect(tempSelectedDishes);
  };

  // Nếu modal không mở thì không render gì cả
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select Dishes</h2>

        {/* Tìm kiếm và lọc */}
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by dish name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
            }}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi lọc
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

        {/* Danh sách món ăn */}
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

        {/* Phân trang */}
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

        {/* Nút điều khiển */}
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

export default FoodSelectionModal;
