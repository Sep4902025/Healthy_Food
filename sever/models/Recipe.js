const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: Number },
      unit: { type: String, enum: ["g", "ml", "tbsp", "tp"], required: true },
    },
  ],
  instruction: [{ step: Number, description: String }],
  totalServings: { type: Number },
});

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
