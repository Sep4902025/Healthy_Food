import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const NutritionistLayout = () => {
  const [isDishOpen, setIsDishOpen] = useState(false);
  const [isIngredientOpen, setIsIngredientOpen] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 text-2xl font-bold text-green-700">Nutritionist Dashboard</div>
        <nav className="mt-4">
          <ul className="space-y-2">
            {/* Dish Management */}
            <li>
              <button
                onClick={() => setIsDishOpen(!isDishOpen)}
                className="w-full flex justify-between items-center p-3 text-gray-600 font-semibold hover:bg-gray-200"
              >
                Dish Management
                {isDishOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {isDishOpen && (
                <ul className="ml-4 space-y-1 transition-all">
                  <li>
                    <NavLink to="/nutritionist/dishes" className="block p-2 hover:bg-gray-200">
                      View Dishes
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/nutritionist/dishes/add" className="block p-2 hover:bg-gray-200">
                      Add New Dish
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            {/* Ingredient Management */}
            <li>
              <button
                onClick={() => setIsIngredientOpen(!isIngredientOpen)}
                className="w-full flex justify-between items-center p-3 text-gray-600 font-semibold hover:bg-gray-200"
              >
                Ingredient Management
                {isIngredientOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {isIngredientOpen && (
                <ul className="ml-4 space-y-1 transition-all">
                  <li>
                    <NavLink to="/nutritionist/ingredients" className="block p-2 hover:bg-gray-200">
                      View Ingredients
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/nutritionist/ingredients/add" className="block p-2 hover:bg-gray-200">
                      Add New Ingredient
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            {/* Recipes Management */}
            <li>
              <button
                onClick={() => setIsRecipeOpen(!isRecipeOpen)}
                className="w-full flex justify-between items-center p-3 text-gray-600 font-semibold hover:bg-gray-200"
              >
                Recipes Management
                {isRecipeOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {isRecipeOpen && (
                <ul className="ml-4 space-y-1 transition-all">
                  <li>
                    <NavLink to="/nutritionist/recipes" className="block p-2 hover:bg-gray-200">
                      View Recipes
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/nutritionist/recipes/add" className="block p-2 hover:bg-gray-200">
                      Add New Recipe
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default NutritionistLayout;
