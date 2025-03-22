const UserModel = require("../models/UserModel");
// Import UserPreference model
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

// 📌 Lấy danh sách tất cả người dùng (bỏ qua user đã xóa)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Lấy các query parameters từ request
  const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
  const limit = parseInt(req.query.limit) || 10; // Mặc định 10 users mỗi trang
  const skip = (page - 1) * limit; // Tính số bản ghi cần bỏ qua

  const currentAdminId = req.user?._id;

  // Điều kiện lọc: không bao gồm người dùng đã xóa và không phải admin đang đăng nhập
  const query = {
    isDelete: false,
    _id: { $ne: currentAdminId }, // Loại trừ admin đang đăng nhập
  };

  // Đếm tổng số người dùng thỏa mãn điều kiện
  const totalUsers = await UserModel.countDocuments(query);

  // Lấy danh sách người dùng với phân trang
  const users = await UserModel.find(query).skip(skip).limit(limit).populate("userPreferenceId");

  // Tính tổng số trang
  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    status: "success",
    results: users.length,
    total: totalUsers,
    totalPages: totalPages,
    currentPage: page,
    data: { users },
  });
});

// 📌 Lấy thông tin chi tiết một người dùng theo ID (bỏ qua user đã xóa)
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOne({
    _id: req.params.id,
    isDelete: false, // Chỉ lấy user chưa bị xóa
  }).populate("userPreferenceId");

  if (!user) {
    return next(new AppError("User not found or has been deleted", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
exports.searchUserByEmail = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(new AppError("Please provide an email to search", 400));
  }

  const users = await UserModel.find({
    email: { $regex: email, $options: "i" }, // Tìm kiếm gần đúng, không phân biệt hoa/thường
    isDelete: false,
  })
    .select("_id username email avatarUrl role") // Thêm _id vào kết quả
    .limit(10); // Giới hạn 10 kết quả

  if (!users.length) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: { users: [] },
    });
  }

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
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
    message: "User updated successfully",
    data: { user },
  });
});

// 📌 Xóa người dùng (Soft Delete) - chỉ xóa nếu user chưa bị xóa trước đó
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,

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
