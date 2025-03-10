const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema({
  title: String,
  userId: mongoose.Types.ObjectId,
  orderId: mongoose.Types.ObjectId,
  type: { type: String, enum: ["fixed", "custom"], required: true }, // Xác định loại
  duration: Number,
  startDate: Date,
  endDate: Date,
  price: Number,
  created_by: mongoose.Types.ObjectId,
  isBlock: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  isPause: { type: Boolean, default: false },
  isDelete: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  mealsByDay: [
    {
      date: String, // YYYY-MM-DD
      meals: [
        {
          mealTime: String, // "07:00"
          mealName: String, // "Breakfast", "Lunch", "Dinner"
          dishes: [
            {
              dishId: mongoose.Types.ObjectId,
              name: String,
              calories: Number,
            },
          ],
          _id: false, // Bỏ `_id` tự sinh cho `meals`
        },
      ],
      _id: false, // Bỏ `_id` tự sinh cho `mealsByDay`
    },
  ],
});

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
module.exports = MealPlan;
