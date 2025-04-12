import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";
import userService from "../../../services/user.service";
import ingredientsService from "../../../services/nutritionist/ingredientsServices";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import MealPlanAimChart from "../../user/MealPlan/MealPlanAimChart";
import MealDays from "../../user/MealPlan/MealDays";

const EditMealPlanPage = () => {
  const { mealPlanId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [healthyInfo, setHealthyInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [favoriteNames, setFavoriteNames] = useState([]);
  const [hateNames, setHateNames] = useState([]);
  const [diseaseNames, setDiseaseNames] = useState([]);
  const [showMoreFavorites, setShowMoreFavorites] = useState(false);
  const [showMoreHates, setShowMoreHates] = useState(false);

  // Log state updates
  useEffect(() => {
    console.log("Updated fav:", favoriteNames);
    console.log("Updated HATE:", hateNames);
  }, [favoriteNames, hateNames]);

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

  const fetchHealthyInfo = async () => {
    if (!mealPlan?.userId) return;
    setModalLoading(true);
    try {
      const response = await userService.getUserById(mealPlan.userId);
      if (response.success) {
        setHealthyInfo(response.user);

        // Log raw data for debugging
        console.log("Raw favorite IDs:", response.user.userPreferenceId?.favorite);
        console.log("Raw hate IDs:", response.user.userPreferenceId?.hate);

        // Xử lý favorite
        let favorites = [];
        if (response.user.userPreferenceId?.favorite?.length > 0) {
          const favoritePromises = response.user.userPreferenceId.favorite.map(async (id) => {
            try {
              const result = await ingredientsService.getIngredientById(id);
              return result;
            } catch (error) {
              console.error(`Error fetching ingredient with ID ${id}:`, error);
              return { success: false, data: null };
            }
          });
          const favoriteResults = await Promise.all(favoritePromises);
          console.log("Favorite Results:", favoriteResults);

          const validFavorites = favoriteResults.filter(
            (res) => res.success && res.data?.data?.name
          );
          if (validFavorites.length === 0) {
            console.warn("No valid favorite ingredients found.");
          }
          favorites = validFavorites.map((res) => res.data.data.name);
          setFavoriteNames(favorites);
        } else {
          console.log("No favorite ingredients to fetch.");
        }

        // Xử lý hate
        let hates = [];
        if (response.user.userPreferenceId?.hate?.length > 0) {
          const hatePromises = response.user.userPreferenceId.hate.map(async (id) => {
            try {
              const result = await ingredientsService.getIngredientById(id);
              return result;
            } catch (error) {
              console.error(`Error fetching disliked ingredient with ID ${id}:`, error);
              return { success: false, data: null };
            }
          });
          const hateResults = await Promise.all(hatePromises);
          console.log("Hate Results:", hateResults);

          const validHates = hateResults.filter((res) => res.success && res.data?.data?.name);
          if (validHates.length === 0) {
            console.warn("No valid disliked ingredients found.");
          }
          hates = validHates.map((res) => res.data.data.name);
          setHateNames(hates);
        } else {
          console.log("No disliked ingredients to fetch.");
        }

        // Xử lý underDisease
        if (response.user.userPreferenceId?.underDisease?.length > 0) {
          const diseasePromises = response.user.userPreferenceId.underDisease.map(async (id) => {
            try {
              const result = await medicalConditionService.getMedicalConditionById(id);
              return result;
            } catch (error) {
              console.error(`Error fetching medical condition with ID ${id}:`, error);
              return { success: false, data: null };
            }
          });
          const diseaseResults = await Promise.all(diseasePromises);
          console.log("Disease Results:", diseaseResults);

          const validDiseases = diseaseResults.filter((res) => res.success && res.data?.name);
          setDiseaseNames(validDiseases.map((res) => res.data.name));
        }

        setShowModal(true);
      } else {
        setError("Failed to load healthy info");
      }
    } catch (err) {
      console.error("Error fetching healthy info:", err);
      setError("Error fetching healthy info");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
  }, [mealPlanId]);

  const handleNutritionTargetsCalculated = (targets) => {
    setNutritionTargets(targets);
  };

  const getMealPlanStatus = () => {
    if (mealPlan?.isPause) return "Paused";
    const currentDate = new Date();
    if (mealPlan?.endDate && new Date(mealPlan.endDate) < currentDate) return "Expired";
    return "Active";
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
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
  if (!mealPlan) return <div className="text-center py-10">No meal plan found.</div>;

  const maxInitialDisplay = 3;

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#40B491]">
          Edit Meal Plan: {mealPlan.title}
        </h1>
        <button
          onClick={() => navigate("/nutritionist/mealplan")}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center justify-between">
        <div className="flex-1">
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
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`${
                getMealPlanStatus() === "Active"
                  ? "text-[#40B491]"
                  : getMealPlanStatus() === "Paused"
                  ? "text-yellow-600"
                  : "text-red-600"
              } font-semibold`}
            >
              {getMealPlanStatus()}
            </span>
          </p>
        </div>
        <div className="flex-1 flex justify-center">
          <MealPlanAimChart
            mealPlanId={mealPlanId}
            duration={mealPlan.duration}
            onNutritionTargetsCalculated={handleNutritionTargetsCalculated}
          />
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={fetchHealthyInfo}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            View Healthy Info
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Meal Days</h2>
        <MealDays mealPlanId={mealPlanId} nutritionTargets={nutritionTargets} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#40B491] mb-4">Healthy Info</h3>
            {modalLoading ? (
              <p>Loading healthy info...</p>
            ) : healthyInfo ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.age || "N/A"}
                  >
                    <strong>Age:</strong> {healthyInfo.userPreferenceId?.age || "N/A"}
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.gender || "N/A"}
                  >
                    <strong>Gender:</strong> {healthyInfo.userPreferenceId?.gender || "N/A"}
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={`${healthyInfo.userPreferenceId?.weight || "N/A"} kg`}
                  >
                    <strong>Weight:</strong> {healthyInfo.userPreferenceId?.weight || "N/A"} kg
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={`${healthyInfo.userPreferenceId?.height || "N/A"} cm`}
                  >
                    <strong>Height:</strong> {healthyInfo.userPreferenceId?.height || "N/A"} cm
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={`${healthyInfo.userPreferenceId?.weightGoal || "N/A"} kg`}
                  >
                    <strong>Weight Goal:</strong>{" "}
                    {healthyInfo.userPreferenceId?.weightGoal || "N/A"} kg
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.goal || "N/A"}
                  >
                    <strong>Goal:</strong> {healthyInfo.userPreferenceId?.goal || "N/A"}
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.waterDrink || "N/A"}
                  >
                    <strong>Water Intake:</strong>{" "}
                    {healthyInfo.userPreferenceId?.waterDrink || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.diet || "N/A"}
                  >
                    <strong>Diet:</strong> {healthyInfo.userPreferenceId?.diet || "N/A"}
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.mealNumber || "N/A"}
                  >
                    <strong>Meal Number:</strong>{" "}
                    {healthyInfo.userPreferenceId?.mealNumber || "N/A"}
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.activityLevel || "N/A"}
                  >
                    <strong>Activity Level:</strong>{" "}
                    {healthyInfo.userPreferenceId?.activityLevel || "N/A"}
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={healthyInfo.userPreferenceId?.sleepTime || "N/A"}
                  >
                    <strong>Sleep Time:</strong> {healthyInfo.userPreferenceId?.sleepTime || "N/A"}
                  </p>
                  <p
                    className="truncate"
                    style={{ maxWidth: "200px" }}
                    title={diseaseNames.length > 0 ? diseaseNames.join(", ") : "None"}
                  >
                    <strong>Underlying Diseases:</strong>{" "}
                    {diseaseNames.length > 0 ? diseaseNames.join(", ") : "None"}
                  </p>
                  <div>
                    <strong>Favorite Foods: </strong>
                    {favoriteNames.length > 0 ? (
                      <>
                        <p className="inline">
                          {(showMoreFavorites
                            ? favoriteNames
                            : favoriteNames.slice(0, maxInitialDisplay)
                          ).join(", ")}
                        </p>
                        {favoriteNames.length > maxInitialDisplay && (
                          <button
                            onClick={() => setShowMoreFavorites(!showMoreFavorites)}
                            className="text-blue-500 hover:underline text-xs ml-2"
                          >
                            {showMoreFavorites ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      " None"
                    )}
                  </div>
                  <div>
                    <strong>Restrict Foods: </strong>
                    {hateNames.length > 0 ? (
                      <>
                        <p className="inline">
                          {(showMoreHates ? hateNames : hateNames.slice(0, maxInitialDisplay)).join(
                            ", "
                          )}
                        </p>
                        {hateNames.length > maxInitialDisplay && (
                          <button
                            onClick={() => setShowMoreHates(!showMoreHates)}
                            className="text-blue-500 hover:underline text-xs ml-2"
                          >
                            {showMoreHates ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      " None"
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>Failed to load healthy info.</p>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMealPlanPage;