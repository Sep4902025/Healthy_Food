const UserModel = require("../models/UserModel");
const UserPreferenceModel = require("../models/UserPreferenceModel");

exports.createUserPreference = async (req, res) => {
  try {
    const { userId, ...preferenceData } = req.body;

    // Kiểm tra nếu userId không được cung cấp
    if (!userId) {
      return res
        .status(400)
        .json({ status: "fail", message: "User ID is required" });
    }

    // Tạo mới UserPreference và gán userId
    const newUserPreference = new UserPreferenceModel({
      ...preferenceData,
      userId, // Gán userId vào UserPreference
    });
    await newUserPreference.save();

    // Cập nhật userPreferenceId trong UserModel
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { userPreferenceId: newUserPreference._id },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    res.status(201).json({
      status: "success",
      data: { userPreference: newUserPreference, user: updatedUser },
    });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Read all User Preferences (not deleted)
exports.getAllUserPreferences = async (req, res) => {
  try {
    const preferences = await UserPreferenceModel.find({ isDelete: false });
    res.status(200).json({ status: "success", data: preferences });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Read User Preference by ID
exports.getUserPreferenceById = async (req, res) => {
  try {
    const preference = await UserPreferenceModel.findById(req.params.id);
    if (!preference || preference.isDelete) {
      return res
        .status(404)
        .json({ status: "fail", message: "User Preference not found" });
    }
    res.status(200).json({ status: "success", data: preference });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Update User Preference
exports.updateUserPreference = async (req, res) => {
  try {
    const updatedPreference = await UserPreferenceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPreference || updatedPreference.isDelete) {
      return res
        .status(404)
        .json({ status: "fail", message: "User Preference not found" });
    }
    res.status(200).json({ status: "success", data: updatedPreference });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// Soft Delete User Preference
exports.softDeleteUserPreference = async (req, res) => {
  try {
    const preference = await UserPreferenceModel.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    if (!preference) {
      return res
        .status(404)
        .json({ status: "fail", message: "User Preference not found" });
    }
    res
      .status(200)
      .json({ status: "success", message: "User Preference soft deleted" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Permanently Delete User Preference
exports.deleteUserPreference = async (req, res) => {
  try {
    // Tìm UserPreference trước khi xóa để lấy userId
    const deletedPreference = await UserPreferenceModel.findByIdAndDelete(
      req.params.id
    );

    if (!deletedPreference) {
      return res
        .status(404)
        .json({ status: "fail", message: "User Preference not found" });
    }

    // Cập nhật userPreferenceId của User thành null
    await UserModel.findOneAndUpdate(
      { userPreferenceId: req.params.id },
      { userPreferenceId: null }
    );

    res.status(200).json({
      status: "success",
      message:
        "User Preference permanently deleted and userPreferenceId removed",
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Search User Preferences by name (case insensitive)
exports.searchUserPreferencesByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res
        .status(400)
        .json({ status: "fail", message: "Name query parameter is required" });
    }

    const preferences = await UserPreferenceModel.find({
      name: { $regex: name, $options: "i" },
      isDelete: false,
    });

    res.status(200).json({ status: "success", data: preferences });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Filter User Preferences by diet
exports.filterUserPreferencesByDiet = async (req, res) => {
  try {
    const { diet } = req.query;
    if (!diet) {
      return res
        .status(400)
        .json({ status: "fail", message: "Diet query parameter is required" });
    }

    const preferences = await UserPreferenceModel.find({
      diet: diet,
      isDelete: false,
    });

    res.status(200).json({ status: "success", data: preferences });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get User Preference By User ID
exports.getUserPreferenceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const preference = await UserPreferenceModel.findOne({
      userId,
      isDelete: false,
    });

    if (!preference) {
      return res
        .status(404)
        .json({ status: "fail", message: "User Preference not found" });
    }

    res.status(200).json({ status: "success", data: preference });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
