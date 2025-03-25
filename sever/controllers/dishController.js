const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const Dish = require("../models/Dish");
const Ingredient = require("../models/Ingredient");
const Ingredients = require("../models/Ingredient"); // Có thể gộp với Ingredient nếu cùng model
const Recipe = require("../models/Recipe");

// Dish CRUD Operations

// Create Dish
exports.createDish = async (req, res) => {
  try {
    const newDish = new Dish(req.body);
    await newDish.save();
    res.status(201).json({ status: "success", data: newDish });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Create Many Dishes
exports.createManyDishes = async (req, res) => {
  try {
    const dishes = req.body;
    if (!Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Input should be a non-empty array of dishes",
      });
    }
    const createdDishes = await Dish.insertMany(dishes);
    res.status(201).json({ status: "success", data: createdDishes });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Read all Dishes with Pagination
exports.getAllDishes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    let filter = { isDelete: false, isVisible: true };

    // Xử lý token và phân quyền
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
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

    // Thêm điều kiện tìm kiếm theo tên nếu có
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Tính toán phân trang
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Lấy tổng số tài liệu và danh sách món ăn
    const totalItems = await Dish.countDocuments(filter);
    const dishes = await Dish.find(filter)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        items: dishes,
        total: totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Read Dish by ID
exports.getDishById = async (req, res) => {
  try {
    const dish = await Dish.findOne({
      _id: req.params.dishId,
      isDelete: false,
      isVisible: true,
    });
    if (!dish) {
      return res.status(404).json({ status: "fail", message: "Dish not found" });
    }
    res.status(200).json({ status: "success", data: dish });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get Dish By Type with Pagination
exports.getDishByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const filter = { type, isDelete: false, isVisible: true };
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Dish.countDocuments(filter);
    const dishes = await Dish.find(filter)
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (dishes.length === 0) {
      return res.status(404).json({ status: "fail", message: "No dishes found for this type" });
    }

    res.status(200).json({
      status: "success",
      data: {
        items: dishes,
        total: totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Update Dish
exports.updateDish = async (req, res) => {
  try {
    const updatedDish = await Dish.findByIdAndUpdate(req.params.dishId, req.body, { new: true });
    if (!updatedDish) return res.status(404).json({ status: "fail", message: "Dish not found" });
    res.status(200).json({ status: "success", data: updatedDish });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Delete Dish
exports.deleteDish = async (req, res) => {
  try {
    const deletedDish = await Dish.findByIdAndDelete(req.params.dishId);
    if (!deletedDish) {
      return res.status(404).json({ status: "fail", message: "Dish not found" });
    }
    if (deletedDish.recipeId) {
      await Recipe.findByIdAndDelete(deletedDish.recipeId);
    }
    res.status(200).json({ status: "success", message: "Dish permanently deleted" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Hide Dish
exports.hideDish = async (req, res) => {
  try {
    const hiddenDish = await Dish.findByIdAndUpdate(
      req.params.dishId,
      { isVisible: false },
      { new: true, runValidators: true }
    );
    if (!hiddenDish) {
      return res.status(404).json({ status: "fail", message: "Dish not found" });
    }
    if (hiddenDish.recipeId) {
      await Recipe.findByIdAndUpdate(hiddenDish.recipeId, { isVisible: false });
    }
    res.status(200).json({
      status: "success",
      message: "Dish has been hidden",
      data: hiddenDish,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Ingredients CRUD Operations

// Create Ingredient
exports.createIngredient = async (req, res) => {
  try {
    const newIngredient = new Ingredients(req.body);
    await newIngredient.save();
    res.status(201).json({ status: "success", data: newIngredient });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Create Many Ingredients
exports.createManyIngredients = async (req, res) => {
  try {
    const ingredients = req.body;
    if (!Array.isArray(ingredients)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Input should be an array of ingredients" });
    }
    const createdIngredients = await Ingredients.insertMany(ingredients);
    res.status(201).json({ status: "success", data: createdIngredients });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Get all Ingredients with Pagination
exports.getAllIngredients = async (req, res) => {
  try {
    const { page = 1, limit = 10, type = "all", search = "" } = req.query;
    let filter = { isDelete: false, isVisible: true };

    // Xử lý token và phân quyền
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
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

    // Thêm bộ lọc type và search
    if (type !== "all") filter.type = type;
    if (search) filter.name = { $regex: search, $options: "i" };

    // Tính toán phân trang
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Lấy tổng số tài liệu và danh sách nguyên liệu
    const totalItems = await Ingredients.countDocuments(filter);
    const ingredients = await Ingredients.find(filter)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        items: ingredients,
        total: totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Read Ingredient by ID
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredients.findById(req.params.ingredientId);
    if (!ingredient)
      return res.status(404).json({ status: "fail", message: "Ingredient not found" });
    res.status(200).json({ status: "success", data: ingredient });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Update Ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const updatedIngredient = await Ingredients.findByIdAndUpdate(
      req.params.ingredientId,
      req.body,
      { new: true }
    );
    if (!updatedIngredient)
      return res.status(404).json({ status: "fail", message: "Ingredient not found" });
    res.status(200).json({ status: "success", data: updatedIngredient });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Delete Ingredient
exports.deleteIngredient = async (req, res) => {
  try {
    const deletedIngredient = await Ingredients.findByIdAndDelete(req.params.ingredientId);
    if (!deletedIngredient) {
      return res.status(404).json({ status: "fail", message: "Ingredient not found" });
    }
    res.status(200).json({ status: "success", message: "Ingredient permanently deleted" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Hide Ingredient
exports.hideIngredient = async (req, res) => {
  try {
    console.log("Hiding ingredient ID:", req.params.ingredientId);
    const hiddenIngredient = await Ingredients.findByIdAndUpdate(
      req.params.ingredientId,
      { isVisible: false },
      { new: true, runValidators: true }
    );
    if (!hiddenIngredient) {
      return res.status(404).json({ status: "fail", message: "Ingredient not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Ingredient has been hidden",
      data: hiddenIngredient,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Search Ingredients by Name with Pagination
exports.searchIngredientsByName = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    if (!name) {
      return res.status(400).json({ status: "fail", message: "Name query parameter is required" });
    }

    const filter = { name: { $regex: name, $options: "i" }, isDelete: false };
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Ingredients.countDocuments(filter);
    const ingredients = await Ingredients.find(filter)
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (ingredients.length === 0) {
      return res.status(404).json({ status: "fail", message: "Ingredient not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        items: ingredients,
        total: totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Filter Ingredients by Type with Pagination
exports.filterIngredientsByType = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    if (!type) {
      return res.status(400).json({ status: "fail", message: "Type query parameter is required" });
    }

    const filter = { type, isDelete: false };
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Ingredients.countDocuments(filter);
    const ingredients = await Ingredients.find(filter)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        items: ingredients,
        total: totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Recipe CRUD Operations

// Get all Recipes with Pagination
exports.getAllRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    let filter = { isDelete: false };

    // Xử lý token và phân quyền
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
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

    res.status(200).json({
      status: "success",
      data: {
        items: recipes,
        total: totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Create Recipe
exports.createRecipe = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: "fail", message: "User not found" });
    }

    if (user.role !== "admin" && user.role !== "nutritionist") {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You do not have permission to create recipes",
      });
    }

    const { dishId } = req.params;
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ status: "fail", message: "Dish not found" });
    }

    let totalCalories = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFat = 0;

    for (const ingredientItem of req.body.ingredients) {
      const ingredientInfo = await Ingredient.findById(ingredientItem.ingredientId);
      if (!ingredientInfo) {
        return res.status(404).json({
          status: "fail",
          message: `Ingredient with ID ${ingredientItem.ingredientId} not found`,
        });
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

    const recipeData = {
      ...req.body,
      dishId,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };

    const newRecipe = await Recipe.create(recipeData);

    dish.recipeId = newRecipe._id;
    dish.calories = totalCalories;
    dish.protein = totalProtein;
    dish.carbs = totalCarbs;
    dish.fat = totalFat;
    if (req.body.totalServing) dish.totalServing = req.body.totalServing;
    if (req.body.cookingTime) dish.cookingTime = req.body.cookingTime;
    await dish.save();

    res.status(201).json({
      status: "success",
      data: newRecipe,
      nutritionInfo: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
    });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Read Recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const { dishId, recipeId } = req.params;
    const recipe = await Recipe.findById(recipeId)
      .populate("dishId")
      .populate({
        path: "ingredients.ingredientId",
        match: { isDelete: false, isVisible: true },
      });
    if (!recipe) {
      return res.status(404).json({ status: "fail", message: "Recipe not found" });
    }
    if (!recipe.dishId) {
      return res.status(404).json({
        status: "fail",
        message: "Associated dish not found",
      });
    }
    if (recipe.dishId._id.toString() !== dishId) {
      return res.status(404).json({
        status: "fail",
        message: "Dish ID does not match the recipe's associated dish",
      });
    }
    if (recipe.dishId.isDelete || !recipe.dishId.isVisible) {
      return res.status(404).json({
        status: "fail",
        message: "Associated dish is deleted or hidden",
      });
    }
    recipe.ingredients = recipe.ingredients.filter((ing) => ing.ingredientId);
    res.status(200).json({ status: "success", data: recipe });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Update Recipe
exports.updateRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ status: "fail", message: "Recipe not found" });
    }

    if (req.body.ingredients) {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const ingredientItem of req.body.ingredients) {
        const ingredientInfo = await Ingredient.findById(ingredientItem.ingredientId);
        if (ingredientInfo) {
          let conversionFactor = ingredientItem.quantity / 100;
          if (ingredientItem.unit === "tbsp") {
            conversionFactor = (ingredientItem.quantity * 15) / 100;
          } else if (ingredientItem.unit === "tsp" || ingredientItem.unit === "tp") {
            conversionFactor = (ingredientItem.quantity * 5) / 100;
          }
          totalCalories += (ingredientInfo.calories || 0) * conversionFactor;
          totalProtein += (ingredientInfo.protein || 0) * conversionFactor;
          totalCarbs += (ingredientInfo.carbs || 0) * conversionFactor;
          totalFat += (ingredientInfo.fat || 0) * conversionFactor;
        } else {
          return res.status(404).json({
            status: "fail",
            message: `Ingredient with ID ${ingredientItem.ingredientId} not found`,
          });
        }
      }
      totalCalories = Math.round(totalCalories * 100) / 100;
      totalProtein = Math.round(totalProtein * 100) / 100;
      totalCarbs = Math.round(totalCarbs * 100) / 100;
      totalFat = Math.round(totalFat * 100) / 100;

      req.body.totalCalories = totalCalories;
      req.body.totalProtein = totalProtein;
      req.body.totalCarbs = totalCarbs;
      req.body.totalFat = totalFat;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.recipeId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRecipe) {
      return res.status(404).json({ status: "fail", message: "Recipe not found" });
    }

    const dish = await Dish.findById(updatedRecipe.dishId);
    if (dish) {
      dish.calories = updatedRecipe.totalCalories;
      dish.protein = updatedRecipe.totalProtein;
      dish.carbs = updatedRecipe.totalCarbs;
      dish.fat = updatedRecipe.totalFat;
      if (req.body.totalServing) {
        dish.totalServing = req.body.totalServing;
      }
      if (req.body.cookingTime) {
        dish.cookingTime = req.body.cookingTime;
      }
      await dish.save();
    }

    res.status(200).json({ status: "success", data: updatedRecipe });
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Delete Recipe
exports.deleteRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ status: "fail", message: "Công thức không tồn tại" });
    }

    const dish = await Dish.findById(recipe.dishId);
    if (!dish) {
      return res.status(200).json({
        status: "success",
        message: "Công thức đã được xóa, nhưng không tìm thấy món ăn liên quan",
      });
    }

    dish.recipeId = null;
    dish.cookingTime = 0;
    dish.calories = 0;
    dish.protein = 0;
    dish.carbs = 0;
    dish.fat = 0;
    dish.totalServing = 0;
    await dish.save();

    return res.status(200).json({ status: "success", message: "Công thức đã được xóa" });
  } catch (error) {
    console.error("Lỗi khi xóa công thức:", error);
    return res.status(400).json({ status: "fail", message: error.message });
  }
};

// Get Recipe by Dish ID
exports.getRecipeByDishId = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findById(recipeId)
      .populate("dishId")
      .populate("ingredients.ingredientId")
      .lean();

    if (!recipe) {
      return res.status(404).json({ status: "fail", message: "Recipe not found" });
    }

    if (recipe.dishId?.isDelete || !recipe.dishId?.isVisible) {
      return res.status(404).json({ status: "fail", message: "Associated dish is deleted or hidden" });
    }

    res.status(200).json({ status: "success", data: recipe });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};