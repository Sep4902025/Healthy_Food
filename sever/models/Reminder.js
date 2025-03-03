const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mealPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "MealPlan", required: true },

    message: { type: String, required: true },

    remindTime: { type: Date, required: true }, // Lưu dưới dạng `Date`
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: null,
      required: false,
    },

    jobId: { type: String, default: null }, // ID của job trong Agenda

    status: {
      type: String,
      enum: ["scheduled", "pending", "sent", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", ReminderSchema);
