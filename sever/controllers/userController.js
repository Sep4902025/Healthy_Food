const UserModel = require("../models/UserModel");
// Import UserPreference model
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const sendEmail = require("../utils/email");

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
  const users = await UserModel.find(query)
    .skip(skip)
    .limit(limit)
    .populate("userPreferenceId");

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
  //isBan
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

// Add this function to your userController.js file

// 📌 Create new user
exports.createUser = catchAsync(async (req, res, next) => {
  try {
    const { userName, email, phoneNumber, gender, status, role, profileImage } =
      req.body;

    // Check if user with this email already exists
    const existingUser = await UserModel.findOne({ email, isDelete: false });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 409));
    }

    // Create temporary password (users should change this after first login)
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create new user with all required fields
    const newUser = await UserModel.create({
      userName,
      email,
      password: tempPassword, // This should be hashed in your UserModel pre-save hook
      phoneNumber: phoneNumber || "",
      gender: gender || "",
      status: status || "active", // Default to active if not provided
      role: role || "user", // Default to user if not provided
      profileImage: profileImage || "",
      isVerified: true, // Since this is admin-created account, mark as verified
      isDelete: false, // Not deleted by default
      // Add any other required fields in your UserModel with default values
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: userResponse,
        tempPassword, // Only sent in response for admin to share with new user
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return next(new AppError(`Error creating user: ${error.message}`, 500));
  }
});

// 📌 Nộp CV để trở thành Nutritionist
exports.submitNutritionistApplication = catchAsync(async (req, res, next) => {
  const { personalInfo, profileImage, introduction } = req.body;

  if (!req.user || !req.user._id) {
    return next(new AppError("Unauthorized: No user found in request", 401));
  }

  const userId = req.user._id;

  // Kiểm tra xem user đã nộp đơn chưa
  const user = await UserModel.findById(userId);
  if (!user) return next(new AppError("User not found", 404));
  if (user.nutritionistApplication) {
    return next(new AppError("You have already submitted an application", 400));
  }

  // Cập nhật chỉ trường nutritionistApplication
  const updatedUser = await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        nutritionistApplication: {
          personalInfo,
          profileImage,
          introduction,
          status: "pending",
          submittedAt: new Date(),
        },
      },
    }
  );

  if (updatedUser.modifiedCount === 0) {
    return next(new AppError("Failed to submit application", 500));
  }

  // Lấy lại user để trả về response
  const updatedUserDoc = await UserModel.findById(userId);

  // await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Application submitted successfully",
    data: { application: updatedUserDoc.nutritionistApplication },
  });
});

// 📌 Lấy danh sách user chờ phê duyệt Nutritionist
exports.getPendingNutritionists = catchAsync(async (req, res, next) => {
  const users = await UserModel.find({
    "nutritionistApplication.status": "pending",
    isDelete: false,
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

// 📌 Phê duyệt hoặc từ chối Nutritionist
exports.reviewNutritionistApplication = catchAsync(async (req, res, next) => {
  const { userId, action } = req.body;

  const user = await UserModel.findById(userId);
  if (!user || !user.nutritionistApplication) {
    return next(new AppError("User or application not found", 404));
  }

  if (user.nutritionistApplication.status !== "pending") {
    return next(new AppError("Application has already been reviewed", 400));
  }

  let emailSubject, emailHtml;

  if (action === "approve") {
    user.nutritionistApplication.status = "approved";
    user.role = "nutritionist";
    emailSubject =
      "Chúc mừng! Đơn xin trở thành Nutritionist của bạn đã được phê duyệt";
    emailHtml = `
      <h2>Chúc mừng ${user.username}!</h2>
      <p>Chúng tôi rất vui mừng thông báo rằng đơn xin trở thành Nutritionist của bạn đã được phê duyệt.</p>
      <p>Bạn giờ đây có thể bắt đầu hoạt động với vai trò Nutritionist trên hệ thống Healthy Food.</p>
      <p>Trân trọng,<br/>Đội ngũ Healthy Food</p>
    `;
  } else if (action === "reject") {
    emailSubject = "Thông báo về đơn xin trở thành Nutritionist";
    emailHtml = `
      <h2>Xin chào ${user.username},</h2>
      <p>Chúng tôi rất tiếc phải thông báo rằng đơn xin trở thành Nutritionist của bạn đã bị từ chối.</p>
      <p>Bạn có thể nộp lại đơn đăng ký nếu muốn. Vui lòng kiểm tra và bổ sung thông tin cần thiết trước khi nộp lại.</p>
      <p>Trân trọng,<br/>Đội ngũ Healthy Food</p>
    `;
    user.nutritionistApplication = null;
  } else {
    return next(new AppError("Invalid action", 400));
  }

  await user.save();

  // Gửi email thông báo
  try {
    await sendEmail({
      email: user.email,
      subject: emailSubject,
      html: emailHtml,
    });
    console.log(`Email sent to ${user.email} for ${action} action`);
  } catch (emailError) {
    console.error(`Failed to send email to ${user.email}:`, emailError);
    // Có thể thêm thông báo trong response nếu muốn
    return res.status(200).json({
      status: "success",
      message: `Application ${action}d successfully, but email notification failed`,
      data: { user },
      emailError: emailError.message,
    });
  }

  res.status(200).json({
    status: "success",
    message: `Application ${action}d successfully`,
    data: { user },
  });
});
