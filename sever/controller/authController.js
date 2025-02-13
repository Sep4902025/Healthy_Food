const generateOtp = require("../utils/generateOtp");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const UserModel = require("../models/UserModel");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("token", token, cookieOptions);

  // Xóa dữ liệu nhạy cảm trước khi gửi về client
  user.password = undefined;
  user.passwordConfirm = undefined;
  user.otp = undefined;
  user.otpExpires = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user, // Sử dụng trực tiếp user thay vì biến không tồn tại
    },
  });
};
// SignUp
exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, username } = req.body;

  // Kiểm tra xem email đã được đăng ký chưa
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) return next(new AppError("Email already registered", 400));

  // Tạo OTP và thời gian hết hạn
  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000; // Thời gian hết hạn là 24 giờ

  // Tạo người dùng mới
  const newUser = await UserModel.create({
    email,
    password,
    passwordConfirm,
    username,
    otp, // OTP
    otpExpires, // Thời gian hết hạn OTP
  });

  // Gửi OTP qua email
  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP for email verification",
      html: `<h1>Your OTP is ${otp}</h1>`,
    });

    console.log("Email sent successfully");
    await createSendToken(newUser, 200, res, "Registration successful");
  } catch (error) {
    console.error(" Error sending email:", error);

    // Xóa user nếu có lỗi gửi email
    await UserModel.findByIdAndDelete(newUser._id);

    return next(new AppError("There is an error sending the email. Try again", 500));
  }
});
// Verify Account
exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("OTP is missing", 400));
  }

  const user = req.user;

  if (Date.now() > user.otpExpires) {
    return next(new AppError("OTP has expired. Please request a new OTP", 400));
  }

  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  // Nếu OTP hợp lệ, thực hiện các hành động sau:
  user.isVerified = true;
  user.otp = undefined; // Xóa OTP sau khi đã xác thực
  user.otpExpires = undefined; // Xóa thời gian hết hạn OTP

  await user.save({ validateBeforeSave: false }); // Lưu thay đổi vào database

  createSendToken(user, 200, res, "Email has been verified successfully!"); // Gửi token và thông báo thành công
});
// Resend OTP
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.user; // Lấy email từ req.user (đã được lưu bởi middleware xác thực)

  if (!email) {
    return next(new AppError("Email is required to resend OTP", 400));
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.isVerified) {
    return next(new AppError("This account is already verified", 400));
  }

  // Tạo OTP mới
  const newOtp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 giờ

  // Cập nhật user với OTP mới và thời gian hết hạn
  user.otp = newOtp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  // Gửi OTP qua email
  try {
    await sendEmail({
      email: user.email,
      subject: "Resend otp for email verification",
      html: `<h1>Your new OTP is ${newOtp}</h1>`,
    });

    res
      .status(200)
      .json({ status: "success", message: "A new otp has sent to your email successfully" });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There is an error sending the email. Try again", 500));
  }
});
// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or password", 401));
  }

  createSendToken(user, 200, res, "Login Successful");
});
// Logout
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // Thời gian sống của cookie là 10 giây
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax", // SameSite để bảo mật cookie
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});
// Forget Password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body; // Lấy email từ request body

  const user = await UserModel.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with that email", 404)); // Sửa lỗi 484 thành 404
  }
  const otp = generateOtp();
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = Date.now() + 300000; // 5 phút

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 5 min)",
      html: `
      <p>Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:</p> 
      <p>Your OTP is <b>${user.resetPasswordOTP}</b></p>        
      <p>If you didn't forget your password, please ignore this email!</p>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "Password reset otp is send to your email",
    });
  } catch (err) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There is an error sending the email. Try again later!", 500));
  }
});
// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, passwordConfirm } = req.body;

  const user = await UserModel.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("No user found or invalid OTP", 400));
  }

  // Update password and related fields
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;

  await user.save(); // Validate password before saving (important!)

  createSendToken(user, 200, res, "Password reset successfully!");
});
