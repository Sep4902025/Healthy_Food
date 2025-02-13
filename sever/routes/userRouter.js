const express = require("express");
const {
  signup,
  verifyAccount,
  resendOTP,
  login,
  logout,
  forgetPassword,
  resetPassword,
} = require("../controller/authController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const userRouter = express.Router();
userRouter.post("/signup", signup);
userRouter.post("/verify", isAuthenticated, verifyAccount);
userRouter.post("/resend-otp", isAuthenticated, resendOTP);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/forget-password", forgetPassword);
userRouter.post("/reset-password", resetPassword);

module.exports = userRouter;
