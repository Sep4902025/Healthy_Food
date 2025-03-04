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

// Recipe Routes
dishRouter.post("/recipes", createRecipe); // Create a new recipe
dishRouter.get("/recipes/:recipeId", getRecipeById); // Get recipe by ID
dishRouter.put("/recipes/:recipeId", updateRecipeById); // Update recipe
dishRouter.delete("/recipes/:recipeId", deleteRecipeById); // Update recipe

module.exports = dishRouter;
