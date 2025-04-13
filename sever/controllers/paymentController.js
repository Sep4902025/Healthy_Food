const querystring = require("querystring");
const crypto = require("crypto");
const moment = require("moment");
const VNPAY_CONFIG = require("../config/vnpay");
const Payment = require("../models/Payment");
const {
  MealPlan,
  UserMealPlan,
  MealDay,
  Meal,
  MealTracking,
} = require("../models/MealPlan");
const Reminder = require("../models/Reminder");
const { agenda } = require("../config/agenda");
const UserModel = require("../models/UserModel");
const PaymentModel = require("../models/Payment");
const sendEmail = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const SalaryPayment = require("../models/SalaryPayment");

// API lấy danh sách tất cả các payment
exports.getAllPayments = async (req, res) => {
  try {
    const moment = require("moment");

    const payments = await Payment.find();

    const revenueByMonth = {};

    // Tính tổng doanh thu
    const totalRevenue = payments.reduce((acc, payment) => {
      return payment.status === "success" ? acc + payment.amount : acc;
    }, 0);

    // Thống kê trạng thái thanh toán
    const paymentStats = payments.reduce(
      (acc, payment) => {
        if (payment.status === "success") {
          acc.paid += 1;
        } else {
          acc.unpaid += 1;
        }
        return acc;
      },
      { paid: 0, unpaid: 0 }
    );

    payments.forEach((payment) => {
      if (payment.status === "success") {
        const year = moment(payment.paymentDate).format("YYYY");
        const month = moment(payment.paymentDate).format("MM");

        if (!revenueByMonth[year]) {
          revenueByMonth[year] = {};
        }

        if (!revenueByMonth[year][month]) {
          revenueByMonth[year][month] = 0;
        }

        revenueByMonth[year][month] += payment.amount;
      }
    });

    // Doanh thu theo năm
    const revenueByYear = payments.reduce((acc, payment) => {
      const year = new Date(payment.paymentDate).getFullYear();
      acc[year] = (acc[year] || 0) + payment.amount;
      return acc;
    }, {});

    res.status(200).json({
      totalRevenue,
      paymentStats,
      revenueByYear,
      revenueByMonth,
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Payment:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo URL thanh toán VNPay
exports.createPaymentUrl = async (req, res) => {
  try {
    const { userId, mealPlanId, amount } = req.body;

    if (!userId || !mealPlanId || !amount) {
      return res.status(400).json({
        status: "error",
        message: "Thiếu userId, mealPlanId hoặc amount",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Amount phải là số dương" });
    }

    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res
        .status(400)
        .json({ status: "error", message: "MealPlan không tồn tại" });
    }

    const successPayment = await Payment.findOne({
      mealPlanId,
      status: "success",
    });
    if (successPayment) {
      return res
        .status(400)
        .json({ status: "error", message: "MealPlan này đã được thanh toán" });
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
    } else {
      payment.updatedAt = new Date();
      if (payment.amount !== amount) {
        payment.amount = amount;
        await payment.save();
      }
    }

    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode || "",
      vnp_Amount: Math.round(amount * 100).toString(),
      vnp_CurrCode: "VND",
      vnp_TxnRef: payment._id.toString(),
      vnp_OrderInfo: `Thanh toán MealPlan: ${mealPlanId}`,
      vnp_OrderType: "180000",
      vnp_Locale: "vn",
      vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl || "",
      vnp_IpAddr: clientIp,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    Object.entries(vnp_Params).forEach(([key, value]) => {
      if (value === undefined) {
        // Console warning removed
      }
    });

    const sortedParams = Object.fromEntries(
      Object.entries(vnp_Params)
        .map(([key, value]) => [key, String(value || "").trim()])
        .sort()
    );

    const signData = new URLSearchParams(sortedParams).toString();

    if (!VNPAY_CONFIG.vnp_HashSecret) {
      throw new Error("vnp_HashSecret không tồn tại hoặc rỗng!");
    }

    const secureHash = crypto
      .createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    sortedParams["vnp_SecureHash"] = secureHash;

    const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${new URLSearchParams(
      sortedParams
    ).toString()}`;

    return res.json({ status: "success", paymentUrl, paymentId: payment._id });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi tạo URL thanh toán" });
  }
};

// Xử lý phản hồi từ VNPay
exports.vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

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

    const clientType = req.query.clientType || "web";
    const baseUrl =
      clientType === "app"
        ? process.env.MOBILE_CLIENT_URL
        : process.env.ADMIN_WEB_URL;

    if (secureHash !== signed) {
      return res
        .status(400)
        .redirect(`${baseUrl}/mealplan?status=error&message=Invalid+signature`);
    }

    const transactionNo = vnp_Params["vnp_TransactionNo"];
    const paymentId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const status = responseCode === "00" ? "success" : "failed";

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        transactionNo,
        status,
        paymentDate: new Date(),
        paymentDetails: vnp_Params,
      },
      { new: true }
    );

    if (!payment) {
      return res
        .status(404)
        .redirect(`${baseUrl}/mealplan?status=error&message=Payment+not+found`);
    }

    if (status === "success") {
      const updatedMealPlan = await MealPlan.findByIdAndUpdate(
        payment.mealPlanId,
        { paymentId: payment._id, isBlock: false },
        { new: true }
      );

      if (!updatedMealPlan) {
        return res
          .status(404)
          .redirect(
            `${baseUrl}/mealplan?status=error&message=MealPlan+not+found`
          );
      }

      const oldUserMealPlan = await UserMealPlan.findOne({
        userId: payment.userId,
      });

      if (oldUserMealPlan) {
        const oldMealPlanId = oldUserMealPlan.mealPlanId;
        const mealDays = await MealDay.find({ mealPlanId: oldMealPlanId });
        const mealDayIds = mealDays.map((mealDay) => mealDay._id);
        const reminders = await Reminder.find({ mealPlanId: oldMealPlanId });
        const reminderIds = reminders.map((reminder) => reminder._id);

        // Cập nhật UserMealPlan hiện có với Meal Plan mới
        oldUserMealPlan.mealPlanId = payment.mealPlanId;
        oldUserMealPlan.startDate = new Date();
        await oldUserMealPlan.save(); // Lưu instance đã cập nhật
      } else {
        await UserMealPlan.create({
          userId: payment.userId,
          mealPlanId: payment.mealPlanId,
          startDate: new Date(),
        });
      }

      console.log(
        `✅ User ${payment.userId} has switched to new MealPlan: ${payment.mealPlanId}`
      );

      // Dọn dẹp các payment pending khác
      const cleanupResult = await Payment.deleteMany({
        _id: { $ne: payment._id },
        mealPlanId: payment.mealPlanId,
        status: "pending",
      });
    }

    const redirectUrl = `${baseUrl}/mealplan?status=${status}&message=${
      status === "success" ? "Thanh+toán+thành+công" : "Thanh+toán+thất+bại"
    }`;
    res.redirect(redirectUrl);
  } catch (error) {
    const clientType = req.query.clientType || "web";
    const baseUrl =
      clientType === "app"
        ? process.env.MOBILE_CLIENT_URL
        : process.env.ADMIN_WEB_URL;
    res.redirect(
      `${baseUrl}/mealplan?status=error&message=Lỗi+xử+lý+phản+hồi+VNPAY`
    );
  }
};

// Lấy lịch sử thanh toán của user
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy lịch sử thanh toán",
      });
    }

    const paymentDetails = await Promise.all(
      payments.map(async (payment) => {
        const mealPlan = await MealPlan.findById(payment.mealPlanId)
          .select("title")
          .lean();
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

    return res.json({
      status: "success",
      data: paymentDetails,
      pagination: {
        total: totalPayments,
        page,
        limit,
        totalPages: Math.ceil(totalPayments / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Lỗi khi lấy lịch sử thanh toán",
    });
  }
};

// Kiểm tra trạng thái thanh toán
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res
        .status(404)
        .json({ status: "error", message: "Payment not found" });
    }

    return res.json({
      status: "success",
      data: {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        mealPlanId: payment.mealPlanId,
        mealPlanName: payment.mealPlanName,
        createdAt: payment.createdAt,
        paymentDate: payment.paymentDate,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error checking payment status" });
  }
};

// Lấy thông tin chi tiết của một Payment theo paymentId
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { _id: userId } = req.user;

    const payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment information not found",
      });
    }

    const mealPlan = await MealPlan.findById(payment.mealPlanId).lean();
    if (!mealPlan) {
      return res.status(404).json({
        status: "error",
        message: "Related MealPlan not found",
      });
    }

    if (mealPlan.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You do not have permission to view this payment information. Only the creator of the MealPlan can access this.",
      });
    }

    const mealPlanDetails = await MealPlan.findById(payment.mealPlanId)
      .select("title price startDate endDate")
      .lean();

    const paymentDetails = {
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

    return res.json({
      status: "success",
      data: paymentDetails,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error while retrieving payment information",
    });
  }
};

// ================ ADMIN =============================
// Lấy lịch sử thanh toán cho nutritionist (tất cả thanh toán thành công)
exports.getPaymentHistoryForNutritionist = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find().lean();

    if (!mealPlans || mealPlans.length === 0) {
      return res
        .status(200)
        .json({ success: true, data: [], message: "Không có meal plans nào" });
    }

    const payments = await Payment.find().lean();

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử thanh toán",
      error: error.message,
    });
  }
};
exports.calculateSalary = catchAsync(async (req, res, next) => {
  const { nutriId } = req.params;

  // Tìm nutritionist
  const nutritionist = await UserModel.findById(nutriId);
  if (!nutritionist || nutritionist.role !== "nutritionist") {
    return next(new AppError("Nutritionist not found or invalid role", 404));
  }

  // Lấy tất cả meal plans của nutritionist
  const mealPlans = await MealPlan.find({ createdBy: nutriId }).populate(
    "userId",
    "username"
  );

  // Lấy tất cả payments liên quan đến meal plans này
  const mealPlanIds = mealPlans.map((mp) => mp._id);
  const payments = await PaymentModel.find({
    mealPlanId: { $in: mealPlanIds },
  });

  // Tính lương
  const baseSalary = 5000000; // 5,000,000 VND
  const commission = payments
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => {
      const mealPlan = mealPlans.find(
        (mp) => mp._id.toString() === payment.mealPlanId.toString()
      );
      return sum + (mealPlan ? mealPlan.price * 0.1 : 0);
    }, 0);

  const totalSalary = baseSalary + commission;

  res.status(200).json({
    status: "success",
    data: {
      nutritionist: {
        id: nutritionist._id,
        name: nutritionist.username,
      },
      salary: {
        baseSalary,
        commission,
        totalSalary,
      },
    },
  });
});

// New function to get salary payment history
exports.getSalaryPaymentHistory = catchAsync(async (req, res, next) => {
  const { nutriId } = req.params;

  const payments = await Payment.find({
    userId: nutriId,
    paymentType: "salary",
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: payments,
  });
});

exports.getSalaryHistoryByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Must be between 1 and 12",
      });
    }

    if (
      isNaN(yearNum) ||
      yearNum < 2000 ||
      yearNum > new Date().getFullYear() + 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    // Query salary payments with valid userId
    const query = {
      month: monthNum,
      year: yearNum,
      userId: { $ne: null, $exists: true }, // Chỉ lấy các bản ghi có userId
    };
    const salaryHistory = await SalaryPayment.find(query)
      .populate("userId", "username")
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPayments = await SalaryPayment.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: salaryHistory,
      pagination: {
        total: totalPayments,
        page,
        limit,
        totalPages: Math.ceil(totalPayments / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching salary history by month and year:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thanh toán lương cho nutritionist Admin
exports.acceptSalary = catchAsync(async (req, res, next) => {
  const { userId, amount, month, year } = req.body;

  // Kiểm tra nutritionist
  const nutritionist = await UserModel.findById(userId);
  if (!nutritionist || nutritionist.role !== "nutritionist") {
    return next(new AppError("Nutritionist not found or invalid role", 404));
  }

  // Kiểm tra xem đã thanh toán cho tháng này chưa
  const existingPayment = await SalaryPayment.findOne({
    userId,
    month,
    year,
    status: "success",
  });
  if (existingPayment) {
    return next(
      new AppError(`Salary for ${month}/${year} has already been paid`, 400)
    );
  }

  // Tính lương cho tháng được chọn
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  const mealPlans = await MealPlan.find({
    createdBy: userId,
    startDate: { $gte: startOfMonth, $lte: endOfMonth },
    isDelete: false,
  });

  const mealPlanIds = mealPlans.map((mp) => mp._id);
  const payments = await PaymentModel.find({
    mealPlanId: { $in: mealPlanIds },
    status: "success",
  });

  const baseSalary = 5000000;
  const commission = payments.reduce((sum, payment) => {
    const mealPlan = mealPlans.find(
      (mp) => mp._id.toString() === payment.mealPlanId.toString()
    );
    return sum + (mealPlan ? mealPlan.price * 0.1 : 0);
  }, 0);
  const totalSalary = baseSalary + commission;

  if (Math.round(totalSalary) !== Math.round(amount)) {
    return next(
      new AppError(
        `Calculated salary (${totalSalary}) does not match provided amount (${amount})`,
        400
      )
    );
  }

  // Tạo bản ghi thanh toán
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

  // Tạo URL thanh toán VNPay
  const clientIp =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.ip ||
    "127.0.0.1";

  let vnp_Params = {
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

  const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${new URLSearchParams(
    sortedParams
  ).toString()}`;

  res.status(200).json({
    status: "success",
    data: {
      paymentUrl,
      paymentId: payment._id,
      calculatedSalary: totalSalary, // Trả về lương tính toán để frontend sử dụng
    },
  });
});

// API callback từ VNPay để xác nhận thanh toán
exports.vnpayAdminReturn = catchAsync(async (req, res, next) => {
  let vnp_Params = req.query;
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

  // Use a dynamic base URL for the frontend
  const baseUrl = process.env.ADMIN_WEB_URL || "http://localhost:3000"; // Default to localhost:3000 if not set

  if (secureHash !== checkSum) {
    return res.redirect(
      `${baseUrl}/admin/financemanagement?status=error&message=Invalid+signature`
    );
  }

  const paymentId = vnp_Params["vnp_TxnRef"];
  const payment = await SalaryPayment.findById(paymentId);
  if (!payment) {
    return res.redirect(
      `${baseUrl}/admin/financemanagement?status=error&message=Payment+not+found`
    );
  }

  const responseCode = vnp_Params["vnp_ResponseCode"];
  const transactionNo = vnp_Params["vnp_TransactionNo"];

  if (responseCode === "00") {
    // Update payment status to success
    payment.status = "success";
    payment.paymentDate = new Date();
    payment.transactionNo = transactionNo;
    await payment.save();

    // Send email notification
    const nutritionist = await UserModel.findById(payment.userId);
    const mealPlans = await MealPlan.find({
      createdBy: payment.userId,
      startDate: {
        $gte: new Date(payment.year, payment.month - 1, 1),
        $lte: new Date(payment.year, payment.month, 0, 23, 59, 59, 999),
      },
    });

    const mealPlanIds = mealPlans.map((mp) => mp._id);
    const payments = await PaymentModel.find({
      mealPlanId: { $in: mealPlanIds },
      status: "success",
    });

    const baseSalary = 5000000;
    const commission = payments.reduce((sum, payment) => {
      const mealPlan = mealPlans.find(
        (mp) => mp._id.toString() === payment.mealPlanId.toString()
      );
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

    try {
      await sendEmail({
        email: nutritionist.email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log(`Salary email sent to ${nutritionist.email}`);
    } catch (emailError) {
      console.error(
        `Failed to send email to ${nutritionist.email}:`,
        emailError
      );
    }

    // Redirect to the frontend with success message
    res.redirect(
      `${baseUrl}/admin/financemanagement?status=success&message=Salary+payment+successful`
    );
  } else {
    // Update payment status to failed
    payment.status = "failed";
    payment.transactionNo = transactionNo;
    await payment.save();

    // Redirect to the frontend with error message
    res.redirect(
      `${baseUrl}/admin/financemanagement?status=error&message=Salary+payment+failed`
    );
  }
});
