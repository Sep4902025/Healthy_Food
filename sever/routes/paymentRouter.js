const express = require("express");
const paymentRouter = express.Router();
const {
  createPaymentUrl,
  vnpayReturn,
  getAllPayments,
  getPaymentHistory,
  getPaymentById,
  getPaymentHistoryForNutritionist,
  checkPaymentStatus,
  createSalaryPaymentUrl,
  getSalaryPaymentHistory,
  getAllSalaryPaymentHistory,
  vnpayAdminReturn,

} = require("../controllers/paymentController");
const { calculateSalary, sendSalaryEmail } = require("../controllers/paymentController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");


paymentRouter.get("/salary-history/all", getAllSalaryPaymentHistory);


paymentRouter.get("/salary-history/:nutriId", isAuthenticated, getSalaryPaymentHistory);


paymentRouter.get("/", getAllPayments);
paymentRouter.get("/:id", getPaymentById);
paymentRouter.get("/calculate-salary/:nutriId", isAuthenticated, calculateSalary);
paymentRouter.post("/send-salary-email", isAuthenticated, sendSalaryEmail);
paymentRouter.post("/vnpay/salary", isAuthenticated, createSalaryPaymentUrl);
paymentRouter.post("/vnpay/pay", createPaymentUrl);
paymentRouter.get("/vnpay/adminReturn", vnpayAdminReturn);
paymentRouter.get("/vnpay/return", vnpayReturn);
paymentRouter.get("/history/nutritionist", isAuthenticated, getPaymentHistoryForNutritionist);
paymentRouter.get("/history/:userId", isAuthenticated, getPaymentHistory);
paymentRouter.get("/status/:paymentId", isAuthenticated, checkPaymentStatus);
paymentRouter.get("/:paymentId", isAuthenticated, getPaymentById);

module.exports = paymentRouter;