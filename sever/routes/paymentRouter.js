const express = require("express");
const paymentRouter = express.Router();
const { createPaymentUrl, vnpayReturn, getAllPayments, getPaymentById } = require("../controllers/paymentController");

paymentRouter.get("/return", vnpayReturn);
paymentRouter.get("/", getAllPayments);
paymentRouter.get("/:id", getPaymentById);

paymentRouter.post("/pay", createPaymentUrl);

module.exports = paymentRouter;
