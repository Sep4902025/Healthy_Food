const mongoose = require("mongoose");

const MedicalConditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    restrictedFoods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
        validate: {
          validator: function (value) {
            return !this.recommendedFoods.includes(value);
          },
          message: "A dish cannot be both restricted and recommended.",
        },
      },
    ],
    recommendedFoods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
        validate: {
          validator: function (value) {
            return !this.restrictedFoods.includes(value);
          },
          message: "A dish cannot be both restricted and recommended.",
        },
      },
    ],
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalCondition", MedicalConditionSchema);