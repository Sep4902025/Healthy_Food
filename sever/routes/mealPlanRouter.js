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
} = require("../controllers/mealPlanController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

// 📌 Lấy danh sách MealPlan
mealPlanRouter.get("/", isAuthenticated, getMealPlan);
mealPlanRouter.get("/user/:userId", isAuthenticated, getUserMealPlan);
mealPlanRouter.get("/user/:userId/unpaid", isAuthenticated, getUnpaidMealPlanForUser);
mealPlanRouter.get("/details/:mealPlanId", isAuthenticated, getMealPlanDetails);
mealPlanRouter.get("/:mealPlanId", isAuthenticated, getMealPlanById);

// 📌 Tạo, cập nhật, bật/tắt, xóa MealPlan
mealPlanRouter.post("/", isAuthenticated, createMealPlan);
mealPlanRouter.put("/:mealPlanId", isAuthenticated, updateMealPlan);
mealPlanRouter.patch("/:mealPlanId/toggle", isAuthenticated, toggleMealPlanStatus);
mealPlanRouter.delete("/:mealPlanId", isAuthenticated, deleteMealPlan);

// 📌 Quản lý Meal trong MealDay
mealPlanRouter.post("/:mealPlanId/mealDay/:mealDayId/meal", isAuthenticated, addMealToDay);
mealPlanRouter.delete(
  "/:mealPlanId/mealDay/:mealDayId/meal/:mealId",
  isAuthenticated,
  removeMealFromDay
);

// 📌 Quản lý Dish trong Meal
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

// 📌 Lấy thông tin MealDay, Meal, và Dish
mealPlanRouter.get("/:mealPlanId/mealDay", isAuthenticated, getMealDayByMealPlan);
mealPlanRouter.get("/:mealPlanId/mealDay/:mealDayId/meal", isAuthenticated, getMealsByDayId);
mealPlanRouter.get("/:mealPlanId/mealDay/:mealDayId/meal/:mealId", isAuthenticated, getMealById);
mealPlanRouter.get(
  "/:mealPlanId/mealDay/:mealDayId/meal/:mealId/dishes",
  isAuthenticated,
  getDishesByMeal
);

module.exports = mealPlanRouter;
