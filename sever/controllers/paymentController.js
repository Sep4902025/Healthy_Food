const querystring = require("querystring");
const crypto = require("crypto");
const moment = require("moment");
const VNPAY_CONFIG = require("../config/vnpay");
const Payment = require("../models/Payment");
const { MealPlan, UserMealPlan, MealDay, Meal, MealTracking } = require("../models/MealPlan");
const Reminder = require("../models/Reminder");
const { agenda } = require("../config/agenda");

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
      return res.status(400).json({ status: "error", message: "Amount phải là số dương" });
    }

    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res.status(400).json({ status: "error", message: "MealPlan không tồn tại" });
    }

    const successPayment = await Payment.findOne({ mealPlanId, status: "success" });
    if (successPayment) {
      return res.status(400).json({ status: "error", message: "MealPlan này đã được thanh toán" });
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
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip || "127.0.0.1";

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

    const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${new URLSearchParams(sortedParams).toString()}`;

    return res.json({ status: "success", paymentUrl, paymentId: payment._id });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi tạo URL thanh toán" });
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
      clientType === "app" ? process.env.MOBILE_CLIENT_URL : process.env.ADMIN_WEB_URL;

    if (secureHash !== signed) {
      return res.status(400).redirect(`${baseUrl}/mealplan?status=error&message=Invalid+signature`);
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
      return res.status(404).redirect(`${baseUrl}/mealplan?status=error&message=Payment+not+found`);
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
          .redirect(`${baseUrl}/mealplan?status=error&message=MealPlan+not+found`);
      }

      const oldUserMealPlan = await UserMealPlan.findOne({ userId: payment.userId });

      if (oldUserMealPlan) {
        const oldMealPlanId = oldUserMealPlan.mealPlanId;
        const mealDays = await MealDay.find({ mealPlanId: oldMealPlanId });
        const mealDayIds = mealDays.map((mealDay) => mealDay._id);
        const reminders = await Reminder.find({ mealPlanId: oldMealPlanId });
        const reminderIds = reminders.map((reminder) => reminder._id);

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
      clientType === "app" ? process.env.MOBILE_CLIENT_URL : process.env.ADMIN_WEB_URL;
    res.redirect(`${baseUrl}/mealplan?status=error&message=Lỗi+xử+lý+phản+hồi+VNPAY`);
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

    return res.json({
      status: "success",
      data: paymentDetails,
      pagination: { total: totalPayments, page, limit, totalPages: Math.ceil(totalPayments / limit) },
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
      return res.status(404).json({ status: "error", message: "Payment not found" });
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
    return res.status(500).json({ status: "error", message: "Error checking payment status" });
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

// Lấy lịch sử thanh toán cho nutritionist (tất cả thanh toán thành công)
exports.getPaymentHistoryForNutritionist = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find().lean();

    if (!mealPlans || mealPlans.length === 0) {
      return res.status(200).json({ success: true, data: [], message: "Không có meal plans nào" });
    }

    const payments = await Payment.find().lean();

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi lấy lịch sử thanh toán", error: error.message });
  }
};