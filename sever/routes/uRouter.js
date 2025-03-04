const express = require("express");
const userController = require("../controllers/userController");

const uRouter = express.Router();

uRouter.get("/", userController.getAllUsers);
uRouter.get("/:id", userController.getUserById);
uRouter.patch("/:id", userController.updateUser);
uRouter.delete("/:id", userController.deleteUser);

module.exports = uRouter;
