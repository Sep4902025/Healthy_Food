const FAQ = require("../../models/footer/FAQs");

// Lấy tất cả FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isDeleted: false });
    res.json({ status: "success", data: faqs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi server", error: error.message });
  }
};

// Tạo mới FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { category, question, answer } = req.body;
    if (!category || !question || !answer) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng nhập đầy đủ category, question và answer.",
      });
    }

    const newFaq = new FAQ(req.body);
    await newFaq.save();
    res.status(201).json({ status: "success", message: "Thêm FAQ thành công!", data: newFaq });

  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi server", error: error.message });
  }
};

// Cập nhật FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const updatedFaq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedFaq) {
      return res.status(404).json({ status: "error", message: "FAQ không tồn tại." });
    }
    res.json({ status: "success", message: "Cập nhật thành công!", data: updatedFaq });

  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi server", error: error.message });
  }
};


exports.hardDeleteFAQ = async (req, res) => {
  const { id } = req.params;
  try {
    await FAQ.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "FAQ đã bị xóa vĩnh viễn" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi xóa cứng FAQ" });
  }
};