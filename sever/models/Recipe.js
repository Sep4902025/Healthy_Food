const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    ingredients: [
      {
        ingredientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        quantity: { type: Number, required: true, min: 0.1, default: 1 }, // Không cho phép số âm hoặc 0
        unit: { type: String, required: true, trim: true }, // Đơn vị đo lường (bắt buộc nhập)
      },
    ],
    totalServings: {
      type: Number,
      required: true,
      min: 1, // Ít nhất phải có 1 phần ăn
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
