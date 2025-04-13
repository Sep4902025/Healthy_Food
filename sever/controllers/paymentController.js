const catchAsync = require("../utils/catchAsync");
const paymentService = require("../services/paymentService");

exports.getAllPayments = catchAsync(async (req, res) => {
  const paymentStats = await paymentService.getAllPayments();
  res.status(200).json(paymentStats);
});

// Web-specific payment controllers
exports.createPaymentUrlWeb = catchAsync(async (req, res) => {
  const { userId, mealPlanId, amount } = req.body;
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip || "127.0.0.1";
  const { paymentUrl, paymentId } = await paymentService.createPaymentUrlWeb(
    userId,
    mealPlanId,
    amount,
    clientIp
  );
  res.json({ status: "success", paymentUrl, paymentId });
});

exports.vnpayReturnWeb = catchAsync(async (req, res) => {
  const vnp_Params = { ...req.query };
  const redirectUrl = await paymentService.vnpayReturnWeb(vnp_Params);
  res.redirect(redirectUrl);
});

// App-specific payment controllers
exports.createPaymentUrlApp = catchAsync(async (req, res) => {
  const { userId, mealPlanId, amount } = req.body;
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip || "127.0.0.1";
  const { paymentUrl, paymentId } = await paymentService.createPaymentUrlApp(
    userId,
    mealPlanId,
    amount,
    clientIp
  );
  res.json({ status: "success", paymentUrl, paymentId });
});
// chưa chia Controller Service
exports.vnpayReturnApp = catchAsync(async (req, res) => {
  console.log("vnpayReturnApp called at:", new Date().toISOString());
  console.log("Request method:", req.method); // Log phương thức yêu cầu (GET hoặc POST)
  console.log("Raw query:", req.query); // Log req.query để kiểm tra
  console.log("Raw body:", req.body); // Log req.body để kiểm tra

  const vnp_Params = req.query && Object.keys(req.query).length > 0 ? req.query : req.body;
  console.log("Received VNPay callback:", vnp_Params);

  if (!vnp_Params || Object.keys(vnp_Params).length === 0) {
    console.error("No parameters received from VNPay");
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            text-align: center;
          }
          .container {
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #dc3545;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Lỗi</h1>
          <p>Không nhận được tham số từ VNPay. Vui lòng thử lại.</p>
        </div>
      </body>
      </html>
    `);
  }

  const result = await paymentService.handleVnpayReturnApp(vnp_Params);
  console.log("Result from handleVnpayReturnApp:", result);

  if (!result || typeof result !== "object") {
    throw new Error("Invalid result from handleVnpayReturnApp");
  }

  const { status, message } = result;

  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Result</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
          text-align: center;
        }
        .container {
          padding: 20px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: ${status === "success" ? "#28a745" : "#dc3545"};
        }
        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${status === "success" ? "Thành công!" : "Thất bại"}</h1>
        <p>${message}</p>        
      </div>
    </body>
    </html>
  `);
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
  console.log("Received request to check payment status for paymentId:", paymentId);

  const paymentStatus = await paymentService.checkPaymentStatus(paymentId);

  res.json({
    status: "success",
    data: paymentStatus,
  });
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
