const querystring = require("querystring");
const crypto = require("crypto");
const moment = require("moment");
const VNPAY_CONFIG = require("../config/vnpay");
const Payment = require("../models/Payment");
const { MealPlan, UserMealPlan } = require("../models/MealPlan");
const UserModel = require("../models/UserModel");
const SalaryPayment = require("../models/SalaryPayment");
const sendEmail = require("../utils/email");
const AppError = require("../utils/appError");

exports.getAllPayments = async () => {
  const payments = await Payment.find();

  const revenueByMonth = {};
  const totalRevenue = payments.reduce((acc, payment) => {
    return payment.status === "success" ? acc + payment.amount : acc;
  }, 0);

  const paymentStats = payments.reduce(
    (acc, payment) => {
      if (payment.status === "success") acc.paid += 1;
      else acc.unpaid += 1;
      return acc;
    },
    { paid: 0, unpaid: 0 }
  );

  payments.forEach((payment) => {
    if (payment.status === "success") {
      const year = moment(payment.paymentDate).format("YYYY");
      const month = moment(payment.paymentDate).format("MM");
      if (!revenueByMonth[year]) revenueByMonth[year] = {};
      if (!revenueByMonth[year][month]) revenueByMonth[year][month] = 0;
      revenueByMonth[year][month] += payment.amount;
    }
  });

  const revenueByYear = payments.reduce((acc, payment) => {
    const year = new Date(payment.paymentDate).getFullYear();
    acc[year] = (acc[year] || 0) + payment.amount;
    return acc;
  }, {});

  return { totalRevenue, paymentStats, revenueByYear, revenueByMonth };
};

