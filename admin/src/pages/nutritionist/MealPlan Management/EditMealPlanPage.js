import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";

import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import MealPlanAimChart from "../../user/MealPlan/MealPlanAimChart";
import MealDays from "../../user/MealPlan/MealDays";

const EditMealPlanPage = () => {
  const { mealPlanId } = useParams(); // Get mealPlanId from URL
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth); // Get authenticated user
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nutritionTargets, setNutritionTargets] = useState(null);

  // Fetch meal plan details
  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const response = await mealPlanService.getMealPlanById(mealPlanId);
      if (response.success) {
        setMealPlan(response.data);
      } else {
        setError("Failed to load meal plan");
      }
    } catch (err) {
      setError("Error fetching meal plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
  }, [mealPlanId]);

  // Handle nutrition targets calculated from MealPlanAimChart
  const handleNutritionTargetsCalculated = (targets) => {
    setNutritionTargets(targets);
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        {error}
        <button
          onClick={() => navigate("/nutritionist/mealplan")}
          className="ml-4 text-blue-500 underline hover:text-blue-700"
        >
          Back to Meal Plans
        </button>
      </div>
    );
  }

  if (!mealPlan) {
    return <div className="text-center py-10">No meal plan found.</div>;
  }

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-green-600">Edit Meal Plan: {mealPlan.title}</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/nutritionist/mealplan")}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Back
          </button>
        </div>
      </div>

      {/* Meal Plan Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Type:</strong> {mealPlan.type === "fixed" ? "Fixed" : "Custom"}
            </p>
            <p>
              <strong>Start Date:</strong> {new Date(mealPlan.startDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Duration:</strong> {mealPlan.duration} days
            </p>
            <p>
              <strong>Price:</strong> {mealPlan.price ? `$${mealPlan.price}` : "N/A"}
            </p>
          </div>
          <div className="flex justify-end">
            <MealPlanAimChart
              mealPlanId={mealPlanId}
              duration={mealPlan.duration}
              onNutritionTargetsCalculated={handleNutritionTargetsCalculated}
            />
          </div>
        </div>
      </div>

      {/* Meal Days Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Meal Days</h2>
        <MealDays mealPlanId={mealPlanId} nutritionTargets={nutritionTargets} />
      </div>
    </div>
  );
};

export default EditMealPlanPage;
