const Dish = require("../models/Dish");
const Recipe = require("../models/Recipe");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

exports.createDish = async (data) => {
  const newDish = new Dish(data);
  return await newDish.save();
};

exports.createManyDishes = async (dishes) => {
  if (!Array.isArray(dishes) || dishes.length === 0) {
    throw new Error("Input should be a non-empty array of dishes");
  }
  return await Dish.insertMany(dishes);
};

exports.getAllDishes = async (query, token) => {
  const { page = 1, limit = 10, search = "", sort = "createdAt", order = "desc" } = query;
  let filter = { isDelete: false, isVisible: true };

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

  if (search) filter.name = { $regex: search, $options: "i" };

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = order === "desc" ? -1 : 1;
  const sortOptions = { [sort]: sortOrder };

  const totalItems = await Dish.countDocuments(filter);
  const dishes = await Dish.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean();

  return {
    items: dishes,
    total: totalItems,
    currentPage: pageNum,
    totalPages: Math.ceil(totalItems / limitNum),
  };
};

exports.getDishById = async (dishId) => {
  const dish = await Dish.findOne({ _id: dishId, isDelete: false, isVisible: true });
  if (!dish) throw Object.assign(new Error("Dish not found"), { status: 404 });
  return dish;
};

exports.getDishByType = async (type, query) => {
  const { page = 1, limit = 10 } = query;
  const filter = { type, isDelete: false, isVisible: true };
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const totalItems = await Dish.countDocuments(filter);
  const dishes = await Dish.find(filter).skip(skip).limit(limitNum).lean();

  if (dishes.length === 0) throw new Error("No dishes found for this type");

  return {
    items: dishes,
    total: totalItems,
    currentPage: pageNum,
    totalPages: Math.ceil(totalItems / limitNum),
  };
};

exports.updateDish = async (dishId, data) => {
  const updatedDish = await Dish.findByIdAndUpdate(dishId, data, { new: true });
  if (!updatedDish) throw Object.assign(new Error("Dish not found"), { status: 404 });
  return updatedDish;
};

exports.deleteDish = async (dishId) => {
  const deletedDish = await Dish.findByIdAndDelete(dishId);
  if (!deletedDish) throw Object.assign(new Error("Dish not found"), { status: 404 });
  if (deletedDish.recipeId) await Recipe.findByIdAndDelete(deletedDish.recipeId);
};

exports.hideDish = async (dishId) => {
  const hiddenDish = await Dish.findByIdAndUpdate(
    dishId,
    { isVisible: false },
    { new: true, runValidators: true }
  );
  if (!hiddenDish) throw Object.assign(new Error("Dish not found"), { status: 404 });
  if (hiddenDish.recipeId)
    await Recipe.findByIdAndUpdate(hiddenDish.recipeId, { isVisible: false });
  return hiddenDish;
};
