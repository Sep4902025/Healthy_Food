const express = require("express");
const paymentRouter = express.Router();
const {
  createPaymentUrl,
  vnpayReturn,
  getPaymentHistory,
} = require("../controllers/paymentController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

paymentRouter.post("/vnpay/pay", createPaymentUrl);
paymentRouter.get("/vnpay/return", vnpayReturn);
// Lấy lịch sử thanh toán của user
paymentRouter.get("/history/:userId", isAuthenticated, getPaymentHistory);
module.exports = paymentRouter;
