const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const UserPreferenceModel = require("../models/UserPrefenrenceModel");

exports.createUserPreference = async (req, res) => {
  try {
    const {
      userId,
      age,
      diet,
      eatHabit,
      email,
      favorite,
      longOfPlan,
      mealNumber,
      name,
      goal,
      sleepTime,
      waterDrink,
      currentMealplanId,
      previousMealplanId,
      hate,
      recommendedFoods,
      weight,
      weightGoal,
      height,
      activityLevel,
      gender,
      phoneNumber,
      underDisease,
      theme,
      isDelete,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !name || !userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu các trường bắt buộc: email, name, userId!",
      });
    }

    // Kiểm tra userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ!",
      });
    }

    // Kiểm tra userId có tồn tại trong UserModel không
    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với userId này!",
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ!",
      });
    }

    // Tạo user preference mới
    const newUserPreference = new UserPreferenceModel({
      userId,
      age,
      diet,
      eatHabit,
      email,
      favorite,
      longOfPlan,
      mealNumber,
      name,
      goal,
      sleepTime,
      waterDrink,
      currentMealplanId,
      previousMealplanId,
      hate,
      recommendedFoods,
      weight,
      weightGoal,
      height,
      activityLevel,
      gender,
      phoneNumber,
      underDisease,
      theme,
      isDelete: isDelete || false,
    });

    await newUserPreference.save();

    // Cập nhật userPreferenceId trong UserModel
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { userPreferenceId: newUserPreference._id },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng để cập nhật userPreferenceId!",
      });
    }

    // Trả về phản hồi
    res.status(201).json({
      success: true,
      message: "Sở thích người dùng đã được tạo và liên kết với người dùng!",
      data: {
        userPreference: newUserPreference,
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Read all User Preferences (not deleted)
exports.getAllUserPreferences = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const preferences = await UserPreferenceModel.find({ isDelete: false })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await UserPreferenceModel.countDocuments({ isDelete: false });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sở thích người dùng thành công!",
      data: preferences,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Read User Preference by ID
exports.getUserPreferenceById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ!",
      });
    }

    const preference = await UserPreferenceModel.findById(req.params.id);
    if (!preference || preference.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sở thích người dùng!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy sở thích người dùng thành công!",
      data: preference,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

exports.updateUserPreference = async (req, res) => {
  try {
    const userPreferenceId = req.params.userPreferenceId; // Lấy đúng tham số từ route

    // Cập nhật bản ghi và kiểm tra ngay trong một bước
    const updatedPreference = await UserPreferenceModel.findOneAndUpdate(
      { _id: userPreferenceId, isDelete: false }, // Tìm bản ghi chưa bị xóa
      req.body, // Dữ liệu cập nhật từ client
      { new: true } // Trả về bản ghi đã cập nhật
    );

    // Nếu không tìm thấy bản ghi hoặc bản ghi đã bị xóa
    if (!updatedPreference) {
      return res.status(404).json({
        status: "fail",
        message: "User Preference not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sở thích người dùng thành công!",
      data: updatedPreference,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Soft Delete User Preference
exports.softDeleteUserPreference = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ!",
      });
    }

    const preference = await UserPreferenceModel.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sở thích người dùng!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sở thích người dùng đã được xóa mềm thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Permanently Delete User Preference
exports.deleteUserPreference = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ!",
      });
    }

    const deletedPreference = await UserPreferenceModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedPreference) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sở thích người dùng!",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { userPreferenceId: req.params.id },
      { userPreferenceId: null },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message:
        "Sở thích người dùng đã được xóa vĩnh viễn và userPreferenceId đã được xóa!",
      data: { deletedPreference, updatedUser },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Search User Preferences by name (case insensitive)
