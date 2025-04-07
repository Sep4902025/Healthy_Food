import React, { useEffect, useRef, useState, useMemo } from "react";
import mealPlanService from "../../../services/mealPlanServices";
import AddDishToMeal from "./AddDishToMeal";
import AddMealModal from "./AddMealModal";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import DishCard from "./DishCard";
import HomeService from "../../../services/home.service";
import ConfirmationDialog from "../../../components/ui/ConfirmDialog";

const Meals = ({ mealPlanId, mealDayId, onBack, onNutritionChange, date }) => {
  const { user } = useSelector(selectAuth);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDay, setMealDay] = useState(null);
  const [dishDetails, setDishDetails] = useState([]);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState(null);
  const [deletingDishId, setDeletingDishId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mealPlanType, setMealPlanType] = useState(null);
  const [isMealPlanExpired, setIsMealPlanExpired] = useState(false); // New state
  const [isMealPlanPaused, setIsMealPlanPaused] = useState(false); // New state

  // State cho ConfirmationDialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);

  const dataLoaded = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!dataLoaded.current) {
        setLoading(true);
      }

      try {
        const [mealPlanResponse, mealDayResponse, mealsResponse] = await Promise.all([
          mealPlanService.getMealPlanById(mealPlanId),
          mealPlanService.getMealDayById(mealPlanId, mealDayId),
          mealPlanService.getMealsByMealDay(mealPlanId, mealDayId),
        ]);

        if (mealPlanResponse.success) {
          const mealPlan = mealPlanResponse.data;
          setMealPlanType(mealPlan.type);
          setIsMealPlanPaused(mealPlan.isPause); // Set paused status

          // Check if the meal plan is expired
          const startDate = new Date(mealPlan.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + mealPlan.duration);
          const currentDate = new Date();
          setIsMealPlanExpired(currentDate > endDate); // Set expired status
        }

        if (mealDayResponse.success) {
          setMealDay(mealDayResponse.data);
        }

        if (mealsResponse.success) {
          setMeals(mealsResponse.data);

          const dishPromises = mealsResponse.data.flatMap((meal) =>
            meal.dishes.map((dish) => HomeService.getDishById(dish.dishId))
          );

          const dishResponses = await Promise.all(dishPromises);
          const dishData = dishResponses
            .map((res) => (res.success ? res.data : null))
            .filter((dish) => dish !== null);

          setDishDetails(dishData);
        } else {
          setError(mealsResponse.message);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
        dataLoaded.current = true;
      }
    };

    fetchData();
  }, [mealPlanId, mealDayId]);

  const refreshMeals = async () => {
    try {
      const response = await mealPlanService.getMealsByMealDay(mealPlanId, mealDayId);
      if (response.success) {
        setMeals(response.data);

        if (selectedMeal) {
          const updatedMeal = response.data.find((m) => m._id === selectedMeal._id);
          if (updatedMeal) {
            setSelectedMeal(updatedMeal);
          }
        }

        if (onNutritionChange) {
          onNutritionChange();
        }
      }
    } catch (err) {
      console.error("Error refreshing meals:", err);
    }
  };

  const handleDishAdded = () => {
    setIsAddingDish(false);
    refreshMeals();
  };

  const handleMealAdded = () => {
    refreshMeals();
  };

  const handleMealSelect = (meal) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMeal(meal);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBackToMeals = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMeal(null);
      setIsTransitioning(false);
    }, 150);
  };

  const handleRemoveMealFromDay = async (mealId) => {
    if (!mealId) return;

    // Mở ConfirmationDialog thay vì window.confirm
    setMealToDelete(mealId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;

    setDeletingMealId(mealToDelete);
    try {
      const response = await mealPlanService.removeMealFromDay(mealPlanId, mealDayId, mealToDelete);

      if (response.success) {
        refreshMeals();
      } else {
        setError("Could not delete meal!");
      }
    } catch (err) {
      console.error("Error deleting meal:", err);
      setError("Could not delete meal!");
    } finally {
      setDeletingMealId(null);
      setShowConfirmDialog(false);
      setMealToDelete(null);
    }
  };

  const cancelDeleteMeal = () => {
    setShowConfirmDialog(false);
    setMealToDelete(null);
  };

  const handleDeleteDish = async (dishId) => {
    if (!selectedMeal || !dishId) return;

    setDeletingDishId(dishId);
    try {
      const response = await mealPlanService.deleteDishFromMeal(
        mealPlanId,
        mealDayId,
        selectedMeal._id,
        dishId
      );

      if (response.success) {
        refreshMeals();
      } else {
        setError("Could not delete dish!");
      }
    } catch (err) {
      console.error("Error deleting dish:", err);
      setError("Could not delete dish!");
    } finally {
      setDeletingDishId(null);
    }
  };

  const handleOpenAddDishModal = () => {
    if (isMealPlanExpired || isMealPlanPaused) return; // Prevent opening if expired or paused
    setIsAddingDish(true);
    setShowAddDishModal(true);
  };

  const handleCloseAddDishModal = () => {
    setShowAddDishModal(false);
    setIsAddingDish(false);
  };

  const getMealTimeStyle = (mealTime) => {
    const time = mealTime.toLowerCase();

    if (
      time.includes("sáng") ||
      time.includes("sang") ||
      time.includes("breakfast") ||
      time.match(/^([0-5]|0[0-9]):/) ||
      time.match(/^([0-9]):/) ||
      time.includes("am")
    ) {
      return {
        borderColor: "border-yellow-400",
        bgColor: "bg-yellow-50",
        icon: <span className="text-yellow-500 text-xl mr-2">🌞</span>,
      };
    } else if (
      time.includes("trưa") ||
      time.includes("trua") ||
      time.includes("lunch") ||
      time.match(/^(1[0-2]|0[0-9]):/) ||
      time.includes("pm")
    ) {
      return {
        borderColor: "border-orange-400",
        bgColor: "bg-orange-50",
        icon: <span className="text-orange-500 text-xl mr-2">☀️</span>,
      };
    } else if (
      time.includes("chiều") ||
      time.includes("chieu") ||
      time.includes("afternoon") ||
      time.match(/^(1[3-7]):/) ||
      time.includes("pm")
    ) {
      return {
        borderColor: "border-blue-300",
        bgColor: "bg-blue-50",
        icon: <span className="text-blue-500 text-xl mr-2">🌤️</span>,
      };
    } else if (
      time.includes("tối") ||
      time.includes("toi") ||
      time.includes("dinner") ||
      time.includes("supper") ||
      time.match(/^(1[8-9]|2[0-3]):/) ||
      time.includes("pm")
    ) {
      return {
        borderColor: "border-indigo-600",
        bgColor: "bg-indigo-50",
        icon: <span className="text-indigo-500 text-xl mr-2">🌙</span>,
      };
    } else {
      return {
        borderColor: "border-gray-300",
        bgColor: "bg-gray-50",
        icon: null,
      };
    }
  };

  const mealItems = useMemo(() => {
    return meals.map((meal) => {
      const { borderColor, bgColor, icon } = getMealTimeStyle(meal.mealTime);

      return (
        <div
          key={meal._id}
          className={`border-l-4 ${borderColor} border border-gray-200 rounded-lg p-4 cursor-pointer hover:${bgColor} transition-colors relative mb-4`}
          onClick={() => handleMealSelect(meal)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium flex items-center">
                {icon}
                {meal.mealName}
              </h3>
              <p className="text-sm text-gray-500 ml-7">Time: {meal.mealTime}</p>
              <p className="ml-7">{meal.dishes?.length || 0} dishes</p>
            </div>
            <button
              className={`text-red-500 hover:text-red-700 p-1 ${
                deletingMealId === meal._id || isMealPlanExpired || isMealPlanPaused
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              } transition-colors`} // Updated styling
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMealFromDay(meal._id);
              }}
              disabled={deletingMealId === meal._id || isMealPlanExpired || isMealPlanPaused}
              title={
                isMealPlanExpired
                  ? "Cannot delete meal: Meal plan has expired"
                  : isMealPlanPaused
                  ? "Cannot delete meal: Meal plan is paused"
                  : "Delete this meal"
              }
            >
              {deletingMealId === meal._id ? (
                <span className="text-gray-400">Deleting...</span>
              ) : (
                <span>🗑️ Delete</span>
              )}
            </button>
          </div>
        </div>
      );
    });
  }, [meals, deletingMealId, isMealPlanExpired, isMealPlanPaused]);
  if (loading && meals.length === 0) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Determine the reason for disabling actions
  const disableActionsReason = isMealPlanExpired
    ? "Meal plan has expired"
    : isMealPlanPaused
    ? "Meal plan is paused"
    : null;

  return (
    <div className="transition-all duration-300 ease-in-out h-full flex flex-col">
      <div
        className={`transition-opacity duration-300 ease-in-out flex-grow ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {!selectedMeal ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <button onClick={onBack} className="flex items-center text-blue-600 hover:underline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {mealPlanType === "custom" && (
                <div className="relative">
                  {(isMealPlanExpired || isMealPlanPaused) && (
                    <span className="text-red-500 text-xs mr-2">{disableActionsReason}</span>
                  )}
                  <button
                    onClick={() => setShowAddMealModal(true)}
                    className={`bg-blue-600 text-white px-4 py-2 rounded ${
                      isMealPlanExpired || isMealPlanPaused
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                    disabled={isMealPlanExpired || isMealPlanPaused}
                    title={disableActionsReason || "Add a new meal"}
                  >
                    Add Meal
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-4">Meals on {date}</h2>

            <div className="overflow-y-auto pr-2 flex-grow h-full max-h-[380px] pb-4">
              {meals && meals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mealItems}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No meals for this day yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handleBackToMeals}
                className="flex items-center text-blue-600 hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div className="relative">
                {(isMealPlanExpired || isMealPlanPaused) && !isAddingDish && (
                  <span className="text-red-500 text-xs mr-2">{disableActionsReason}</span>
                )}
                <button
                  onClick={handleOpenAddDishModal}
                  disabled={isAddingDish || isMealPlanExpired || isMealPlanPaused}
                  className={`${
                    isAddingDish || isMealPlanExpired || isMealPlanPaused
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-4 py-2 rounded`}
                  title={disableActionsReason || "Add a new dish"}
                >
                  {isAddingDish ? "Adding..." : "Add Dish"}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">Meal {selectedMeal.mealName}</h2>
              <p className="text-gray-500">Time: {selectedMeal.mealTime}</p>
            </div>

            <h3 className="font-medium mb-2">Dish List:</h3>
            <div className="overflow-y-auto pr-2 flex-grow max-h-[340px]">
              {selectedMeal.dishes && selectedMeal.dishes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedMeal.dishes.map((dish, index) => (
                    <DishCard
                      key={index}
                      dish={dish}
                      onDelete={handleDeleteDish}
                      deletingDishId={deletingDishId}
                      disableDelete={isMealPlanExpired || isMealPlanPaused} // Pass prop to disable delete
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No dishes in this meal yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddDishModal && selectedMeal && (
        <AddDishToMeal
          mealPlanId={mealPlanId}
          mealDayId={mealDayId}
          mealId={selectedMeal._id}
          userId={user._id}
          onClose={handleCloseAddDishModal}
          onDishAdded={handleDishAdded}
        />
      )}

      {showAddMealModal && (
        <AddMealModal
          mealPlanId={mealPlanId}
          mealDayId={mealDayId}
          userId={user._id}
          onClose={() => setShowAddMealModal(false)}
          onMealAdded={handleMealAdded}
        />
      )}

      {/* Thêm ConfirmationDialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmDeleteMeal}
        onCancel={cancelDeleteMeal}
        message="Are you sure you want to delete this meal?"
      />
    </div>
  );
};

export default React.memo(Meals);
