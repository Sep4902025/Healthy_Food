const dishService = require("../services/dishService");

exports.createDish = async (req, res) => {
  try {
    const newDish = await dishService.createDish(req.body);
    res.status(201).json({ status: "success", data: newDish });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

exports.createManyDishes = async (req, res) => {
  try {
    const dishes = await dishService.createManyDishes(req.body);
    res.status(201).json({ status: "success", data: dishes });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

exports.getAllDishes = async (req, res) => {
  try {
    const result = await dishService.getAllDishes(
      req.query,
      req.cookies.token || req.headers.authorization?.split(" ")[1]
    );
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

exports.getDishById = async (req, res) => {
  try {
    const dish = await dishService.getDishById(req.params.dishId);
    res.status(200).json({ status: "success", data: dish });
  } catch (error) {
    res.status(error.status || 500).json({ status: "fail", message: error.message });
  }
};

exports.getDishByType = async (req, res) => {
  try {
    const result = await dishService.getDishByType(req.params.type, req.query);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

exports.updateDish = async (req, res) => {
  try {
    const updatedDish = await dishService.updateDish(req.params.dishId, req.body);
    res.status(200).json({ status: "success", data: updatedDish });
  } catch (error) {
    res.status(error.status || 400).json({ status: "fail", message: error.message });
  }
};

exports.deleteDish = async (req, res) => {
  try {
    await dishService.deleteDish(req.params.dishId);
    res.status(200).json({ status: "success", message: "Dish permanently deleted" });
  } catch (error) {
    res.status(error.status || 500).json({ status: "fail", message: error.message });
  }
};

exports.hideDish = async (req, res) => {
  try {
    const hiddenDish = await dishService.hideDish(req.params.dishId);
    res.status(200).json({ status: "success", message: "Dish has been hidden", data: hiddenDish });
  } catch (error) {
    res.status(error.status || 500).json({ status: "fail", message: error.message });
  }
};
