import React from "react";
import { toast } from "react-toastify";

const PreviewModal = ({ isOpen, onClose, previewData }) => {
  if (!isOpen || !previewData) return null;

  const handleContactSupport = () => {
    // Ensure the toast is only triggered once
    toast.info(
      "The messaging feature is under development. Please contact us via email: support@example.com",
      { toastId: "contact-support-toast" } // Use a unique toastId to prevent duplicates
    );
  };

  // Calculate total calories for a meal and round to the nearest integer
  const calculateMealCalories = (dishes) => {
    const total = dishes.reduce((total, dish) => total + (dish.calories || 0), 0);
    return Math.round(total);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Meal Plan Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Meal Plan Details - New Compact Inline Layout */}
        <div className="text-gray-600 mb-2 text-sm space-y-1">
          <p>
            <strong>Title:</strong> {previewData.title} | <strong>Duration:</strong>{" "}
            {previewData.duration} days
          </p>
          <p>
            <strong>Start:</strong> {new Date(previewData.startDate).toLocaleDateString()} -{" "}
            <strong>End:</strong> {new Date(previewData.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Price:</strong> {previewData.price.toLocaleString()} VND
          </p>
        </div>

        {/* Day 1 Meals - Compact Scrollable Section with Vertical Cards */}
        <h3 className="text-base font-medium mb-1">Day 1</h3>
        {previewData.days && previewData.days.length > 0 ? (
          <div className="border p-3 rounded-lg">
            {/* Scrollable container for meals */}
            <div className="max-h-48 overflow-y-auto">
              {previewData.days[0].meals.map((meal, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <p className="font-medium text-sm">
                    <strong>Meal {index + 1}:</strong> {meal.mealName} at {meal.mealTime} (
                    {calculateMealCalories(meal.dishes)} kcal)
                  </p>
                  {/* Dishes displayed as vertical cards */}
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {meal.dishes.map((dish, dishIndex) => (
                      <div
                        key={dishIndex}
                        className="bg-gray-50 rounded-lg p-2 shadow-sm border flex flex-col items-center text-center text-xs text-gray-600"
                      >
                        {/* Dish Image */}
                        {dish.imageUrl && (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-16 h-16 object-cover rounded-md mb-1"
                          />
                        )}
                        {/* Dish Details */}
                        <p className="font-medium">{dish.name}</p>
                        <p>
                          Cal: {dish.calories} kcal | Protein: {dish.protein}g
                        </p>
                        <p>
                          Carbs: {dish.carbs}g | Fat: {dish.fat}g
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Text - Compact */}
            <p className="text-gray-500 text-xs mt-2">
              This is a preview of the first day. To view the full plan, please proceed with
              payment.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              After payment, you can message the system to adjust your schedule.
            </p>
            <button
              onClick={handleContactSupport}
              className="mt-1 text-blue-500 hover:underline text-xs"
            >
              Contact Support
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No meals available for preview.</p>
        )}

        {/* Close Button */}
        <div className="mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
