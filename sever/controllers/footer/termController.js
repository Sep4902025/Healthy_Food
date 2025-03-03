const TermOfUse = require("../../models/footer/Term");

// Lấy tất cả Terms
exports.getAllTerms = async (req, res) => {
  try {
    const terms = await TermOfUse.find({ isDeleted: false }).select(
      "_id bannerUrl content isVisible"
    );
    res.status(200).json({ success: true, data: terms });
  } catch (error) {
    console.error("Lỗi khi lấy Terms:", error);
    res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu Terms" });
  }
};

// Tạo mới Term
exports.createTerm = async (req, res) => {
  try {
    const newTerm = await TermOfUse.create(req.body);
    res.status(201).json({ status: "success", data: newTerm });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi tạo Terms" });
  }
};

// Cập nhật Term
exports.updateTerm = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: "ID không hợp lệ" });

  try {
    const updatedTerm = await TermOfUse.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTerm) {
      return res.status(404).json({ success: false, message: "Không tìm thấy Term" });
    }
    res.status(200).json({ success: true, data: updatedTerm });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật Terms" });
  }
};

// Xóa cứng Term
exports.hardDeleteTerm = async (req, res) => {
  const { id } = req.params;
  try {
    await TermOfUse.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Terms đã bị xóa vĩnh viễn" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi xóa cứng Terms" });
  }
};
