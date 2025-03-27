const express = require("express");
const paymentRouter = express.Router();
const {
  createPaymentUrl,
  vnpayReturn,
  getPaymentHistory,
  getPaymentById,
  getPaymentHistoryForNutritionist,
  getPaymentStatus, // Thêm import hàm này
} = require("../controllers/paymentController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

paymentRouter.post("/vnpay/pay", createPaymentUrl);
paymentRouter.get("/vnpay/return", vnpayReturn);
paymentRouter.get("/history/:userId", isAuthenticated, getPaymentHistory);
paymentRouter.get("/:paymentId", isAuthenticated, getPaymentById);
paymentRouter.get("/history/nutritionist", isAuthenticated, getPaymentHistoryForNutritionist); // Sử dụng hàm đã import
paymentRouter.get("/status/:paymentId", isAuthenticated, getPaymentStatus);

module.exports = paymentRouter;