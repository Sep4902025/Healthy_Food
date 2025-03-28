const ContactUs = require("../../models/footer/Contact");
const catchAsync = require("../../utils/catchAsync");

// Lấy tất cả Contact Us
exports.getAllContactUs = catchAsync(async (req, res, next) => {
  // Lấy các query parameters từ request
  const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
  const limit = parseInt(req.query.limit) || 10; // Mặc định 10 mục mỗi trang
  const skip = (page - 1) * limit; // Tính số bản ghi cần bỏ qua

  // Điều kiện lọc: không bao gồm liên hệ đã xóa
  const query = { isDeleted: false };

  // Đếm tổng số liên hệ thỏa mãn điều kiện
  const totalContacts = await ContactUs.countDocuments(query);

  // Lấy danh sách liên hệ với phân trang
  const contactUs = await ContactUs.find(query).skip(skip).limit(limit);

  // Tính tổng số trang
  const totalPages = Math.ceil(totalContacts / limit);

  res.status(200).json({
    status: "success",
    results: contactUs.length,
    total: totalContacts,
    totalPages: totalPages,
    currentPage: page,
    data: { contactUs },
  });
});

exports.createContactUs = async (req, res) => {
  try {
    console.log("📩 Received data:", req.body);
    if (!req.body.name || !req.body.mail || !req.body.subject || !req.body.message) {
      return res.status(400).json({ status: "error", error: "Thiếu thông tin cần thiết" });
    }

    const newContactUs = await ContactUs.create(req.body);
    res.status(201).json({ status: "success", data: newContactUs });
  } catch (error) {
    console.error("❌ Error creating contact:", error);
    res.status(500).json({
      status: "error",
      error: "Lỗi tạo Contact Us",
      details: error.message,
    });
  }
};

// Xóa cứng Contact Us
exports.hardDeleteContactUs = async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await ContactUs.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact không tồn tại!" });
    }
    await ContactUs.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Contact Us đã bị xóa vĩnh viễn" });
  } catch (error) {
    console.error("Lỗi xóa liên hệ:", error);
    res.status(500).json({ success: false, message: "Lỗi xóa cứng Contact Us" });
  }
};

// Cập nhật trạng thái isResolved của Contact Us
exports.updateContactUs = async (req, res) => {
  try {
    console.log(`📤 Cập nhật Contact ID: ${req.params.id}`, req.body);

    const updatedContact = await ContactUs.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedContact) {
      return res.status(404).json({ success: false, message: "Contact không tồn tại." });
    }

    console.log("✅ Contact đã được cập nhật:", updatedContact);
    res.json({
      success: true,
      message: "Cập nhật thành công!",
      data: updatedContact,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật Contact:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật Contact",
      error: error.message,
    });
  }
};
