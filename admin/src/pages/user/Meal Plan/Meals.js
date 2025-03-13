import React, { useEffect, useState } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import AddDishToMeal from "./AddDishToMeal";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";

const Meals = ({ mealDayId, mealPlanId, onClose }) => {
  console.log("MDI", mealDayId);

  const { user } = useSelector(selectAuth);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      const response = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
      if (response.success) {
        setMeals(response.data);
      } else {
        setError(response.message);
      }
      setLoading(false);
    };

    fetchMeals();
  }, [mealPlanId._id, mealDayId._id]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800">Danh sách bữa ăn ngày {mealDayId.date}</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : meals.length > 0 ? (
        meals.map((meal) => (
          <div key={meal._id} className="p-4 border rounded-md my-2">
            <h2 className="font-semibold">{meal.mealName}</h2>
            <p>Thời gian: {meal.mealTime}</p>
            <p>{meal.dishes.length} món ăn</p>

            {/* Nút mở modal thêm món ăn */}
            <button
              onClick={() => {
                setSelectedMealId(meal._id);
                setShowAddDishModal(true);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg flex items-center mt-2"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Thêm món ăn
            </button>
          </div>
        ))
      ) : (
        <p>Chưa có bữa ăn nào.</p>
      )}

      {/* Hiển thị modal thêm món ăn */}
      {showAddDishModal && selectedMealId && (
        <AddDishToMeal
          mealPlanId={mealPlanId}
          mealDayId={mealDayId}
          mealId={selectedMealId}
          userId={user._id}
          onClose={() => setShowAddDishModal(false)}
          onDishAdded={() => {
            setShowAddDishModal(false);
            setMeals((prevMeals) =>
              prevMeals.map((meal) =>
                meal._id === selectedMealId
                  ? { ...meal, dishes: [...meal.dishes, { name: "Món mới" }] }
                  : meal
              )
            );
          }}
        />
      )}

      {/* Nút quay lại */}
      <button onClick={onClose} className="mt-4 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">
        Quay lại
      </button>
    </div>
  );
};

export default Meals;
