import React from 'react';
import { Heart} from "lucide-react";

const recommendedRecipes = [
  {
    id: 1,
    name: "Fattoush Salad",
    description: "Description of the item",
    rating: 4.9,
    category: "Breakfast",
    image: "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
  },
  {
    id: 2,
    name: "Vegetable Salad",
    description: "Description of the item",
    rating: 4.6,
    category: "Breakfast",
    image: "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
  },
  {
    id: 3,
    name: "Egg Vegi Salad",
    description: "Description of the item",
    rating: 4.5,
    category: "Breakfast",
    image: "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
  },
  {
    id: 4,
    name: "Egg Vegi Salad",
    description: "Description of the item",
    rating: 4.5,
    category: "Breakfast",
    image: "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
  },
  {
    id: 5,
    name: "Egg Vegi Salad",
    description: "Description of the item",
    rating: 4.5,
    category: "Breakfast",
    image: "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
  },
  {
    id: 6,
    name: "Egg Vegi Salad",
    description: "Description of the item",
    rating: 4.5,
    category: "Breakfast",
    image: "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
  },
];

const FoodByCateSection = () => {
  return (
    <div>
      <h2 className="text-[56px] font-bold font-['Syne'] text-white bg-[#40b491] py-6 px-6 rounded-lg text-left mt-10">
        Recommended for you
      </h2>

      <div className="w-full py-2 px-[50px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
        {recommendedRecipes.map((recipe) => (
          <div
          key={recipe.id}
          className="relative bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 p-6 rounded-3xl shadow-2xl shadow-gray-500/50 transition transform hover:scale-105 text-left max-w-[400px] w-full mx-auto"

        >
        
            {/* Category Tag */}
            <span className="absolute top-2 right-2 bg-[#40b491] uppercase text-white text-xs font-semibold px-2 py-1 rounded-full">
              {recipe.category}
            </span>

            {/* Image */}
            <img
              src={recipe.image}
              alt={recipe.name}
              className="rounded-full w-[200px] h-[200px] object-cover mx-auto"
            />

            {/* Recipe Name */}
            <h3 className="mt-3 text-lg font-semibold font-['Inter'] text-gray-800 dark:text-white">
              {recipe.name}
            </h3>

            {/* Description */}
            <p className="mt-1 text-sm font-['Inter'] text-gray-500 dark:text-gray-300 line-clamp-2">
              {recipe.description}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-sm font-semibold font-['Inter'] text-[#ff6868] dark:text-white">
                Rating:
              </p>
              <p className="text-yellow-500 font-bold flex items-center text-sm">
                ⭐ {recipe.rating}
              </p>
            </div>

            {/* Heart Icon */}
            <div className="food-like-container flex items-center justify-center">
                <div
                  className="w-[87px] h-[75px] bg-[#40B491] rounded-tr-[37.5px] rounded-bl-[42.5px] flex items-center justify-center relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    
                  }}
                >
                  <Heart
                    size={32}
                    className={`text-white 
                        ? "fill-white"
                        : "stroke-white"
                    }`}
                  />
                </div>
              </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="px-8 py-3 bg-white text-[#40b491] dark:bg-gray-700 dark:text-white font-semibold rounded-full shadow-lg hover:bg-[#40b491] hover:text-[#555555] transition outline">
          VIEW ALL RECIPES
        </button>
      </div>
    </div>
  )
}

export default FoodByCateSection;
