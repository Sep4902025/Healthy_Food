import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import IngredientService from "../../services/nutritionist/ingredientsServices";
import DishService from "../../services/nutritionist/dishesServices";

import {Timer } from "lucide-react";

import ReviewSection from "./ReviewSection";
import recipesService from "../../services/nutritionist/recipesServices";

const RecipeApp = () => {
  const { dishId, recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  console.log("RC", recipe);

  const [dish, setDish] = useState(null);
  const [ingredients, setIngredients] = useState([]);

  const user = useSelector(selectAuth)?.user;

  console.log("User: ", user);
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeResponse = await recipesService.getRecipeById(dishId, recipeId);
        setRecipe(recipeResponse.data);

        const dishResponse = await DishService.getDishById(recipeResponse.data.dishId._id);
        setDish(dishResponse.data);

        const ingredientPromises = recipeResponse.data.ingredients.map((item) =>
          IngredientService.getIngredientById(item.ingredientId._id)
        );
        const ingredientResults = await Promise.all(ingredientPromises);
        setIngredients(ingredientResults.map((res) => res.data.data));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  if (!recipe || !dish) return <p className="text-center mt-10 text-gray-500">Recipe not found!</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">{dish.name}</h2>
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-56 h-56 object-cover rounded-full mx-auto mb-4 shadow-lg border-4 border-gray-300 transition-transform duration-300 hover:scale-105"
        />

        <p className="text-gray-700 text-lg mb-4 text-center">{dish.description}</p>
        <p className="text-gray-600 mt-1">🍽 Type: {dish.type} </p>
        <p className="text-gray-700 text-lg mb-4 text-center">🌞 Season: {dish.season}</p>
        <p className="text-lg font-semibold flex items-center justify-center mt-3 text-gray-800">
          <Timer className="w-5 h-5 mr-2 text-gray-600" /> Cooking time: {recipe.cookingTime}{" "}
          minutes
        </p>
      </div>

      {/* Ingredients List */}
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-3xl w-full mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          🍽️ Ingredients for {recipe.totalServing} servings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipe.ingredients.map((item, index) => {
            const ingredient = ingredients.find((ing) => ing._id === item.ingredientId._id);
            return ingredient ? (
              <div key={index} className="flex items-center bg-gray-50 rounded-lg p-4 shadow-md">
                <img
                  src={ingredient.imageUrl}
                  alt={ingredient.name}
                  className="w-16 h-16 object-cover rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{ingredient.name}</h4>
                  <p className="text-gray-600">
                    Quantity: {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Nutrition Info Card */}
      <Card className="mt-6 max-w-3xl w-full bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold mb-4">🍏 Nutrition Information</h3>
        <p className="text-gray-700">
          🔥 {recipe.totalCalories} cal | 🥩 {recipe.totalProtein}g Protein | 🥑 {recipe.totalFat}g
          Fat | 🌾 {recipe.totalCarbs}g
        </p>
      </Card>

      {/* Cooking Instructions Card */}
      <Card className="mt-6 max-w-3xl w-full bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold mb-4">📖 Cooking Instructions</h3>
        <div className="text-gray-700">
          {recipe.instruction?.map((step, index) => (
            <p key={step._id} className="mb-2 flex items-start">
              <span className="font-semibold mr-2">Step {step.step}:</span> {step.description}
            </p>
          ))}
        </div>

        {/* Embed YouTube Video if videoUrl exists */}
        {dish.videoUrl && (
          <div className="mt-6">
            <h4 className="text-xl font-semibold mb-2">Instruction Video</h4>
            <div className="relative" style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}>
              <iframe
                src={dish.videoUrl}
                title="Recipe Instruction Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Review Section */}
      <ReviewSection dishId={dishId} recipeId={recipeId} />
    </div>
  );
};

export default RecipeApp;