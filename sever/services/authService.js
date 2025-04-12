const { OAuth2Client } = require("google-auth-library");
const generateOtp = require("../utils/generateOtp");
const AppError = require("../utils/appError");
const UserModel = require("../models/UserModel");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GG_CLIENT_ID);

// Hàm ký token
exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Đăng ký
exports.signup = async (body) => {
  const { email, password, passwordConfirm, username } = body;

  // Kiểm tra xem email đã được đăng ký chưa
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return {
      success: false,
      error: new AppError("Email already registered", 400),
    };
  }

  // Tạo OTP và thời gian hết hạn
  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000; // Thời gian hết hạn là 24 giờ

  // Tạo người dùng mới
  const newUser = await UserModel.create({
    email,
    password,
    passwordConfirm,
    username,
    otp,
    otpExpires,
  });

  // Gửi OTP qua email
  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP for email verification",
      html: `<h1>Your OTP is ${otp}</h1>`,
    });

    return {
      success: true,
      data: { user: newUser },
    };
  } catch (error) {
    console.error("Error sending email:", error);

    // Xóa user nếu có lỗi gửi email
    await UserModel.findByIdAndDelete(newUser._id);

    return {
      success: false,
      error: new AppError("There is an error sending the email. Try again", 500),
    };
  }
};

// Xác minh tài khoản
exports.verifyAccount = async (body) => {
  const { email, otp } = body;

  if (!email || !otp) {
    return {
      success: false,
      error: new AppError("Email and OTP are required", 400),
    };
  }

  // Tìm user bằng email
  const user = await UserModel.findOne({ email });

  if (!user) {
    return {
      success: false,
      error: new AppError("User not found", 404),
    };
  }

  // Kiểm tra thời hạn của OTP
  if (!user.otp || Date.now() > user.otpExpires) {
    return {
      success: false,
      error: new AppError("OTP has expired. Please request a new one", 400),
    };
  }

  // Kiểm tra OTP có đúng không
  if (user.otp !== otp) {
    return {
      success: false,
      error: new AppError("Invalid OTP", 400),
    };
  }

  // Nếu OTP hợp lệ, cập nhật trạng thái tài khoản
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false });

  return {
    success: true,
    data: { user },
  };
};

// Gửi lại OTP
exports.resendOTP = async (body) => {
  const { email } = body;

  if (!email) {
    return {
      success: false,
      error: new AppError("Email is required to resend OTP", 400),
    };
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return {
      success: false,
      error: new AppError("User not found", 404),
    };
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
      subject: "Resend OTP for email verification",
      html: `<h1>Your new OTP is ${newOtp}</h1>`,
    });

    return {
      success: true,
      status: "success",
      message: "A new OTP has been sent to your email successfully.",
    };
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return {
      success: false,
      error: new AppError("There was an error sending the email. Please try again.", 500),
    };
  }
};

// Đăng nhập
exports.login = async (body) => {
  const { email, password } = body;

  if (!email || !password) {
    return {
      success: false,
      error: new AppError("Please provide email and password", 400),
    };
  }

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return {
      success: false,
      error: new AppError("Incorrect Email or password", 401),
    };
  }

  return {
    success: true,
    data: { user },
  };
};

// Đăng nhập bằng Google
exports.googleLogin = async (body) => {
  const { idToken } = body;
  if (!idToken) {
    return {
      success: false,
      error: new AppError("No Google token provided", 400),
    };
  }

  // Xác thực token với Google
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GG_CLIENT_ID,
  });

  const { sub, email, name, picture } = ticket.getPayload(); // `sub` là Google ID

  // Tìm người dùng trong DB
  let user = await UserModel.findOne({ email });

  if (!user) {
    // Nếu chưa có, tạo tài khoản mới (kèm googleId)
    user = await UserModel.create({
      username: name,
      email,
      avatarUrl: picture,
      googleId: sub, // Lưu Google ID để tránh yêu cầu password
    });
  }

  return {
    success: true,
    data: { user },
  };
};

// Quên mật khẩu
exports.forgetPassword = async (body) => {
  const { email } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return {
      success: false,
      error: new AppError("No user found with that email", 404),
    };
  }

  // Tạo OTP mới
  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = Date.now() + 300000; // 5 phút hết hạn

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 5 min)",
      html: `
        <p>Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:</p> 
        <p>Your OTP is <b>${user.otp}</b></p>        
        <p>If you didn't forget your password, please ignore this email!</p>
      `,
    });

    return {
      success: true,
      status: "success",
      message: "Password reset OTP has been sent to your email.",
    };
  } catch (err) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return {
      success: false,
      error: new AppError("There was an error sending the email. Try again later!", 500),
    };
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (body) => {
  const { email, password, passwordConfirm } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return {
      success: false,
      error: new AppError("Invalid email or OTP expired", 400),
    };
  }

  // Cập nhật mật khẩu mới và đánh dấu là đã thay đổi
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.markModified("password"); // Đảm bảo middleware hash chạy

  // Xóa OTP sau khi sử dụng để tránh bị dùng lại
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save(); // Middleware sẽ tự hash mật khẩu

  return {
    success: true,
    data: { user },
  };
};

// Thay đổi mật khẩu
exports.changePassword = async (body, reqUser) => {
  const { currentPassword, newPassword, newPasswordConfirm } = body;

  // Kiểm tra các trường bắt buộc
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return {
      success: false,
      error: new AppError("Please provide all required fields", 400),
    };
  }

  // Kiểm tra xác thực user
  if (!reqUser || !reqUser._id) {
    return {
      success: false,
      error: new AppError("Authentication required. Please log in.", 401),
    };
  }

  // Tìm user và lấy password đã băm
  const user = await UserModel.findById(reqUser._id).select("+password");
  if (!user) {
    return {
      success: false,
      error: new AppError("User not found", 404),
    };
  }

  // Kiểm tra mật khẩu hiện tại
  const isPasswordCorrect = await user.correctPassword(currentPassword, user.password);
  if (!isPasswordCorrect) {
    return {
      success: false,
      error: new AppError("Current password is incorrect", 400),
    };
  }

  // Kiểm tra mật khẩu mới và xác nhận có khớp không
  if (newPassword !== newPasswordConfirm) {
    return {
      success: false,
      error: new AppError("New password and confirmation do not match", 400),
    };
  }

  // Gán mật khẩu mới (middleware pre('save') sẽ tự động băm)
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  // Lưu user và xử lý lỗi validation nếu có
  try {
    await user.save();
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        success: false,
        error: new AppError("New password does not meet requirements", 400),
      };
    }
    return {
      success: false,
      error: new AppError("Error saving new password", 500),
    };
  }

  return {
    success: true,
    data: { user },
  };
};
