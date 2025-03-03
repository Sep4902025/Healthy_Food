const express = require("express");
const mealPlanRouter = express.Router();
const {
  createMealPlan,
  getUserMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
} = require("../controllers/mealPlanController");

// Tạo MealPlan
mealPlanRouter.post("/", createMealPlan);

// Lấy danh sách MealPlan của user
mealPlanRouter.get("/user/:user_id", getUserMealPlans);

// Lấy chi tiết một MealPlan
mealPlanRouter.get("/:id", getMealPlanById);

// Cập nhật MealPlan
mealPlanRouter.put("/:id", updateMealPlan);

// Xóa MealPlan (soft delete)
mealPlanRouter.delete("/:id", deleteMealPlan);

module.exports = mealPlanRouter;
