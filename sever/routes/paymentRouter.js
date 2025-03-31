const express = require("express");
const paymentRouter = express.Router();
const {
  createPaymentUrl,
  vnpayReturn,
  getPaymentHistory,
  getPaymentById,
  getPaymentHistoryForNutritionist,
  checkPaymentStatus,
} = require("../controllers/paymentController");
const { isAuthenticated} = require("../middlewares/isAuthenticated");

paymentRouter.post("/vnpay/pay", createPaymentUrl);
paymentRouter.get("/vnpay/return", vnpayReturn);
paymentRouter.get("/history/nutritionist", isAuthenticated, getPaymentHistoryForNutritionist);
paymentRouter.get("/history/:userId", isAuthenticated, getPaymentHistory);
paymentRouter.get("/status/:paymentId", isAuthenticated, checkPaymentStatus);
paymentRouter.get("/:paymentId", isAuthenticated, getPaymentById);

module.exports = paymentRouter;