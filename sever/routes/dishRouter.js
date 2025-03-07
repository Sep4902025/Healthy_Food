const express = require("express");
const dishRouter = express.Router();

const {
  createDish,
  updateDish,
  getDishById,
  getAllDishes,
  deleteDish,
  getDishByType,
  createRecipe,
  updateRecipeById,
  getRecipeById,
  deleteRecipeById,
} = require("../controllers/dishController");

// Dish Routes
dishRouter.post("/", createDish); // Create a new dish
dishRouter.get("/", getAllDishes); // Get all dishes
dishRouter.get("/:dishId", getDishById); // Get dish by ID
dishRouter.put("/:dishId", updateDish); // Update dish
dishRouter.delete("/:dishId", deleteDish); // Delete dish
dishRouter.get("/type/:type", getDishByType); // Get dish by type

// Recipe Routes (thuộc một Dish cụ thể)
dishRouter.post("/:dishId/recipes", createRecipe); // Create a new recipe for a dish
dishRouter.get("/:dishId/recipes/:recipeId", getRecipeById); // Get recipe by ID for a dish
dishRouter.put("/:dishId/recipes/:recipeId", updateRecipeById); // Update recipe for a dish
dishRouter.delete("/:dishId/recipes/:recipeId", deleteRecipeById); // Delete recipe for a dish

module.exports = dishRouter;
