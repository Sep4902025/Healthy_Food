const MedicalCondition = require("../models/MedicalCondition");

// Tạo Medical Condition
exports.createMedicalCondition = async (req, res) => {
  try {
    const newCondition = new MedicalCondition(req.body);
    await newCondition.save();
    res.status(201).json({ status: "success", data: newCondition });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Lấy tất cả Medical Conditions với phân trang
exports.getAllMedicalConditions = async (req, res) => {
  try {
    // Lấy tham số phân trang từ query (mặc định page=1, limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Đếm tổng số document chưa bị xóa mềm
    const total = await MedicalCondition.countDocuments({ isDelete: false });

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    // Lấy danh sách với phân trang
    const conditions = await MedicalCondition.find({ isDelete: false })
      .skip(skip)
      .limit(limit);

    // Trả về dữ liệu phân trang
    res.status(200).json({
      status: "success",
      data: {
        items: conditions,
        total,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Lấy một Medical Condition theo ID
exports.getMedicalConditionById = async (req, res) => {
  try {
    const condition = await MedicalCondition.findById(req.params.conditionId);
    if (!condition || condition.isDelete) {
      return res.status(404).json({ status: "fail", message: "Medical condition not found" });
    }
    res.status(200).json({ status: "success", data: condition });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Cập nhật Medical Condition
exports.updateMedicalCondition = async (req, res) => {
  try {
    const updatedCondition = await MedicalCondition.findByIdAndUpdate(
      req.params.conditionId,
      req.body,
      { new: true }
    );
    if (!updatedCondition || updatedCondition.isDelete) {
      return res.status(404).json({ status: "fail", message: "Medical condition not found" });
    }
    res.status(200).json({ status: "success", data: updatedCondition });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Xóa vĩnh viễn Medical Condition
exports.deleteMedicalCondition = async (req, res) => {
  try {
    const deletedCondition = await MedicalCondition.findByIdAndDelete(req.params.conditionId);
    if (!deletedCondition) {
      return res.status(404).json({ status: "fail", message: "Medical condition not found" });
    }
    res.status(200).json({ status: "success", message: "Medical condition permanently deleted" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Tìm kiếm Medical Condition theo tên với phân trang
exports.searchMedicalConditionByName = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    if (!name) {
      return res.status(400).json({ status: "fail", message: "Name query parameter is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Đếm tổng số document khớp với tìm kiếm và chưa bị xóa mềm
    const total = await MedicalCondition.countDocuments({
      name: { $regex: name, $options: "i" },
      isDelete: false,
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    // Tìm kiếm với phân trang
    const conditions = await MedicalCondition.find({
      name: { $regex: name, $options: "i" },
      isDelete: false,
    })
      .skip(skip)
      .limit(parseInt(limit));

    if (conditions.length === 0) {
      return res.status(404).json({ status: "fail", message: "No medical conditions found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        items: conditions,
        total,
        currentPage: parseInt(page),
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

