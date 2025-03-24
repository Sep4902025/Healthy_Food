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
      return res
        .status(400)
        .json({ status: "error", message: "Thiếu userId, mealPlanId hoặc amount" });
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
    const successPayment = await Payment.findOne({ mealPlanId, status: "success" });
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

    // ✅ Ép kiểu tất cả giá trị thành string và trim()
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
    const signed = crypto
      .createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    console.log("Secure Hash từ VNPay:", secureHash);
    console.log("Secure Hash tự ký lại:", signed);

    if (secureHash !== signed) {
      return res
        .status(400)
        .redirect("http://localhost:3000/mealplan?status=error&message=Invalid+signature");
    }

    // 🔹 Xử lý logic sau khi kiểm tra chữ ký thành công
    const transactionNo = vnp_Params["vnp_TransactionNo"];
    const paymentId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const status = responseCode === "00" ? "success" : "failed";

    // Tìm payment hiện tại
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { transactionNo, status, paymentDate: new Date(), paymentDetails: vnp_Params },
      { new: true }
    );

    if (!payment) {
      return res
        .status(404)
        .redirect("http://localhost:3000/mealplan?status=error&message=Payment+not+found");
    }

    // Nếu thanh toán thành công
    if (status === "success") {
      await MealPlan.findByIdAndUpdate(payment.mealPlanId, { isBlock: false });

      // 🔹 Tìm MealPlan trước đó của user (nếu có)
      const oldUserMealPlan = await UserMealPlan.findOne({ userId: payment.userId });

      if (oldUserMealPlan) {
        console.log(`🗑 Xóa dữ liệu MealPlan cũ của user: ${payment.userId}`);

        const oldMealPlanId = oldUserMealPlan.mealPlanId;

        // 🔹 Lấy danh sách MealDay trước khi xóa
        const mealDays = await MealDay.find({ mealPlanId: oldMealPlanId });
        const mealDayIds = mealDays.map((mealDay) => mealDay._id);

        // 🔹 Lấy danh sách Reminder trước khi xóa
        const reminders = await Reminder.find({ mealPlanId: oldMealPlanId });
        const reminderIds = reminders.map((reminder) => reminder._id);

        // 🔥 Xóa Job theo reminderId (Agenda)
        if (reminderIds.length > 0) {
          await agenda.cancel({ "data.reminderId": { $in: reminderIds } });
        }

        // 🔥 Xóa Meals trước (vì Meals phụ thuộc vào MealDay)
        if (mealDayIds.length > 0) {
          await Meal.deleteMany({ mealDayId: { $in: mealDayIds } });
        }

        // 🔥 Xóa MealPlanTracking, Reminder, MealDay
        await MealTracking.deleteMany({ mealPlanId: oldMealPlanId });
        await Reminder.deleteMany({ mealPlanId: oldMealPlanId });
        await MealDay.deleteMany({ mealPlanId: oldMealPlanId });

        // 🔥 Xóa MealPlan cũ khỏi user
        await UserMealPlan.deleteOne({ userId: payment.userId });
        // Xóa luôn Meal Plan cũ
        await MealPlan.deleteOne({ _id: oldMealPlanId });
      }

      // 🔹 Gán MealPlan mới cho user
      await UserMealPlan.create({
        userId: payment.userId,
        mealPlanId: payment.mealPlanId,
        startedAt: new Date(),
      });

      console.log(`✅ User ${payment.userId} đã đổi sang MealPlan mới: ${payment.mealPlanId}`);

      // Dọn dẹp Payment pending khác
      try {
        const cleanupResult = await Payment.deleteMany({
          _id: { $ne: payment._id },
          mealPlanId: payment.mealPlanId,
          status: "pending",
        });

        if (cleanupResult.deletedCount > 0) {
          console.log(
            `🧹 Đã xóa ${cleanupResult.deletedCount} payment pending thừa cho mealPlan ${payment.mealPlanId}`
          );
        }
      } catch (cleanupError) {
        console.error("❌ Lỗi khi dọn dẹp payment pending:", cleanupError);
      }
    }

    // Chuyển hướng về localhost:3000/mealplan với query parameters
    const redirectUrl = `http://localhost:3000/mealplan?status=${status}&message=${
      status === "success" ? "Thanh+toán+thành+công" : "Thanh+toán+thất+bại"
    }`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Lỗi xử lý VNPay:", error);
    res.redirect("http://localhost:3000/mealplan?status=error&message=Lỗi+xử+lý+phản+hồi+VNPAY");
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