exports.createPaymentUrl = async (userId, mealPlanId, amount, clientIp, clientType = "web") => {
  if (!userId || !mealPlanId || !amount) {
    throw Object.assign(new Error("Thiếu userId, mealPlanId hoặc amount"), { status: 400 });
  }
  if (isNaN(amount) || amount <= 0) {
    throw Object.assign(new Error("Amount phải là số dương"), { status: 400 });
  }

  const mealPlan = await MealPlan.findById(mealPlanId);
  if (!mealPlan) {
    throw Object.assign(new Error("MealPlan không tồn tại"), { status: 400 });
  }

  const successPayment = await Payment.findOne({ mealPlanId, status: "success" });
  if (successPayment) {
    throw Object.assign(new Error("MealPlan này đã được thanh toán"), { status: 400 });
  }

  let payment = await Payment.findOne({
    mealPlanId,
    userId,
    status: "pending",
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (!payment) {
    payment = new Payment({
      userId,
      mealPlanId,
      amount,
      status: "pending",
      paymentMethod: "vnpay",
    });
    await payment.save();
  } else if (payment.amount !== amount) {
    payment.amount = amount;
    payment.updatedAt = new Date();
    await payment.save();
  }

  // Chọn vnp_ReturnUrl dựa trên clientType
  const vnp_ReturnUrl =
    clientType === "app" ? VNPAY_CONFIG.vnp_ReturnUrl_App : VNPAY_CONFIG.vnp_ReturnUrl_Web;

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode || "",
    vnp_Amount: Math.round(amount * 100).toString(),
    vnp_CurrCode: "VND",
    vnp_TxnRef: payment._id.toString(),
    vnp_OrderInfo: `Thanh toán MealPlan: ${mealPlanId}`,
    vnp_OrderType: "180000",
    vnp_Locale: "vn",
    vnp_ReturnUrl: `${vnp_ReturnUrl}?clientType=${clientType}`, // Thêm clientType vào query
    vnp_IpAddr: clientIp,
    vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
  };

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params)
      .map(([key, value]) => [key, String(value || "").trim()])
      .sort()
  );
  const signData = new URLSearchParams(sortedParams).toString();
  if (!VNPAY_CONFIG.vnp_HashSecret) throw new Error("vnp_HashSecret không tồn tại hoặc rỗng!");
  const secureHash = crypto
    .createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  sortedParams["vnp_SecureHash"] = secureHash;
  const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${new URLSearchParams(sortedParams).toString()}`;

  return { paymentUrl, paymentId: payment._id };
};

exports.vnpayReturn = async (vnp_Params) => {
  const secureHash = vnp_Params["vnp_SecureHash"];
  const clientType = vnp_Params["clientType"] || "web"; // Lấy clientType từ query
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];
  delete vnp_Params["clientType"]; // Xóa clientType khỏi params để không ảnh hưởng đến hash

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params)
      .map(([key, value]) => [key, String(value || "").trim()])
      .sort()
  );
  const signData = new URLSearchParams(sortedParams).toString();
  const signed = crypto
    .createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  const baseUrl = clientType === "app" ? process.env.MOBILE_CLIENT_URL : process.env.ADMIN_WEB_URL;
  if (secureHash !== signed) {
    return `${baseUrl}?status=error&message=Invalid+signature`;
  }

  const transactionNo = vnp_Params["vnp_TransactionNo"];
  const paymentId = vnp_Params["vnp_TxnRef"];
  const responseCode = vnp_Params["vnp_ResponseCode"];
  const status = responseCode === "00" ? "success" : "failed";

  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    { transactionNo, status, paymentDate: new Date(), paymentDetails: vnp_Params },
    { new: true }
  );
  if (!payment) {
    return `${baseUrl}?status=error&message=Payment+not+found`;
  }

  if (status === "success") {
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      payment.mealPlanId,
      { paymentId: payment._id, isBlock: false },
      { new: true }
    );
    if (!updatedMealPlan) {
      return `${baseUrl}?status=error&message=MealPlan+not+found`;
    }

    const oldUserMealPlan = await UserMealPlan.findOne({ userId: payment.userId });
    if (oldUserMealPlan) {
      oldUserMealPlan.mealPlanId = payment.mealPlanId;
      oldUserMealPlan.startDate = new Date();
      await oldUserMealPlan.save();
    } else {
      await UserMealPlan.create({
        userId: payment.userId,
        mealPlanId: payment.mealPlanId,
        startDate: new Date(),
      });
    }

    await Payment.deleteMany({
      _id: { $ne: payment._id },
      mealPlanId: payment.mealPlanId,
      status: "pending",
    });
  }

  return `${baseUrl}?status=${status}&message=${
    status === "success" ? "Thanh+toán+thành+công" : "Thanh+toán+thất+bại"
  }`;
};

exports.getPaymentHistory = async (userId, page, limit) => {
  const skip = (page - 1) * limit;
  const payments = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  if (!payments || payments.length === 0) {
    throw Object.assign(new Error("Không tìm thấy lịch sử thanh toán"), { status: 404 });
  }

  const paymentDetails = await Promise.all(
    payments.map(async (payment) => {
      const mealPlan = await MealPlan.findById(payment.mealPlanId).select("title").lean();
      return {
        _id: payment._id,
        mealPlanName: mealPlan ? mealPlan.title : "N/A",
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        paymentDate: payment.paymentDate,
        vnpayTransactionId: payment.transactionNo || "N/A",
      };
    })
  );

  const totalPayments = await Payment.countDocuments({ userId });
  return {
    data: paymentDetails,
    pagination: { total: totalPayments, page, limit, totalPages: Math.ceil(totalPayments / limit) },
  };
};

exports.checkPaymentStatus = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw Object.assign(new Error("Payment not found"), { status: 404 });
  }
  return {
    paymentId: payment._id,
    status: payment.status,
    amount: payment.amount,
    mealPlanId: payment.mealPlanId,
    mealPlanName: payment.mealPlanName,
    createdAt: payment.createdAt,
    paymentDate: payment.paymentDate,
  };
};

exports.getPaymentById = async (paymentId, userId) => {
  const payment = await Payment.findById(paymentId).lean();
  if (!payment) {
    throw Object.assign(new Error("Payment information not found"), { status: 404 });
  }

  const mealPlan = await MealPlan.findById(payment.mealPlanId).lean();
  if (!mealPlan) {
    throw Object.assign(new Error("Related MealPlan not found"), { status: 404 });
  }

  if (mealPlan.createdBy.toString() !== userId.toString()) {
    throw Object.assign(new Error("You do not have permission to view this payment information."), {
      status: 403,
    });
  }

  const mealPlanDetails = await MealPlan.findById(payment.mealPlanId)
    .select("title price startDate endDate")
    .lean();

  return {
    _id: payment._id,
    userId: payment.userId,
    mealPlanId: payment.mealPlanId,
    mealPlanName: mealPlanDetails ? mealPlanDetails.title : "N/A",
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    transactionNo: payment.transactionNo || "N/A",
    paymentDate: payment.paymentDate || null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    paymentDetails: payment.paymentDetails || {},
    mealPlanInfo: mealPlanDetails
      ? {
          title: mealPlanDetails.title,
          price: mealPlanDetails.price,
          startDate: mealPlanDetails.startDate,
          endDate: mealPlanDetails.endDate,
        }
      : null,
  };
};

exports.getPaymentHistoryForNutritionist = async () => {
  const mealPlans = await MealPlan.find().lean();
  if (!mealPlans || mealPlans.length === 0) return [];
  return await Payment.find().lean();
};

exports.calculateSalary = async (nutriId) => {
  const nutritionist = await UserModel.findById(nutriId);
  if (!nutritionist || nutritionist.role !== "nutritionist") {
    throw new AppError("Nutritionist not found or invalid role", 404);
  }

  const mealPlans = await MealPlan.find({ createdBy: nutriId }).populate("userId", "username");
  const mealPlanIds = mealPlans.map((mp) => mp._id);
  const payments = await Payment.find({ mealPlanId: { $in: mealPlanIds } });

  const baseSalary = 5000000;
  const commission = payments
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => {
      const mealPlan = mealPlans.find((mp) => mp._id.toString() === payment.mealPlanId.toString());
      return sum + (mealPlan ? mealPlan.price * 0.1 : 0);
    }, 0);

  const totalSalary = baseSalary + commission;

  return {
    nutritionist: { id: nutritionist._id, name: nutritionist.username },
    salary: { baseSalary, commission, totalSalary },
  };
};

exports.getSalaryPaymentHistory = async (nutriId) => {
  return await Payment.find({ userId: nutriId, paymentType: "salary" }).sort({ createdAt: -1 });
};

exports.getSalaryHistoryByMonthYear = async (month, year, page, limit) => {
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  if (!month || !year)
    throw Object.assign(new Error("Month and year are required"), { status: 400 });
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    throw Object.assign(new Error("Invalid month. Must be between 1 and 12"), { status: 400 });
  }
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
    throw Object.assign(new Error("Invalid year"), { status: 400 });
  }

  const skip = (page - 1) * limit;
  const query = { month: monthNum, year: yearNum };
  const salaryHistory = await SalaryPayment.find(query)
    .populate("userId", "username")
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPayments = await SalaryPayment.countDocuments(query);
  return {
    data: salaryHistory,
    pagination: { total: totalPayments, page, limit, totalPages: Math.ceil(totalPayments / limit) },
  };
};

exports.acceptSalary = async (userId, amount, month, year, clientIp) => {
  const nutritionist = await UserModel.findById(userId);
  if (!nutritionist || nutritionist.role !== "nutritionist") {
    throw new AppError("Nutritionist not found or invalid role", 404);
  }

  const existingPayment = await SalaryPayment.findOne({ userId, month, year, status: "success" });
  if (existingPayment) {
    throw new AppError(`Salary for ${month}/${year} has already been paid`, 400);
  }

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  const mealPlans = await MealPlan.find({
    createdBy: userId,
    startDate: { $gte: startOfMonth, $lte: endOfMonth },
    isDelete: false,
  });

  const mealPlanIds = mealPlans.map((mp) => mp._id);
  const payments = await Payment.find({ mealPlanId: { $in: mealPlanIds }, status: "success" });

  const baseSalary = 5000000;
  const commission = payments.reduce((sum, payment) => {
    const mealPlan = mealPlans.find((mp) => mp._id.toString() === payment.mealPlanId.toString());
    return sum + (mealPlan ? mealPlan.price * 0.1 : 0);
  }, 0);
  const totalSalary = baseSalary + commission;

  if (Math.round(totalSalary) !== Math.round(amount)) {
    throw new AppError(
      `Calculated salary (${totalSalary}) does not match provided amount (${amount})`,
      400
    );
  }

  const payment = new SalaryPayment({
    userId,
    amount: totalSalary,
    status: "pending",
    paymentMethod: "vnpay",
    paymentType: "salary",
    month,
    year,
  });
  await payment.save();

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode || "",
    vnp_Amount: Math.round(totalSalary * 100).toString(),
    vnp_CurrCode: "VND",
    vnp_TxnRef: payment._id.toString(),
    vnp_OrderInfo: `Thanh toan luong thang ${month}/${year} cho ${nutritionist.username}`,
    vnp_OrderType: "180000",
    vnp_Locale: "vn",
    vnp_ReturnUrl: "http://localhost:8080/api/v1/payment/vnpay/adminReturn",
    vnp_IpAddr: clientIp,
    vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
  };

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params)
      .map(([key, value]) => [key, String(value || "").trim()])
      .sort()
  );
  const signData = new URLSearchParams(sortedParams).toString();
  const secureHash = crypto
    .createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  sortedParams["vnp_SecureHash"] = secureHash;
  const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${new URLSearchParams(sortedParams).toString()}`;

  return { paymentUrl, paymentId: payment._id, calculatedSalary: totalSalary };
};

