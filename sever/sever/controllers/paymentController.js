const catchAsync = require("../utils/catchAsync");
const paymentService = require("../services/paymentService");

exports.getAllPayments = catchAsync(async (req, res) => {
  const paymentStats = await paymentService.getAllPayments();
  res.status(200).json(paymentStats);
});

exports.createPaymentUrl = catchAsync(async (req, res) => {
  const { userId, mealPlanId, amount } = req.body;
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip || "127.0.0.1";
  const { paymentUrl, paymentId } = await paymentService.createPaymentUrl(
    userId,
    mealPlanId,
    amount,
    clientIp
  );
  res.json({ status: "success", paymentUrl, paymentId });
});

exports.vnpayReturn = catchAsync(async (req, res) => {
  const vnp_Params = { ...req.query };
  const clientType = req.query.clientType || "web";
  const redirectUrl = await paymentService.vnpayReturn(vnp_Params, clientType);
  res.redirect(redirectUrl);
});

exports.getPaymentHistory = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const paymentHistory = await paymentService.getPaymentHistory(userId, page, limit);
  res.json({ status: "success", ...paymentHistory });
});

exports.checkPaymentStatus = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const paymentStatus = await paymentService.checkPaymentStatus(paymentId);
  res.json({ status: "success", data: paymentStatus });
});

exports.getPaymentById = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { _id: userId } = req.user;
  const paymentDetails = await paymentService.getPaymentById(paymentId, userId);
  res.json({ status: "success", data: paymentDetails });
});

exports.getPaymentHistoryForNutritionist = catchAsync(async (req, res) => {
  const payments = await paymentService.getPaymentHistoryForNutritionist();
  res.status(200).json({ success: true, data: payments });
});

exports.calculateSalary = catchAsync(async (req, res) => {
  const { nutriId } = req.params;
  const salaryData = await paymentService.calculateSalary(nutriId);
  res.status(200).json({ status: "success", data: salaryData });
});

exports.getSalaryPaymentHistory = catchAsync(async (req, res) => {
  const { nutriId } = req.params;
  const payments = await paymentService.getSalaryPaymentHistory(nutriId);
  res.status(200).json({ status: "success", data: payments });
});

exports.getSalaryHistoryByMonthYear = catchAsync(async (req, res) => {
  const { month, year } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const salaryHistory = await paymentService.getSalaryHistoryByMonthYear(month, year, page, limit);
  res.status(200).json({ status: "success", ...salaryHistory });
});

exports.acceptSalary = catchAsync(async (req, res) => {
  const { userId, amount, month, year } = req.body;
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip || "127.0.0.1";
  const paymentData = await paymentService.acceptSalary(userId, amount, month, year, clientIp);
  res.status(200).json({ status: "success", data: paymentData });
});

exports.vnpayAdminReturn = catchAsync(async (req, res) => {
  const vnp_Params = req.query;
  const redirectUrl = await paymentService.vnpayAdminReturn(vnp_Params);
  res.redirect(redirectUrl);
});
