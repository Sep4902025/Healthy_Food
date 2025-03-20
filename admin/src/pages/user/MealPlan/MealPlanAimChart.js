import { useEffect, useState, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import mealPlanService from "../../../services/mealPlanServices";
import quizService from "../../../services/quizService";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white p-4 rounded-lg shadow-lg w-80">
        {children}
        <button className="mt-3 w-full bg-blue-500 text-white py-1 rounded" onClick={onClose}>
          Đóng
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

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const mealPlanData = await mealPlanService.getMealPlanById(mealPlanId);
        if (!isMounted) return;

        const userData = await quizService.getUserPreference(mealPlanData.data.userId);
        if (!isMounted) return;

        setMealPlan(mealPlanData.data);
        setUserPreference(userData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
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
    const { height, weight, activityLevel, gender } = preferences;

    if (!age || !weight || !height || !activityLevel) return null;

    const BMR =
      gender === "female"
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;

    const TDEE = BMR * activityLevel;
    const dailyCalories = TDEE;

    const protein = weight * 1.5; // Điều chỉnh xuống 1.5g/kg
    const fat = weight * 0.8;
    const carbs = (dailyCalories - (protein * 4 + fat * 9)) / 4;

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
    if (!userPreference || !mealPlan || calculationComplete) return;

    const targets = calculateNutritionTargets(userPreference);
    if (!targets) return;

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

  if (!userPreference || !mealPlan || !nutritionTargets) {
    return <p className="text-center">Loading...</p>;
  }

  // Tính số tuần cần thiết để đạt mục tiêu
  const weightToLose = userPreference.weight - userPreference.weightGoal;
  const weeksToGoal = Math.ceil(weightToLose / 0.5);

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
        <h3 className="text-lg font-semibold mb-2">Thông tin mục tiêu</h3>
        <p>
          <strong>Your Weight:</strong>{" "}
          {userPreference.weight ? `(${userPreference.weight} kg)` : ""}
        </p>
        <p>
          <strong>Weight Goal:</strong>
          {userPreference.weightGoal ? `(${userPreference.weightGoal} kg)` : ""}
        </p>
        <p>
          <strong>Time Plan:</strong> {duration} days
        </p>
        <p>
          Để đạt mục tiêu giảm {weightToLose} kg, bạn cần duy trì chế độ ăn phù hợp trong khoảng
          <strong> {weeksToGoal} tuần</strong>.
        </p>
        <p>
          Hãy thử trải nghiệm kế hoạch này trong {duration} ngày đầu tiên. Sau đó, liên hệ chuyên
          gia dinh dưỡng để được hỗ trợ dài hạn!
        </p>
        <p>
          <strong>Nutrition Targets:</strong>
        </p>
        <p>Calories: {nutritionTargets.calories.target} kcal (±10%)</p>
        <p>Protein: {nutritionTargets.protein.target}g (±15g)</p>
        <p>Carbs: {nutritionTargets.carbs.target}g (±15g)</p>
        <p>Fat: {nutritionTargets.fat.target}g (±10g)</p>
      </Modal>
    </div>
  );
};

export default MealPlanAimChart;