exports.vnpayAdminReturn = async (vnp_Params) => {
  const secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params)
      .map(([key, value]) => [key, String(value || "").trim()])
      .sort()
  );
  const signData = new URLSearchParams(sortedParams).toString();
  const checkSum = crypto
    .createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  const baseUrl = process.env.ADMIN_WEB_URL || "http://localhost:3000";
  if (secureHash !== checkSum) {
    return `${baseUrl}/admin/financemanagement?status=error&message=Invalid+signature`;
  }

  const paymentId = vnp_Params["vnp_TxnRef"];
  const payment = await SalaryPayment.findById(paymentId);
  if (!payment) {
    return `${baseUrl}/admin/financemanagement?status=error&message=Payment+not+found`;
  }

  const responseCode = vnp_Params["vnp_ResponseCode"];
  const transactionNo = vnp_Params["vnp_TransactionNo"];

  if (responseCode === "00") {
    payment.status = "success";
    payment.paymentDate = new Date();
    payment.transactionNo = transactionNo;
    await payment.save();

    const nutritionist = await UserModel.findById(payment.userId);
    const mealPlans = await MealPlan.find({
      createdBy: payment.userId,
      startDate: {
        $gte: new Date(payment.year, payment.month - 1, 1),
        $lte: new Date(payment.year, payment.month, 0, 23, 59, 59, 999),
      },
    });

    const mealPlanIds = mealPlans.map((mp) => mp._id);
    const payments = await Payment.find({ mealPlanId: { $in: mealPlanIds }, status: "success" });

    const baseSalary = 5000000;
    const commission = payments.reduce((sum, payment) => {
      const mealPlan = mealPlans.find((mp) => mp._id.toString() === payment.mealPlanId.toString());
      return sum + (mealPlan ? mealPlan.price * 0.1 : 0);
    }, 0);
    const totalSalary = baseSalary + commission;

    const formattedSalary = totalSalary.toLocaleString("en-US") + " VND";
    const formattedCommission = commission.toLocaleString("en-US") + " VND";
    const formattedBaseSalary = baseSalary.toLocaleString("en-US") + " VND";

    const emailSubject = `Salary Notification for ${payment.month}/${payment.year} from Healthy Food`;
    const emailHtml = `
      <h2>Hello ${nutritionist.username},</h2>
      <p>We are pleased to inform you about your salary for ${payment.month}/${
      payment.year
    } as follows:</p>
      <ul>
        <li><strong>Base Salary:</strong> ${formattedBaseSalary}</li>
        <li><strong>Commission (10% of revenue):</strong> ${formattedCommission}</li>
        <li><strong>Total Salary:</strong> ${formattedSalary}</li>
      </ul>
      <p>The payment was successfully processed on ${new Date(
        payment.paymentDate
      ).toLocaleDateString("en-US")}.</p>
      <p>Transaction ID: ${payment.transactionNo}</p>
      <p>Thank you for your collaboration with Healthy Food!</p>
      <p>Best regards,<br/>The Healthy Food Team</p>
    `;

    await sendEmail({ email: nutritionist.email, subject: emailSubject, html: emailHtml });
    return `${baseUrl}/admin/financemanagement?status=success&message=Salary+payment+successful`;
  } else {
    payment.status = "failed";
    payment.transactionNo = transactionNo;
    await payment.save();
    return `${baseUrl}/admin/financemanagement?status=error&message=Salary+payment+failed`;
  }
};
