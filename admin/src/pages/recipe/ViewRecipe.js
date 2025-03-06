import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Input from "../../components/ui/input";
import foodIMG from "../../assets/images/Salad.png";

const recipes = [
  {
    id: 1,
    title: "Jewish Cheese Blintzes",
    image: foodIMG, // Placeholder image URL
    description: "A classic Jewish dish with a rich and creamy cheese filling wrapped in a delicate crepe.",
    prepTime: "30 mins",
    cookTime: "10 mins",
    restTime: "30 mins",
    totalTime: "70 mins",
    servings: "6 servings",
    yield: "12 blintzes",
    ingredients: [
      "For the Crepes:",
      "1 cup all-purpose flour",
      "1 cup whole milk",
      "1/2 cup water",
      "2 large eggs",
      "2 tablespoons unsalted butter, melted",
      "1/4 teaspoon salt",
      "For the Filling:",
      "1 1/2 cups farmer's cheese or ricotta",
      "4 ounces cream cheese, softened",
      "1 large egg yolk",
      "1/4 cup granulated sugar",
      "1 teaspoon vanilla extract",
      "For Cooking:",
      "Butter, for frying",
      "Powdered sugar, for serving",
      "Sour cream or fruit preserves, optional",
    ],
    instructions: [
      { step: "In a blender, combine flour, milk, water, eggs, melted butter, and salt. Blend until smooth and let rest for 30 minutes.", image: "https://example.com/step1.jpg" },
      { step: "Heat a nonstick pan over medium heat and lightly butter it. Pour a small amount of batter, swirling to coat the pan evenly. Cook until the edges lift, then flip and cook briefly. Repeat for all crepes.", image: "https://example.com/step2.jpg" },
      { step: "In a bowl, mix farmer's cheese, cream cheese, egg yolk, sugar, and vanilla extract until smooth.", image: "https://example.com/step3.jpg" },
      { step: "Place a spoonful of filling on each crepe, fold in the sides, and roll up like a burrito.", image: "https://example.com/step4.jpg" },
      { step: "Melt butter in a pan over medium heat and fry the blintzes until golden brown on both sides.", image: "https://example.com/step5.jpg" },
      { step: "Serve warm, dusted with powdered sugar, and optionally topped with sour cream or fruit preserves.", image: "https://example.com/step6.jpg" },
    ],
    nutrition: {
      calories: "584",
      fat: "44g",
      carbs: "30g",
      protein: "17g",
    },
  },
];

const RecipeApp = () => {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  const toggleFavorite = (id) => {
    let updatedFavorites;
    if (favorites.includes(id)) {
      updatedFavorites = favorites.filter((fav) => fav !== id);
    } else {
      updatedFavorites = [...favorites, id];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Recipe Finder</h1>
      <div className="w-full max-w-2xl mb-6">
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-sm w-full"
        />
      </div>
      <div className="w-full max-w-4xl px-6">
        {recipes
          .filter((recipe) =>
            recipe.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((recipe) => (
            <Card key={recipe.id} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow relative w-full">
              <img src={recipe.image} alt={recipe.title} className="w-full h-96 object-contain rounded-t-lg" />
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{recipe.title}</h2>
                <p className="text-gray-600 text-lg mb-4">{recipe.description}</p>
                <div className="text-lg mb-4">
                  <p><strong>Prep:</strong> {recipe.prepTime}</p>
                  <p><strong>Cook:</strong> {recipe.cookTime}</p>
                  <p><strong>Rest Time:</strong> {recipe.restTime}</p>
                  <p><strong>Total:</strong> {recipe.totalTime}</p>
                  <p><strong>Servings:</strong> {recipe.servings}</p>
                  <p><strong>Yield:</strong> {recipe.yield}</p>
                </div>
                <Button onClick={() => toggleFavorite(recipe.id)} className="mb-6 w-full">Save Recipe</Button>
                <h3 className="font-semibold text-xl">Ingredients:</h3>
                <ul className="list-disc pl-5 text-gray-700 text-lg mb-4 text-left">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-semibold text-xl">Step by Step:</h3>
                {recipe.instructions.map((step, index) => (
                  <div key={index} className="mb-4">
                    <img src={step.image} alt={`Step ${index + 1}`} className="w-full h-64 object-contain rounded-lg mb-2" />
                    <p className="text-lg">{step.step}</p>
                  </div>
                ))}
                <h3 className="font-semibold text-xl">Nutrition Facts (per serving):</h3>
                <p>Calories: {recipe.nutrition.calories}</p>
                <p>Fat: {recipe.nutrition.fat}</p>
                <p>Carbs: {recipe.nutrition.carbs}</p>
                <p>Protein: {recipe.nutrition.protein}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default RecipeApp;

