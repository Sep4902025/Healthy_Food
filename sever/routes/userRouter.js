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
const {
  updateUserById, searchUserByEmail,
  createUser,
  getAllUsers,
  getUserById,
  submitNutritionistApplication,
  getPendingNutritionists,
  reviewNutritionistApplication,
} = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../middlewares/isAuthenticated");
z
const userRouter = express.Router();

// Các route hiện có
userRouter.get("/", getAllUsers);
userRouter.get("/search", searchUserByEmail);
userRouter.get("/pending-nutritionists", isAuthenticated, isAdmin, getPendingNutritionists);
userRouter.get("/:id", getUserById);
userRouter.post("/", createUser);
userRouter.put("/:id", updateUserById);

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

// Các route mới cho Nutritionist Application
userRouter.post("/submit-nutritionist", isAuthenticated, submitNutritionistApplication); 
userRouter.post("/review-nutritionist", isAuthenticated, isAdmin, reviewNutritionistApplication); 

module.exports = userRouter;