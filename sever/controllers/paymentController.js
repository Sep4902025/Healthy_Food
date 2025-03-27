const querystring = require("querystring");
const crypto = require("crypto");
const moment = require("moment");
const VNPAY_CONFIG = require("../config/vnpay");
const Payment = require("../models/Payment");
const { MealPlan, UserMealPlan, MealDay, Meal, MealTracking } = require("../models/MealPlan");
const Reminder = require("../models/Reminder");
const { agenda } = require("../config/agenda");

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

    // Kiểm tra MealPlan có tồn tại không
    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res.status(400).json({ status: "error", message: "MealPlan không tồn tại" });
    }

    // Kiểm tra nếu MealPlan đã thanh toán thành công
    const successPayment = await Payment.findOne({
      mealPlanId,
      status: "success",
    });
    if (successPayment) {
      return res.status(400).json({ status: "error", message: "MealPlan này đã được thanh toán" });
    }

    // Tìm payment đang pending cho mealPlanId và userId này
    let payment = await Payment.findOne({
      mealPlanId,
      userId,
      status: "pending",
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Trong vòng 24 giờ
    });

    // Nếu có payment pending gần đây, sử dụng lại thay vì tạo mới
    if (!payment) {
      // Không tìm thấy hoặc payment cũ quá 24h, tạo mới
      payment = new Payment({
        userId,
        mealPlanId,
        amount,
        status: "pending",
        paymentMethod: "vnpay",
      });
      await payment.save();
    } else {
      // Cập nhật thời gian và thông tin nếu cần
      payment.updatedAt = new Date();
      // Cập nhật amount nếu có thay đổi
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
      vnp_Amount: Math.round(amount * 100).toString(), // Quy đổi về đơn vị VNĐ
      vnp_CurrCode: "VND",
      vnp_TxnRef: payment._id.toString(),
      vnp_OrderInfo: `Thanh toán MealPlan: ${mealPlanId}`,
      vnp_OrderType: "180000",
      vnp_Locale: "vn",
      vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl || "",
      vnp_IpAddr: clientIp,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    // ✅ Log dữ liệu trước khi ký
    console.log("VNPay Params:", vnp_Params);

    // ✅ Kiểm tra giá trị nào bị `undefined`
    Object.entries(vnp_Params).forEach(([key, value]) => {
      if (value === undefined) {
        console.warn(`⚠️ Cảnh báo: Tham số ${key} bị undefined!`);
      }
    });

    // ✅ Ép kiểu tất cả giá trị thành string để tránh lỗi `.trim()`
    const sortedParams = Object.fromEntries(
      Object.entries(vnp_Params)
        .map(([key, value]) => [key, String(value || "").trim()])
        .sort()
    );

    console.log("🔹 Tham số sau khi sắp xếp:", sortedParams);

    // ✅ Tạo chuỗi signData đúng chuẩn
    const signData = new URLSearchParams(sortedParams).toString();

    console.log("🔹 Chuỗi signData trước khi ký:", signData);

    // ✅ Kiểm tra giá trị HashSecret
    if (!VNPAY_CONFIG.vnp_HashSecret) {
      throw new Error("vnp_HashSecret không tồn tại hoặc rỗng!");
    }

    // ✅ Tạo HMAC SHA512
    const secureHash = crypto
      .createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    console.log("🔹 Chữ ký tạo ra:", secureHash);

    sortedParams["vnp_SecureHash"] = secureHash;

    // ✅ Tạo URL thanh toán
    const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${new URLSearchParams(sortedParams).toString()}`;

    console.log("🔹 URL thanh toán gửi đi:", paymentUrl);

    return res.json({ status: "success", paymentUrl, paymentId: payment._id });
  } catch (error) {
    console.error("❌ Lỗi tạo URL thanh toán:", error);
    return res.status(500).json({ status: "error", message: "Lỗi tạo URL thanh toán" });
  }
};


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

    console.log("Secure Hash from VNPay:", secureHash);
    console.log("Secure Hash re-signed:", signed);
    // Determine the base URL based on client type
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
      // Update the MealPlan with the paymentId and set isBlock to false
      const updatedMealPlan = await MealPlan.findByIdAndUpdate(
        payment.mealPlanId,
        { paymentId: payment._id, isBlock: false },
        { new: true }
      );

      if (!updatedMealPlan) {
        console.error(`❌ Không tìm thấy MealPlan với ID: ${payment.mealPlanId}`);
        return res
          .status(404)
          .redirect(`${baseUrl}/mealplan?status=error&message=MealPlan+not+found`);
      }

      console.log(`✅ Đã cập nhật MealPlan ${payment.mealPlanId} với paymentId: ${payment._id}`);

      // 🔹 Tìm MealPlan trước đó của user (nếu có)
      const oldUserMealPlan = await UserMealPlan.findOne({ userId: payment.userId });

      if (oldUserMealPlan) {
        console.log(`🗑 Deleting old MealPlan data for user: ${payment.userId}`);

        const oldMealPlanId = oldUserMealPlan.mealPlanId;

        // 🔹 Get list of MealDays before deletion
        const mealDays = await MealDay.find({ mealPlanId: oldMealPlanId });
        const mealDayIds = mealDays.map((mealDay) => mealDay._id);

        // 🔹 Get list of Reminders before deletion
        const reminders = await Reminder.find({ mealPlanId: oldMealPlanId });
        const reminderIds = reminders.map((reminder) => reminder._id);

        // Cập nhật UserMealPlan với Meal Plan mới
        userMealPlan.mealPlanId = payment.mealPlanId;
        userMealPlan.startDate = new Date();
        await userMealPlan.save();
      } else {
        // Nếu chưa có UserMealPlan, tạo mới
        await UserMealPlan.create({
          userId: payment.userId,
          mealPlanId: payment.mealPlanId,
          startDate: new Date(),
        });
      }

      console.log(`✅ User ${payment.userId} has switched to new MealPlan: ${payment.mealPlanId}`);
      console.log(`✅ User ${payment.userId} has switched to new MealPlan: ${payment.mealPlanId}`);

      // Dọn dẹp các payment pending khác
      const cleanupResult = await Payment.deleteMany({
        _id: { $ne: payment._id },
        mealPlanId: payment.mealPlanId,
        status: "pending",
      });
      if (cleanupResult.deletedCount > 0) {
        console.log(`🧹 Deleted ${cleanupResult.deletedCount} redundant pending payments`);
      }
    }

    // Chuyển hướng với query parameters
    const redirectUrl = `${baseUrl}/mealplan?status=${status}&message=${
      status === "success" ? "Thanh+toán+thành+công" : "Thanh+toán+thất+bại"
    }`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Lỗi xử lý VNPay:", error);
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
    const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
    const limit = parseInt(req.query.limit) || 10; // Mặc định 10 giao dịch mỗi trang
    const skip = (page - 1) * limit;

    // Tìm các giao dịch của user
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
      .skip(skip)
      .limit(limit)
      .lean(); // Chuyển thành plain JavaScript object để dễ xử lý

    // Nếu không có giao dịch nào
    if (!payments || payments.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy lịch sử thanh toán",
      });
    }

    // Lấy thông tin meal plan cho từng giao dịch
    const paymentDetails = await Promise.all(
      payments.map(async (payment) => {
        const mealPlan = await MealPlan.findById(payment.mealPlanId).select("title").lean();
        return {
          _id: payment._id,
          mealPlanName: mealPlan ? mealPlan.title : "N/A",
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
          vnpayTransactionId: payment.vnpayTransactionId || "N/A",
        };
      })
    );

    // Đếm tổng số giao dịch để hỗ trợ phân trang
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
    console.error("Error fetching payment history:", error);
    return res.status(500).json({
      status: "error",
      message: "Lỗi khi lấy lịch sử thanh toán",
    });
  }
};

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
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({ status: "error", message: "Error checking payment status" });
  }
};

// Retrieve detailed information of a Payment by paymentId
// Retrieve detailed information of a Payment by paymentId
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { _id: userId } = req.user; // Retrieved from authentication middleware

    // Find Payment by paymentId
    const payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment information not found",
      });
    }

    // Find the related MealPlan to check the creator
    const mealPlan = await MealPlan.findById(payment.mealPlanId).lean();
    if (!mealPlan) {
      return res.status(404).json({
        status: "error",
        message: "Related MealPlan not found",
      });
    }

    // Check if the requesting user is the creator of the MealPlan
    if (mealPlan.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to view this payment information. Only the creator of the MealPlan can access this.",
      });
    }

    // Retrieve related MealPlan information for response
    const mealPlanDetails = await MealPlan.findById(payment.mealPlanId)
      .select("title price startDate endDate")
      .lean();

    // Format the response data
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
      paymentDetails: payment.paymentDetails || {}, // Detailed information from VNPay (if available)
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
    console.error("🔥 Error retrieving Payment information by ID:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while retrieving payment information",
    });
  }
};
