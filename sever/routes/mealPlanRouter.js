const express = require("express");
const mealPlanRouter = express.Router();
const {
  createMealPlan,
  addMealToDay,
  addDishesToMeal,
  deleteDishFromMeal,
  getMealPlan,
  getMealDayByMealPlan,
  getMealById,
  getMealsByDayId,
  getDishesByMeal,
  updateMealPlan,
  toggleMealPlanStatus,
  deleteMealPlan,
  getUserMealPlan,
  getMealPlanById,
  removeMealFromDay,
  getUnpaidMealPlanForUser,
  getMealPlanDetails,
  getAllMealPlanPayment,
  getMealPlanHistory,
  getAllMealPlanNutritionistCreatedBy,
  getAllMealPlanAdmin,
  getAllNutritionistsWithMealPlans,
} = require("../controllers/mealPlanController");
const { isAuthenticated, isAdmin, isNutritionist } = require("../middlewares/isAuthenticated");

// 📌 Get list of MealPlans
// Danh sách MealPlan do nutritionist tạo
mealPlanRouter.get(
  "/nutritionistCreatedBy",
  isAuthenticated,
  isNutritionist,
  getAllMealPlanNutritionistCreatedBy
);
mealPlanRouter.get("/nutritionists", getAllNutritionistsWithMealPlans);
mealPlanRouter.get("/admin", isAuthenticated, isAdmin, getAllMealPlanAdmin); // Danh sách tất cả MealPlan cho admin
mealPlanRouter.get("/user/:userId", isAuthenticated, getUserMealPlan);
mealPlanRouter.get("/user/:userId/unpaid", isAuthenticated, getUnpaidMealPlanForUser);
mealPlanRouter.get("/details/:mealPlanId", isAuthenticated, getMealPlanDetails);

// 📌 Route for getting all paid MealPlans (moved up)
mealPlanRouter.get("/payments", isAuthenticated, getAllMealPlanPayment);

// 📌 Specific MealPlan by ID (moved after /payments)
mealPlanRouter.get("/:mealPlanId", isAuthenticated, getMealPlanById);

// 📌 Create, update, toggle, delete MealPlan
mealPlanRouter.post("/", isAuthenticated, createMealPlan);
mealPlanRouter.put("/:mealPlanId", isAuthenticated, updateMealPlan);
mealPlanRouter.patch("/:mealPlanId/toggle", isAuthenticated, toggleMealPlanStatus);
mealPlanRouter.delete("/:mealPlanId", isAuthenticated, deleteMealPlan);

// 📌 Manage Meals in MealDay
mealPlanRouter.post("/:mealPlanId/mealDay/:mealDayId/meal", isAuthenticated, addMealToDay);
mealPlanRouter.delete(
  "/:mealPlanId/mealDay/:mealDayId/meal/:mealId",
  isAuthenticated,
  removeMealFromDay
);

// 📌 Manage Dishes in Meal
mealPlanRouter.post(
  "/:mealPlanId/mealDay/:mealDayId/meal/:mealId/dishes",
  isAuthenticated,
  addDishesToMeal
);
mealPlanRouter.delete(
  "/:mealPlanId/mealDay/:mealDayId/meal/:mealId/dishes/:dishId",
  isAuthenticated,
  deleteDishFromMeal
);

// 📌 Get MealDay, Meal, and Dish information
mealPlanRouter.get("/history/:userId", isAuthenticated, getMealPlanHistory);
mealPlanRouter.get("/:mealPlanId/mealDay", isAuthenticated, getMealDayByMealPlan);
mealPlanRouter.get("/:mealPlanId/mealDay/:mealDayId/meal", isAuthenticated, getMealsByDayId);
mealPlanRouter.get("/:mealPlanId/mealDay/:mealDayId/meal/:mealId", isAuthenticated, getMealById);
mealPlanRouter.get(
  "/:mealPlanId/mealDay/:mealDayId/meal/:mealId/dishes",
  isAuthenticated,
  getDishesByMeal
);

module.exports = mealPlanRouter;
