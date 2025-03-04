import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Input  from "../../components/ui/input";

import { Star } from "lucide-react";

const recipes = [
  {
    id: 1,
    title: "Jewish Cheese Blintzes",
    image: "https://www.thespruceeats.com/thmb/...", // Placeholder image URL
    description: "A delicious traditional dish with sweet cheese filling.",
    ingredients: [
      "2 cups cottage cheese",
      "2 eggs",
      "1/4 cup sugar",
      "1 tsp vanilla extract",
      "1/2 cup flour",
      "1/2 cup milk",
      "Butter for frying",
    ],
    instructions: [
      "Mix cheese, eggs, sugar, and vanilla in a bowl.",
      "Prepare crepe batter with flour and milk.",
      "Cook thin pancakes in a buttered pan.",
      "Fill pancakes with cheese mixture and roll.",
      "Fry in butter until golden brown.",
    ],
  },
];

const RecipeView = () => {
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Recipe Finder</h1>
      <div className="max-w-2xl mx-auto mb-6">
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {recipes
          .filter((recipe) =>
            recipe.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((recipe) => (
            <Card key={recipe.id} className="p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow relative">
              <img src={recipe.image} alt={recipe.title} className="w-full h-52 object-cover rounded-t-lg" />
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
                <h3 className="font-semibold text-lg">Ingredients:</h3>
                <ul className="list-disc pl-5 text-gray-700 text-sm mb-2">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-semibold text-lg">Instructions:</h3>
                <ol className="list-decimal pl-5 text-gray-700 text-sm">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="mb-1">{step}</li>
                  ))}
                </ol>
                <Button
                  onClick={() => toggleFavorite(recipe.id)}
                  className="mt-4 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  <Star className={favorites.includes(recipe.id) ? "text-white" : "text-gray-800"} />
                  {favorites.includes(recipe.id) ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default RecipeView;
