const Dish = require("../models/Dish");
const Recipe = require("../models/Recipe");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

exports.createDish = async (data) => {
  const existingDish = await Dish.findOne({ 
    name: data.name, 
    isDelete: false 
  });
  
  if (existingDish) {
    throw Object.assign(new Error("Dish with this name already exists"), { status: 400 });
  }

  const newDish = new Dish(data);
  return await newDish.save();
};

exports.createManyDishes = async (dishes) => {
  if (!Array.isArray(dishes) || dishes.length === 0) {
    throw new Error("Input should be a non-empty array of dishes");
  }
  return await Dish.insertMany(dishes);
};

exports.getAllDishes = async (query) => {
  const { page = 1, limit = 10, search = "", sort = "createdAt", order = "desc" } = query;
  let filter = { isDelete: false, isVisible: true }; // Default filter for all roles except nutritionist

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


exports.getAllDishesForNutri = async (query) => {
  const { page = 1, limit = 10, search = "", sort = "createdAt", order = "desc" } = query;
  let filter = { isDelete: false }; // Filter for nutritionists

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
  const updatedDish = await Dish.findByIdAndUpdate(
    dishId,
    { isDelete: true },
    { new: true }
  );
  if (!updatedDish) throw Object.assign(new Error("Dish not found"), { status: 404 });
  return updatedDish;
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
