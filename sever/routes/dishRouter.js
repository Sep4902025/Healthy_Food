const express = require("express");
const dishRouter = express.Router();
const { isAuthenticated, isAdmin, isNutritionist } = require("../middlewares/isAuthenticated");
const {
  createDish,
  updateDish,
  getDishById,
  getAllDishes,
  deleteDish,
  getDishByType,
  createManyDishes,
  hideDish, // Nếu bạn đã thêm hideDish vào dishController
} = require("../controllers/dishController");

// Routes cho Dish
dishRouter.get("/", getAllDishes);
dishRouter.post("/", isAuthenticated, isNutritionist, createDish);
dishRouter.post("/multiple", isAuthenticated, isNutritionist, createManyDishes);
dishRouter.put("/:dishId", isAuthenticated, isNutritionist, updateDish);
dishRouter.delete("/:dishId", isAuthenticated, isNutritionist, deleteDish);
dishRouter.get("/:dishId", getDishById);
dishRouter.get("/type/:type", getDishByType);
dishRouter.patch("/:dishId/hide", isAuthenticated, isNutritionist, hideDish); // Nếu có hideDish

module.exports = dishRouter;
