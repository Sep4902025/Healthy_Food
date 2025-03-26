const express = require("express");
const paymentRouter = express.Router();
const {
  createPaymentUrl,
  vnpayReturn,
  getPaymentHistory,
  getPaymentById,
} = require("../controllers/paymentController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

paymentRouter.post("/vnpay/pay", createPaymentUrl);
paymentRouter.get("/vnpay/return", vnpayReturn);
// Lấy lịch sử thanh toán của user
paymentRouter.get("/history/:userId", isAuthenticated, getPaymentHistory);
paymentRouter.get("/:paymentId", isAuthenticated, getPaymentById);

module.exports = paymentRouter;
