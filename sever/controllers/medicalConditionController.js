// medicalConditionController.js
const MedicalCondition = require("../models/MedicalCondition");

// Tạo Medical Condition
exports.createMedicalCondition = async (req, res) => {
  try {
    const newCondition = new MedicalCondition(req.body);
    await newCondition.save();
    res.status(201).json({
      status: "success",
      data: newCondition,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Lấy tất cả Medical Conditions (chỉ lấy những chưa bị soft delete)
exports.getAllMedicalConditions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "createdAt", order = "desc" } = req.query;

    // Tạo bộ lọc tìm kiếm
    let filter = { isDelete: false };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Xử lý phân trang
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Xử lý sắp xếp
    const sortOrder = order === "desc" ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Lấy tổng số điều kiện y tế
    const totalItems = await MedicalCondition.countDocuments(filter);
    
    // Lấy danh sách bệnh lý
    const conditions = await MedicalCondition.find(filter)
      .populate("restrictedFoods")
      .populate("recommendedFoods")
      .sort(sortOptions)  // Sắp xếp dữ liệu
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        items: conditions,
        total: totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};


// Lấy Medical Condition theo ID
exports.getMedicalConditionById = async (req, res) => {
  try {
    const condition = await MedicalCondition.findOne({
      _id: req.params.conditionId,
      isDelete: false,
    })
      .populate("restrictedFoods")
      .populate("recommendedFoods");

    if (!condition) {
      return res.status(404).json({
        status: "fail",
        message: "Medical condition not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: condition,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Cập nhật Medical Condition
exports.updateMedicalCondition = async (req, res) => {
  try {
    const condition = await MedicalCondition.findOneAndUpdate(
      { _id: req.params.conditionId, isDelete: false },
      req.body,
      { new: true, runValidators: true }
    )
      .populate("restrictedFoods")
      .populate("recommendedFoods");

    if (!condition) {
      return res.status(404).json({
        status: "fail",
        message: "Medical condition not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: condition,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Xóa mềm Medical Condition (soft delete)
exports.deleteMedicalCondition = async (req, res) => {
  try {
    const condition = await MedicalCondition.findOneAndUpdate(
      { _id: req.params.conditionId, isDelete: false },
      { isDelete: true },
      { new: true }
    );

    if (!condition) {
      return res.status(404).json({
        status: "fail",
        message: "Medical condition not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Medical condition has been soft deleted",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Tìm kiếm Medical Condition theo tên
exports.searchMedicalConditionByName = async (req, res) => {
  try {
    const { name } = req.query;
    const conditions = await MedicalCondition.find({
      name: { $regex: name, $options: "i" },
      isDelete: false,
    })
      .populate("restrictedFoods")
      .populate("recommendedFoods");

    res.status(200).json({
      status: "success",
      results: conditions.length,
      data: conditions,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
