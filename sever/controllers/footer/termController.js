const jwt = require("jsonwebtoken");
const TermOfUse = require("../../models/footer/Term");
const UserModel = require("../../models/UserModel");
const catchAsync = require("../../utils/catchAsync");

// 🔹 Lấy tất cả Terms
exports.getAllTerms = catchAsync(async (req, res, next) => {
  // Lấy các query parameters từ request
  const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
  const limit = parseInt(req.query.limit) || 10; // Mặc định 10 Terms mỗi trang
  const skip = (page - 1) * limit; // Tính số bản ghi cần bỏ qua
  const sort = req.query.sort || "createdAt"; // Mặc định sắp xếp theo createdAt
  const order = req.query.order || "desc"; // Mặc định thứ tự giảm dần

  // 🛠️ Kiểm tra token để phân quyền
  let filter = { isDeleted: false, isVisible: true }; // Mặc định: Chỉ lấy Terms chưa bị xóa và hiển thị
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await UserModel.findById(decoded.id);
      if (user && (user.role === "admin" || user.role === "nutritionist")) {
        filter = {}; // Admin/Nutritionist thấy tất cả
      }
    } catch (error) {
      console.error("❌ Lỗi xác thực token:", error.message);
    }
  }

  // Xử lý sắp xếp
  const sortOrder = order === "desc" ? -1 : 1;
  const sortOptions = { [sort]: sortOrder };

  // Đếm tổng số Terms thỏa mãn điều kiện
  const totalTerms = await TermOfUse.countDocuments(filter);

  // Lấy danh sách Terms với phân trang và sắp xếp
  const terms = await TermOfUse.find(filter)
    .select("_id bannerUrl content isVisible")
    .sort(sortOptions) // Áp dụng sắp xếp
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalTerms / limit);

  res.status(200).json({
    success: true,
    results: terms.length,
    total: totalTerms,
    totalPages: totalPages,
    currentPage: page,
    data: { terms },
  });
});

// Các hàm khác giữ nguyên
exports.createTerm = async (req, res) => {
  try {
    console.log("📤 Dữ liệu nhận từ client:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Body request rỗng!" });
    }

    const { bannerUrl, content } = req.body;
    if (!bannerUrl || !content) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu đầu vào!" });
    }

    const newTerm = await TermOfUse.create({ bannerUrl, content });

    res.status(201).json({ success: true, data: newTerm });
  } catch (error) {
    console.error("❌ Lỗi tạo Terms:", error);
    res.status(500).json({ success: false, message: "Lỗi tạo Terms" });
  }
};

exports.updateTerm = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: "ID không hợp lệ" });

  try {
    console.log(`📤 Cập nhật Term ID: ${id}`, req.body);

    const updatedTerm = await TermOfUse.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTerm) {
      return res.status(404).json({ success: false, message: "Không tìm thấy Term" });
    }

    res.status(200).json({ success: true, data: updatedTerm });
  } catch (error) {
    console.error("❌ Lỗi cập nhật Terms:", error);
    res.status(500).json({ success: false, message: "Lỗi cập nhật Terms" });
  }
};

exports.hardDeleteTerm = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`🗑️ Xóa vĩnh viễn Term ID: ${id}`);

    await TermOfUse.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Terms đã bị xóa vĩnh viễn" });
  } catch (error) {
    console.error("❌ Lỗi xóa Terms:", error);
    res.status(500).json({ success: false, message: "Lỗi xóa cứng Terms" });
  }
};
