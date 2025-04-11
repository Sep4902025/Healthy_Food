const Recipe = require("../models/Recipe");
const Dish = require("../models/Dish");
const Ingredient = require("../models/Ingredient");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

exports.getAllRecipes = async (query, token) => {
  const { page = 1, limit = 10 } = query;
  let filter = { isDelete: false };

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await UserModel.findById(decoded.id);
      if (user && (user.role === "admin" || user.role === "nutritionist")) {
        filter = {};
      }
    } catch (error) {
      console.error("Invalid token:", error.message);
    }
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const totalItems = await Recipe.countDocuments(filter);
  const recipes = await Recipe.find(filter)
    .populate("dishId")
    .populate("ingredients.ingredientId")
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    items: recipes,
    total: totalItems,
    currentPage: pageNum,
    totalPages: Math.ceil(totalItems / limitNum),
  };
};

exports.createRecipe = async (dishId, data, token) => {
  if (!token) throw Object.assign(new Error("Unauthorized"), { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await UserModel.findById(decoded.id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 401 });
  if (user.role !== "admin" && user.role !== "nutritionist") {
    throw Object.assign(new Error("Forbidden: You do not have permission to create recipes"), {
      status: 403,
    });
  }

  const dish = await Dish.findById(dishId);
  if (!dish) throw Object.assign(new Error("Dish not found"), { status: 404 });

  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFat = 0;

  for (const ingredientItem of data.ingredients) {
    const ingredientInfo = await Ingredient.findById(ingredientItem.ingredientId);
    if (!ingredientInfo) {
      throw Object.assign(
        new Error(`Ingredient with ID ${ingredientItem.ingredientId} not found`),
        { status: 404 }
      );
    }

    let conversionFactor = ingredientItem.quantity / 100;
    if (ingredientItem.unit === "tbsp") conversionFactor = (ingredientItem.quantity * 15) / 100;
    if (ingredientItem.unit === "tsp" || ingredientItem.unit === "tp")
      conversionFactor = (ingredientItem.quantity * 5) / 100;

    totalCalories += (ingredientInfo.calories || 0) * conversionFactor;
    totalProtein += (ingredientInfo.protein || 0) * conversionFactor;
    totalCarbs += (ingredientInfo.carbs || 0) * conversionFactor;
    totalFat += (ingredientInfo.fat || 0) * conversionFactor;
  }

  totalCalories = Math.round(totalCalories * 100) / 100;
  totalProtein = Math.round(totalProtein * 100) / 100;
  totalCarbs = Math.round(totalCarbs * 100) / 100;
  totalFat = Math.round(totalFat * 100) / 100;

  const recipeData = { ...data, dishId, totalCalories, totalProtein, totalCarbs, totalFat };
  const newRecipe = await Recipe.create(recipeData);

  dish.recipeId = newRecipe._id;
  dish.calories = totalCalories;
  dish.protein = totalProtein;
  dish.carbs = totalCarbs;
  dish.fat = totalFat;
  if (data.totalServing) dish.totalServing = data.totalServing;
  if (data.cookingTime) dish.cookingTime = data.cookingTime;
  await dish.save();

  return {
    recipe: newRecipe,
    nutritionInfo: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    },
  };
};

exports.getRecipeById = async (dishId, recipeId) => {
  const recipe = await Recipe.findById(recipeId)
    .populate("dishId")
    .populate({ path: "ingredients.ingredientId", match: { isDelete: false, isVisible: true } });

  if (!recipe) throw Object.assign(new Error("Recipe not found"), { status: 404 });
  if (!recipe.dishId) throw Object.assign(new Error("Associated dish not found"), { status: 404 });
  if (recipe.dishId._id.toString() !== dishId) {
    throw Object.assign(new Error("Dish ID does not match the recipe's associated dish"), {
      status: 404,
    });
  }
  if (recipe.dishId.isDelete || !recipe.dishId.isVisible) {
    throw Object.assign(new Error("Associated dish is deleted or hidden"), { status: 404 });
  }

  recipe.ingredients = recipe.ingredients.filter((ing) => ing.ingredientId);
  return recipe;
};

exports.updateRecipeById = async (recipeId, data) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw Object.assign(new Error("Recipe not found"), { status: 404 });

  if (data.ingredients) {
    let totalCalories = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFat = 0;

    for (const ingredientItem of data.ingredients) {
      const ingredientInfo = await Ingredient.findById(ingredientItem.ingredientId);
      if (!ingredientInfo) {
        throw Object.assign(
          new Error(`Ingredient with ID ${ingredientItem.ingredientId} not found`),
          { status: 404 }
        );
      }

      let conversionFactor = ingredientItem.quantity / 100;
      if (ingredientItem.unit === "tbsp") conversionFactor = (ingredientItem.quantity * 15) / 100;
      if (ingredientItem.unit === "tsp" || ingredientItem.unit === "tp")
        conversionFactor = (ingredientItem.quantity * 5) / 100;

      totalCalories += (ingredientInfo.calories || 0) * conversionFactor;
      totalProtein += (ingredientInfo.protein || 0) * conversionFactor;
      totalCarbs += (ingredientInfo.carbs || 0) * conversionFactor;
      totalFat += (ingredientInfo.fat || 0) * conversionFactor;
    }

    totalCalories = Math.round(totalCalories * 100) / 100;
    totalProtein = Math.round(totalProtein * 100) / 100;
    totalCarbs = Math.round(totalCarbs * 100) / 100;
    totalFat = Math.round(totalFat * 100) / 100;

    data.totalCalories = totalCalories;
    data.totalProtein = totalProtein;
    data.totalCarbs = totalCarbs;
    data.totalFat = totalFat;
  }

  const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, data, {
    new: true,
    runValidators: true,
  });
  if (!updatedRecipe) throw Object.assign(new Error("Recipe not found"), { status: 404 });

  const dish = await Dish.findById(updatedRecipe.dishId);
  if (dish) {
    dish.calories = updatedRecipe.totalCalories;
    dish.protein = updatedRecipe.totalProtein;
    dish.carbs = updatedRecipe.totalCarbs;
    dish.fat = updatedRecipe.totalFat;
    if (data.totalServing) dish.totalServing = data.totalServing;
    if (data.cookingTime) dish.cookingTime = data.cookingTime;
    await dish.save();
  }

  return updatedRecipe;
};

exports.deleteRecipeById = async (recipeId) => {
  const recipe = await Recipe.findByIdAndDelete(recipeId);
  if (!recipe) throw Object.assign(new Error("Công thức không tồn tại"), { status: 404 });

  const dish = await Dish.findById(recipe.dishId);
  if (dish) {
    dish.recipeId = null;
    dish.cookingTime = 0;
    dish.calories = 0;
    dish.protein = 0;
    dish.carbs = 0;
    dish.fat = 0;
    dish.totalServing = 0;
    await dish.save();
  }
};

exports.getRecipeByDishId = async (recipeId) => {
  const recipe = await Recipe.findById(recipeId)
    .populate("dishId")
    .populate("ingredients.ingredientId")
    .lean();
  if (!recipe) throw Object.assign(new Error("Recipe not found"), { status: 404 });
  if (recipe.dishId?.isDelete || !recipe.dishId?.isVisible) {
    throw Object.assign(new Error("Associated dish is deleted or hidden"), { status: 404 });
  }
  return recipe;
};
