const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
} = require("../controllers/userController");
const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin"); // Middleware kiểm tra quyền admin

const userRouter = express.Router();

// 🟢 Lấy danh sách tất cả người dùng (Chỉ admin)
userRouter.get("/", isAuthenticated, isAdmin, getAllUsers);

// 🟢 Lấy thông tin user theo ID
userRouter.get("/:id", isAuthenticated, getUserById);

// 🟡 Cập nhật thông tin user (chỉ user đó hoặc admin)
userRouter.patch("/:id", isAuthenticated, updateUser);

// 🔴 Xóa mềm user (Chỉ admin)
userRouter.delete("/:id", isAuthenticated, isAdmin, deleteUser);

// 🟢 Khôi phục user đã xóa (Chỉ admin)
userRouter.post("/:id/restore", isAuthenticated, isAdmin, restoreUser);

module.exports = userRouter;
