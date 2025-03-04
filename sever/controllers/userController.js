const UserModel = require("../models/UserModel");
const UserPreference = require("../models/UserPreference"); // Import UserPreference model
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// 📌 Lấy danh sách tất cả người dùng (bỏ qua user đã xóa)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await UserModel.find({ isDelete: false }).populate("user_preference_id");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

// 📌 Lấy thông tin chi tiết một người dùng theo ID (bỏ qua user đã xóa)
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOne({
    _id: req.params.id,
    isDelete: false, // Chỉ lấy user chưa bị xóa
  }).populate("user_preference_id");

  if (!user) {
    return next(new AppError("User not found or has been deleted", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// 📌 Cập nhật thông tin người dùng (chỉ cập nhật user chưa bị xóa)
exports.updateUser = catchAsync(async (req, res, next) => {
  const { username, avatar_url, role, isBan, isDelete } = req.body;

  const user = await UserModel.findOneAndUpdate(
    { _id: req.params.id, isDelete: false }, // Chỉ update nếu user chưa bị xóa
    { username, avatar_url, role, isBan, isDelete },
    { new: true, runValidators: true }
  ).populate("user_preference_id");

  if (!user) {
    return next(new AppError("User not found or has been deleted", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: { user },
  });
});

// 📌 Xóa người dùng (Soft Delete) - chỉ xóa nếu user chưa bị xóa trước đó
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOneAndUpdate(
    { _id: req.params.id, isDelete: false }, // Chỉ xóa nếu user chưa bị xóa
    { isDelete: true },
    { new: true }
  );

  if (!user) {
    return next(new AppError("User not found or has been deleted", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});
