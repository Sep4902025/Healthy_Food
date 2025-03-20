import React, { useState, useEffect } from "react";
import recipeService from "../../../services/recipe.service";
import dishesService from "../../../services/nutritionist/dishesServices";
import ingredientsService from "../../../services/nutritionist/ingredientsServices";
import { CheckCircle, Timer, X } from "lucide-react";
import { Card } from "../../../components/ui/card";

const RecipeModal = ({ dishId, recipeId, onClose }) => {
  const [recipe, setRecipe] = useState(null);
  const [dish, setDish] = useState(null);
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeResponse = await recipeService.getRecipeByRecipeId(dishId, recipeId);
        setRecipe(recipeResponse.data);

        const dishResponse = await dishesService.getDishById(recipeResponse.data.dishId._id);
        setDish(dishResponse.data);

        const ingredientPromises = recipeResponse.data.ingredients.map((item) =>
          ingredientsService.getIngredientById(item.ingredientId)
        );
        const ingredientResults = await Promise.all(ingredientPromises);
        setIngredients(ingredientResults.map((res) => res.data.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRecipe();
  }, [dishId, recipeId]);

  if (!recipe || !dish) return <p className="text-center mt-10 text-gray-500">Recipe not found!</p>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-2xl w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800">{dish.name}</h2>
        <p className="text-gray-600 text-center">{dish.description}</p>
        <p className="text-lg font-semibold flex items-center justify-center text-gray-800 mt-3">
          <Timer className="w-5 h-5 mr-2 text-gray-600" /> Cooking Time: {recipe.cookingTime} mins
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Ingredients List */}
          <Card className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🍽️ Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((item, index) => {
                const ingredient = ingredients.find((ing) => ing._id === item.ingredientId);
                return ingredient ? (
                  <li key={index} className="flex items-center bg-gray-100 rounded-md p-3 shadow">
                    <img
                      src={ingredient?.imageUrl}
                      alt={ingredient.name}
                      className="w-10 h-10 object-cover rounded-full mr-3"
                    />
                    <div>
                      <h4 className="text-gray-900 font-medium">{ingredient.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </li>
                ) : null;
              })}
            </ul>
          </Card>

          {/* Cooking Instructions */}
          <Card className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📖 Instructions</h3>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2">
              {recipe.instruction?.map((step, index) => (
                <li key={index} className="flex items-start">
                  <p>Step{step.step}: </p>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
