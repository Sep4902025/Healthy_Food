import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useParams } from "react-router-dom";
import RecipeService from "../../services/recipe.service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import commentService from "./../../services/comment.service";
import IngredientService from "../../services/nutritionist/ingredientsServices";
import DishService from "../../services/nutritionist/dishesServices";
import { toast } from "react-toastify";
import Salad from "../../assets/images/Salad.png";
import FemaleUser from "../../assets/images/FemaleUser.png";
import { CheckCircle, Timer } from "lucide-react";

const RecipeApp = () => {
  const { dishId, recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [dish, setDish] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [rating, setRating] = useState(5);
  const [ratings, setRatings] = useState([]);
  const user = useSelector(selectAuth)?.user;

  console.log("User: ", user);
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeResponse = await RecipeService.getRecipeByRecipeId(dishId, recipeId);
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

    const fetchRatings = async () => {
      try {
        const response = await commentService.getRatingsByRecipe(recipeId);
        setRatings(response.data);
      } catch (error) {
        console.error("Error loading ratings:", error);
      }
    };

    fetchRecipe();
    fetchRatings();
  }, [recipeId]);

  if (!recipe || !dish) return <p className="text-center mt-10 text-gray-500">Recipe not found!</p>;

  const handleRateRecipe = async () => {
    try {
      const response = await commentService.rateRecipe(recipeId, user?._id, rating);

      if (response.success) {
        toast.success(`Rating successful ⭐`);

        // Get user info from Redux (or API if needed)
        setRatings((prevRatings) => {
          // Check if the user has already rated
          const existingIndex = prevRatings.findIndex((r) => r.userId._id === user?._id);

          const newRating = {
            ...response.data.data,
            userId: { _id: user._id, email: user.email }, // Add name
          };

          if (existingIndex !== -1) {
            // If exists, update the old rating
            const updatedRatings = [...prevRatings];
            updatedRatings[existingIndex] = newRating;
            return updatedRatings;
          }

          // If not, add a new one to the list
          return [...prevRatings, newRating];
        });
      } else {
        toast.error("Error submitting rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

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
        <ol className="list-decimal pl-5 text-gray-700">
          {recipe.instruction?.map((step) => (
            <li key={step._id} className="mb-2 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1" /> {step.description}
            </li>
          ))}
        </ol>
      </Card>

      <div className="w-full max-w-3xl mt-6 bg-white p-6 rounded-lg shadow-md">
        <div className="mt-6 bg-gray-100 p-4 rounded-xl shadow-md">
          {/* Rating Section */}
          <label className="block mb-2 text-lg font-semibold text-gray-700">
            ⭐ Rate this dish:
          </label>
          <div className="relative">
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full p-3 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white shadow-sm appearance-none"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {`⭐`.repeat(star)} {star} stars
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              ⭐
            </div>
          </div>
          <Button
            onClick={handleRateRecipe}
            className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300"
          >
            🚀 Submit Rating
          </Button>
        </div>

        {/* Reviews Display Section */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📢 User Reviews</h3>
          {ratings.length === 0 ? (
            <p className="text-gray-500 text-center">No reviews yet.</p>
          ) : (
            ratings.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img src={FemaleUser} alt="avatar" className="w-10 h-10 rounded-full border" />
                  <div>
                    <p className="font-semibold text-gray-800">{review.userId?.email}</p>
                    <p className="text-sm text-gray-500 text-left">
                      {new Date(review.updatedAt || review.createdAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {/* Display rated stars */}
                <div className="flex mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < review.star ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeApp;
