const express = require("express");
const {
  signup,
  verifyAccount,
  resendOTP,
  login,
  logout,
  forgetPassword,
  resetPassword,
  googleLogin,
  changePassword,
} = require("../controllers/authController");
const { updateUserById, createUser } = require("../controllers/userController");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { getAllUsers, getUserById } = require("../controllers/userController");

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/", createUser); 

userRouter.put("/:id", updateUserById); 

userRouter.post("/signup", signup);
userRouter.post("/verify", verifyAccount);
userRouter.post("/resend-otp", resendOTP);
userRouter.post("/login", login);
userRouter.post("/login-google", googleLogin);
userRouter.post("/logout", logout);
userRouter.post("/forget-password", forgetPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/change-password", changePassword);







module.exports = userRouter;