exports.searchUserPreferencesByName = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tham số name là bắt buộc!",
      });
    }

    const preferences = await UserPreferenceModel.find({
      name: { $regex: name, $options: "i" },
      isDelete: false,
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserPreferenceModel.countDocuments({
      name: { $regex: name, $options: "i" },
      isDelete: false,
    });

    res.status(200).json({
      success: true,
      message: "Tìm kiếm sở thích người dùng thành công!",
      data: preferences,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Filter User Preferences by diet
exports.filterUserPreferencesByDiet = async (req, res) => {
  try {
    const { diet, page = 1, limit = 10 } = req.query;
    if (!diet) {
      return res.status(400).json({
        success: false,
        message: "Tham số diet là bắt buộc!",
      });
    }

    const preferences = await UserPreferenceModel.find({
      diet: diet,
      isDelete: false,
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserPreferenceModel.countDocuments({
      diet: diet,
      isDelete: false,
    });

    res.status(200).json({
      success: true,
      message: "Lọc sở thích người dùng theo chế độ ăn thành công!",
      data: preferences,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Get User Preference By User ID
exports.getUserPreferenceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ!",
      });
    }

    const preference = await UserPreferenceModel.findOne({
      userId,
      isDelete: false,
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sở thích người dùng!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy sở thích người dùng theo userId thành công!",
      data: preference,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

// Delete User by userId
exports.deleteUserByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ!",
      });
    }

    // Tìm user trong UserModel
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với userId này!",
      });
    }

    // Kiểm tra và xóa userPreference nếu userPreferenceId tồn tại
    let deletedPreference = null;
    if (user.userPreferenceId) {
      deletedPreference = await UserPreferenceModel.findOneAndDelete({
        _id: user.userPreferenceId,
      });
      if (!deletedPreference) {
        console.warn(
          "🚨 Không tìm thấy sở thích người dùng để xóa với userPreferenceId:",
          user.userPreferenceId
        );
      }
    } else {
      console.log("🚀 Không có userPreferenceId để xóa.");
    }

    // Xóa user trong UserModel (với tùy chọn hardDelete: true để bỏ qua soft delete)
    const deletedUser = await UserModel.findByIdAndDelete(userId, {
      hardDelete: true,
    });
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Không thể xóa người dùng!",
      });
    }

    // Trả về phản hồi thành công
    res.status(200).json({
      success: true,
      message: "Người dùng đã được xóa vĩnh viễn!",
      data: {
        deletedUser,
        deletedPreference:
          deletedPreference || "Không có sở thích người dùng để xóa",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

exports.resetUserPreference = async (req, res) => {
  try {
    const { userPreferenceId } = req.params;
    console.log("req.params:", req.params);

    // Kiểm tra ID hợp lệ trước khi truy vấn MongoDB

    const defaultValues = {
      age: "",
      diet: "",
      eatHabit: [],
      favorite: [],
      longOfPlan: "",
      mealNumber: "0",
      goal: "",
      sleepTime: "",
      waterDrink: "",
      hate: [],
      weight: 0,
      weightGoal: 0,
      height: 0,
      gender: "",
      phoneNumber: "",
      underDisease: [],
      theme: false,
      isDelete: false,
    };

    // Kiểm tra xem userPreference có tồn tại không
    const existingPreference = await UserPreferenceModel.findOne({
      _id: userPreferenceId,
      isDelete: false,
    });

    if (!existingPreference) {
      return res
        .status(404)
        .json({ status: "fail", message: "User Preference not found" });
    }

    // Cập nhật dữ liệu
    const updatedPreference = await UserPreferenceModel.findByIdAndUpdate(
      userPreferenceId,
      { $set: defaultValues },
      { new: true }
    );

    if (!updatedPreference) {
      return res.status(404).json({
        status: "fail",
        message: "User Preference not found or could not be updated",
      });
    }

    console.log("Updated data:", updatedPreference);

    res.status(200).json({
      status: "success",
      message: "User Preference reset successfully",
      data: updatedPreference,
    });
  } catch (error) {
    console.error("Error resetting userPreference:", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};
