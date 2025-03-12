import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";

const AddDishToMeal = () => {
  const { mealPlanId, mealDayId, mealId } = useParams();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mealInfo, setMealInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin meal nếu có API
        try {
          const mealData = await mealPlanService.getMealById(mealPlanId, mealDayId, mealId);
          if (mealData && mealData.success) {
            setMealInfo(mealData.data);
          }
        } catch (err) {
          console.log("Không thể lấy thông tin meal");
        }

        // Lấy danh sách món ăn
        console.log("📤 Gửi yêu cầu lấy danh sách món ăn");
        const data = await mealPlanService.getAllDishes();
        console.log("📥 Dữ liệu món ăn nhận được:", data);

        if (data.success) {
          setDishes(data.data);
        } else {
          setError(data.message || "Không thể lấy danh sách món ăn");
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách món ăn:", error);
        setError("Không thể lấy danh sách món ăn");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mealPlanId, mealDayId, mealId]);

  const handleAddDish = async (e) => {
    e.preventDefault();
  
    if (!selectedDish) {
      alert("Vui lòng chọn một món ăn!");
      return;
    }
  
    try {
      console.log(`📤 Thêm món ăn ${selectedDish._id} vào Meal ${mealId}`);
      const newDish = {
        dishId: selectedDish._id,
        name: selectedDish.name,
        calories: selectedDish.calories,
      };
  
      const response = await mealPlanService.addDishToMeal(mealPlanId, mealDayId, mealId, newDish);
      console.log("📥 Kết quả thêm món ăn:", response);
  
      if (response.success) {
        navigate(`/meal-plan/${mealPlanId}/meal-day/${mealDayId}/meal`);
      } else {
        setError(response.message || "Thêm món ăn thất bại");
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn:", error);
      setError("Không thể thêm món ăn");
    }
  };

  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
      <p className="font-medium">{error}</p>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/meal-plan" className="hover:text-green-600">Kế hoạch ăn uống</Link>
          <svg className="mx-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <Link to={`/meal-plan/${mealPlanId}/meal-days`} className="hover:text-green-600">Chi tiết kế hoạch</Link>
          <svg className="mx-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <Link to={`/meal-plan/${mealPlanId}/meal-day/${mealDayId}/meal`} className="hover:text-green-600">Lịch ăn trong ngày</Link>
          <svg className="mx-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="text-gray-800 font-medium">Thêm món ăn</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Thêm món ăn cho bữa {mealInfo?.mealName || ""}</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Dish List */}
      <form onSubmit={handleAddDish}>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="bg-green-50 border-b border-gray-200 px-4 py-3">
            <h3 className="font-semibold text-gray-800">Chọn món ăn</h3>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <label 
                  key={dish._id} 
                  className={`flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 transition duration-150 ${selectedDish?._id === dish._id ? 'bg-green-50' : ''}`}
                >
                  <input
                    type="radio"
                    name="selectedDish"
                    checked={selectedDish?._id === dish._id}
                    onChange={() => setSelectedDish(dish)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                        <path d="M7 2v20"></path>
                        <path d="M21 15V2"></path>
                        <path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{dish.name}</p>
                      <p className="text-sm text-gray-500">{dish.calories} calories</p>
                    </div>
                  </div>
                </label>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Không tìm thấy món ăn phù hợp.</p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition duration-200 flex items-center"
            disabled={!selectedDish}
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm món ăn
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-6 rounded-lg transition duration-200 flex items-center"
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Hủy bỏ
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDishToMeal; 