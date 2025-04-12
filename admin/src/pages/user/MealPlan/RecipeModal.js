import React, { useState, useEffect } from "react";
import dishesService from "../../../services/nutritionist/dishesServices";
import ingredientsService from "../../../services/nutritionist/ingredientsServices";
import { Timer, X, Plus, Minus } from "lucide-react";
import { Card } from "../../../components/ui/card";
import recipesService from "../../../services/nutritionist/recipesServices";

const RecipeModal = ({ dishId, recipeId, onClose }) => {
  const [recipe, setRecipe] = useState(null);
  console.log("RC", recipe);

  const [dish, setDish] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
  const [servingSize, setServingSize] = useState(null); // State for user-adjusted serving size

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeResponse = await recipesService.getRecipeById(dishId, recipeId);
        setRecipe(recipeResponse.data);

        const dishResponse = await dishesService.getDishById(recipeResponse.data.dishId._id);
        setDish(dishResponse.data);

        // Set initial serving size to the dish's totalServing
        setServingSize(dishResponse.data.totalServing);

        const ingredientPromises = recipeResponse.data.ingredients.map((item) =>
          ingredientsService.getIngredientById(item.ingredientId._id)
        );
        const ingredientResults = await Promise.all(ingredientPromises);
        setIngredients(ingredientResults.map((res) => res.data.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRecipe();
  }, [dishId, recipeId]);

  if (!recipe || !dish || servingSize === null)
    return <p className="text-center mt-10 text-gray-500">Recipe not found!</p>;

  // Function to calculate adjusted ingredient quantities based on serving size
  const calculateQuantity = (originalQuantity) => {
    const ratio = servingSize / dish.totalServing;
    return Math.round(originalQuantity * ratio * 10) / 10; // Round to 1 decimal place
  };

  // Handlers for adjusting serving size
  const increaseServing = () => setServingSize((prev) => prev + 1);
  const decreaseServing = () => setServingSize((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{dish.name}</h2>
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-20 h-20 rounded-full object-cover mt-2"
          />
          <p className="text-gray-600 text-center text-sm mt-2">{dish.description}</p>
          <p className="text-base font-semibold flex items-center text-gray-800 mt-2">
            <Timer className="w-4 h-4 mr-1 text-gray-600" /> Cooking Time: {recipe.cookingTime} mins
          </p>
        </div>

        {/* Serving Size Adjustment */}
        <div className="flex items-center justify-center mb-4">
          <span className="text-sm font-medium text-gray-700 mr-2">Servings:</span>
          <button
            onClick={decreaseServing}
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            disabled={servingSize <= 1}
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <span className="mx-3 text-lg font-semibold text-gray-800">{servingSize}</span>
          <button
            onClick={increaseServing}
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Ingredients and Instructions Section */}
        <div className="flex gap-4">
          {/* Ingredients List (1/3) */}
          <div className="w-1/3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🍽️</span> Ingredients
            </h3>
            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {recipe.ingredients.map((item, index) => {
                const ingredient = ingredients.find((ing) => ing._id === item.ingredientId._id);
                return ingredient ? (
                  <li
                    key={index}
                    className="flex items-center border-b border-gray-200 pb-2 last:border-b-0"
                  >
                    <img
                      src={
                        ingredient?.imageUrl ||
                        "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
                      }
                      alt={ingredient.name}
                      className="w-8 h-8 object-cover rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-medium text-sm">{ingredient.name}</h4>
                      <p className="text-gray-600 text-xs">
                        {calculateQuantity(item.quantity)} {item.unit}
                      </p>
                    </div>
                  </li>
                ) : null;
              })}
            </ul>
          </div>

          {/* Cooking Instructions (2/3) */}
          <Card className="w-2/3 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">📖</span> Instructions
              </h3>
              <button
                onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                {isInstructionsOpen ? "Hide" : "Show"}
              </button>
            </div>
            {isInstructionsOpen && (
              <div className="max-h-80 overflow-y-auto">
                {" "}
                {/* Added max-height and scrolling */}
                {/* Video Section (if videoUrl exists) */}
                {recipe?.dishId?.videoUrl && (
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">🎥</span> Video Tutorial
                    </h4>
                    <div
                      className="relative w-full"
                      style={{ paddingTop: "56.25%" /* 16:9 Aspect Ratio */ }}
                    >
                      <iframe
                        src={recipe?.dishId?.videoUrl}
                        title="Recipe Video Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                      ></iframe>
                    </div>
                  </div>
                )}
                {/* Written Instructions */}
                <ol className="list-decimal pl-5 text-gray-700 space-y-2 max-h-40 overflow-y-auto text-sm">
                  {recipe.instruction?.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-medium mr-1">Step {step.step}:</span>
                      <p>{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
