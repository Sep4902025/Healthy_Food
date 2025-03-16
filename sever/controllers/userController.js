const UserModel = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

// 🟢 Get all users (Admin only)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await UserModel.find({ isDelete: false }); // Chỉ lấy user chưa bị xóa mềm
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

// 🟢 Get user by ID
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.params._id); // Đổi từ userId -> id
  if (!user || user.isDelete) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// Update User By ID
exports.updateUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await UserModel.findByIdAndUpdate(id, updates, {
    new: true, // Trả về user sau khi cập nhật
    runValidators: true, // Chạy validation trên dữ liệu cập nhật
  });

  if (!user || user.isDelete) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});




// 🔴 Soft delete user (Chỉ admin)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    { isDelete: true },
    { new: true }
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
  });
});

// 🟢 Restore user (Chỉ admin)
exports.restoreUser = catchAsync(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    { isDelete: false },
    { new: true }
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    message: "User restored successfully",
    data: { user },
  });
});
