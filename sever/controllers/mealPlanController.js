const MealPlan = require("../models/MealPlan");
const Reminder = require("../models/Reminder");
const { createRemindersForMealPlan } = require("./reminderController");

// 🛠️ Tạo MealPlan với mealsByDay
exports.createMealPlan = async (req, res) => {
  try {
    const { userId, type, duration, mealsByDay, startDate, endDate } = req.body;

    const newMealPlan = new MealPlan({
      userId,
      type,
      duration,
      mealsByDay,
      startDate,
      endDate,
    });

    await newMealPlan.save();

    // Gọi hàm tạo Reminder ngay sau khi tạo MealPlan
    await createRemindersForMealPlan(newMealPlan);

    res.status(201).json({ message: "MealPlan & Reminders created!", data: newMealPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách MealPlan của user
exports.getUserMealPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const mealPlans = await MealPlan.find({ userId, isDelete: false });
    res.status(200).json({ success: true, data: mealPlans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết một MealPlan
exports.getMealPlanById = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan || mealPlan.isDelete) {
      return res.status(404).json({ success: false, message: "MealPlan not found" });
    }
    res.status(200).json({ success: true, data: mealPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật MealPlan
exports.updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mealPlan) {
      return res.status(404).json({ success: false, message: "MealPlan not found" });
    }
    res.status(200).json({ success: true, data: mealPlan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa MealPlan (soft delete)
exports.deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    if (!mealPlan) {
      return res.status(404).json({ success: false, message: "MealPlan not found" });
    }
    res.status(200).json({ success: true, message: "MealPlan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// hủy Meal Plan
const cancelMealPlan = async (userId, mealPlanId) => {
  try {
    // Vô hiệu hóa MealPlan
    await MealPlan.updateOne({ _id: mealPlanId, userId: userId }, { $set: { isPause: true } });

    // Tìm tất cả Reminder của MealPlan này
    const reminders = await Reminder.find({ mealPlanId: mealPlanId });

    // Hủy từng job trên Agenda
    for (const reminder of reminders) {
      if (reminder.jobId) {
        await agenda.cancel({ name: reminder.jobId });
      }
    }

    // Cập nhật status của Reminder thành "cancelled"
    await Reminder.updateMany({ mealPlanId: mealPlanId }, { $set: { status: "cancelled" } });

    return { success: true, message: "MealPlan đã bị hủy thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi khi hủy MealPlan", error };
  }
};
// Tiếp tục lại Meal PlanPlan
const resumeMealPlan = async (userId, mealPlanId) => {
  try {
    // Kích hoạt lại MealPlan
    await MealPlan.updateOne({ _id: mealPlanId, userId: userId }, { $set: { isPause: false } });

    // Tìm các Reminder đã bị hủy trước đó
    const reminders = await Reminder.find({ mealPlanId: mealPlanId, status: "cancelled" });

    // Kích hoạt lại Reminder bằng cách tạo job mới trên Agenda
    for (const reminder of reminders) {
      const newJob = await agenda.schedule(reminder.remindTime, "sendReminder", {
        reminderId: reminder._id,
      });

      // Cập nhật lại job_id và trạng thái
      await Reminder.updateOne(
        { _id: reminder._id },
        { $set: { jobId: newJob.attrs._id, status: "scheduled" } }
      );
    }

    return { success: true, message: "MealPlan đã được kích hoạt lại!" };
  } catch (error) {
    return { success: false, message: "Lỗi khi kích hoạt lại MealPlan", error };
  }
};
