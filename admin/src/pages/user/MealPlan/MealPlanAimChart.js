import { useEffect, useState, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";
import UserService from "../../../services/user.service";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {children}
        <button
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const MealPlanAimChart = ({ mealPlanId, duration, onNutritionTargetsCalculated }) => {
  const [userPreference, setUserPreference] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSurvey, setNeedsSurvey] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch Meal Plan data
        const mealPlanData = await mealPlanService.getMealPlanById(mealPlanId);
        if (!isMounted) return;

        if (!mealPlanData.success || !mealPlanData.data) {
          throw new Error(mealPlanData.message || "Unable to fetch MealPlan data");
        }
        setMealPlan(mealPlanData.data);

        // Check userId from Meal Plan
        const userId = mealPlanData.data.userId;
        if (!userId) {
          throw new Error("User ID not found in Meal Plan data");
        }

        // Step 2: Fetch User data by userId
        const userData = await UserService.getUserById(userId);
        console.log("USDDD", userData);

        if (!isMounted) return;

        if (!userData.success || !userData.user) {
          throw new Error(userData.message || "Unable to fetch User data");
        }

        // Step 3: Check userPreferenceId
        const userPreferenceData = userData?.user?.userPreferenceId;
        if (!userPreferenceData) {
          setNeedsSurvey(true);
          setLoading(false); // Stop loading here
          return; // Exit early, no need to throw an error
        }

        // Step 4: Use the populated userPreference data directly
        if (userPreferenceData.isDelete) {
          setNeedsSurvey(true);
        } else {
          setUserPreference(userPreferenceData);
          setNeedsSurvey(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "An error occurred while fetching data");
      } finally {
        if (!needsSurvey) setLoading(false); // Only stop loading if survey isn't needed
      }
    };

    if (mealPlanId) fetchData();

    return () => {
      isMounted = false;
    };
  }, [mealPlanId]);

  const calculateNutritionTargets = useCallback((preferences) => {
    if (!preferences) return null;

    const convertAge = (ageRange) => {
      const ageMap = { "18-25": 22, "26-35": 30, "36-45": 40, "46+": 50 };
      return ageMap[ageRange] || 30;
    };

    const age = convertAge(preferences.age);
    const { height, weight, activityLevel, gender, weightGoal } = preferences;

    if (!age || !weight || !height || !activityLevel || !gender || !weightGoal) {
      console.log("Missing required fields for nutrition calculation:", {
        age,
        height,
        weight,
        activityLevel,
        gender,
        weightGoal,
      });
      return null;
    }

    // Calculate BMR (Basal Metabolic Rate)
    const BMR =
      gender === "female"
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;

    // Calculate TDEE (Total Daily Energy Expenditure)
    const TDEE = BMR * activityLevel;

    // Determine if user wants to lose or gain weight
    const weightDifference = weight - weightGoal;
    let dailyCalories;

    if (weightDifference > 0) {
      // Weight loss: Create a calorie deficit (500 kcal below TDEE for ~0.5kg/week loss)
      dailyCalories = TDEE - 500;
    } else if (weightDifference < 0) {
      // Weight gain: Create a calorie surplus (500 kcal above TDEE for ~0.5kg/week gain)
      dailyCalories = TDEE + 500;
    } else {
      // Maintain weight: Use TDEE directly
      dailyCalories = TDEE;
    }

    // Ensure dailyCalories doesn't go below a safe minimum (e.g., 1200 kcal for women, 1500 for men)
    const minimumCalories = gender === "female" ? 1200 : 1500;
    dailyCalories = Math.max(dailyCalories, minimumCalories);

    // Calculate macronutrients
    const protein = weight * 1.5; // 1.5g per kg of body weight
    const fat = weight * 0.8; // 0.8g per kg of body weight
    const carbs = (dailyCalories - (protein * 4 + fat * 9)) / 4; // Remaining calories assigned to carbs

    return {
      calories: {
        target: Math.round(dailyCalories),
        min: Math.round(dailyCalories * 0.9),
        max: Math.round(dailyCalories * 1.1),
      },
      protein: {
        target: Math.round(protein),
        min: Math.round(protein - 15),
        max: Math.round(protein + 15),
      },
      carbs: {
        target: Math.round(carbs),
        min: Math.round(carbs - 15),
        max: Math.round(carbs + 15),
      },
      fat: {
        target: Math.round(fat),
        min: Math.round(fat - 10),
        max: Math.round(fat + 10),
      },
    };
  }, []);

  useEffect(() => {
    if (!userPreference || !mealPlan || calculationComplete || needsSurvey) return;

    const targets = calculateNutritionTargets(userPreference);
    if (!targets) {
      setNeedsSurvey(true);
      return;
    }

    setNutritionTargets(targets);
    setCalculationComplete(true);

    if (onNutritionTargetsCalculated) {
      setTimeout(() => {
        onNutritionTargetsCalculated(targets);
      }, 0);
    }
  }, [
    userPreference,
    mealPlan,
    calculateNutritionTargets,
    onNutritionTargetsCalculated,
    calculationComplete,
    needsSurvey,
  ]);

  const chartData = useMemo(() => {
    if (!nutritionTargets) return [];

    return [
      { name: "Protein", value: nutritionTargets.protein.target, color: "#ef4444" },
      { name: "Carbs", value: nutritionTargets.carbs.target, color: "#3b82f6" },
      { name: "Fat", value: nutritionTargets.fat.target, color: "#facc15" },
    ].filter((item) => item.value > 0);
  }, [nutritionTargets]);

  const handleOpenModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (needsSurvey) {
    return (
      <div className="text-center">
        <p className="mb-4">
          You need to complete the survey so we can calculate nutrition targets tailored for you.
        </p>
        <Link to="/survey/name">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Take the Survey Now
          </button>
        </Link>
      </div>
    );
  }

  if (!nutritionTargets) {
    return (
      <div className="text-center">
        <p className="mb-4">
          Unable to calculate nutrition targets due to missing information. Please complete the
          survey.
        </p>
        <Link to="/survey">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Take the Survey Now
          </button>
        </Link>
      </div>
    );
  }

  const weightDifference = userPreference ? userPreference.weight - userPreference.weightGoal : 0;
  const isWeightLoss = weightDifference > 0;
  const isWeightGain = weightDifference < 0;
  const weeksToGoal = Math.ceil(Math.abs(weightDifference) / 0.5);

  return (
    <div className="flex flex-col items-center relative">
      <button
        onClick={handleOpenModal}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
      >
        ❓
      </button>
      <div className="w-20 h-20 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={35}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold">{nutritionTargets.calories.target}</div>
            <div className="text-xs text-gray-500">kcal</div>
          </div>
        </div>
      </div>
      <div className="flex text-xs mt-1 space-x-2">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-400 mr-1"></div>
          <span>Protein {nutritionTargets.protein.target}g</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-400 mr-1"></div>
          <span>Carbs {nutritionTargets.carbs.target}g</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-400 mr-1"></div>
          <span>Fat {nutritionTargets.fat.target}g</span>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <h3 className="text-lg font-semibold mb-4 text-custom-green">Goal Information</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p>
              <strong>Current Weight:</strong>{" "}
              {userPreference?.weight ? `${userPreference.weight} kg` : "No data available"}
            </p>
            <p>
              <strong>Weight Goal:</strong>{" "}
              {userPreference?.weightGoal ? `${userPreference.weightGoal} kg` : "No data available"}
            </p>
            <p>
              <strong>Plan Duration:</strong> {duration} days
            </p>
          </div>

          {isWeightLoss && (
            <p>
              To achieve your goal of losing {weightDifference} kg, you need to maintain a proper
              diet with a calorie deficit for about <strong>{weeksToGoal} weeks</strong>.
            </p>
          )}
          {isWeightGain && (
            <p>
              To achieve your goal of gaining {Math.abs(weightDifference)} kg, you need to maintain
              a proper diet with a calorie surplus for about <strong>{weeksToGoal} weeks</strong>.
            </p>
          )}
          <p>
            Try this plan for the first {duration} days. After that, contact a nutritionist for
            long-term support!
          </p>

          <div>
            <p className="font-semibold text-custom-green">Nutrition Targets:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calories: {nutritionTargets.calories.target} kcal (±10%)</li>
              <li>Protein: {nutritionTargets.protein.target}g (±15g)</li>
              <li>Carbs: {nutritionTargets.carbs.target}g (±15g)</li>
              <li>Fat: {nutritionTargets.fat.target}g (±10g)</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MealPlanAimChart;
