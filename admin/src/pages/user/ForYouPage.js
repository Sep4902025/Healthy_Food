import React, { useRef, useContext } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Heart, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { DarkModeContext } from "../context/DarkModeContext";

const ForYoyPage = () => {
  const sliderRef = useRef(null);

  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const categories = [
    {
      id: 1,
      name: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 2,
      name: "Dessert",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 3,
      name: "Dinner",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 4,
      name: "Lunch",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
  ];

  const recommendedRecipes = [
    {
      id: 1,
      name: "Fattoush Salad",
      description: "Description of the item",
      rating: 4.9,
      category: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 2,
      name: "Vegetable Salad",
      description: "Description of the item",
      rating: 4.6,
      category: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 3,
      name: "Egg Vegi Salad",
      description: "Description of the item",
      rating: 4.5,
      category: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 4,
      name: "Egg Vegi Salad",
      description: "Description of the item",
      rating: 4.5,
      category: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 5,
      name: "Egg Vegi Salad",
      description: "Description of the item",
      rating: 4.5,
      category: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 6,
      name: "Egg Vegi Salad",
      description: "Description of the item",
      rating: 4.5,
      category: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="container mx-auto p-6 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[56px] font-bold font-['Syne'] text-[#40b491] dark:text-white">
          Recipes by category
        </h2>
        <div className="flex space-x-2">
          <button onClick={() => sliderRef.current.slickPrev()} className="w-8 h-8 flex items-center justify-center bg-[#40b491] dark:bg-[#309f80] rounded-full hover:bg-[#268a6f] transition">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button onClick={() => sliderRef.current.slickNext()} className="w-8 h-8 flex items-center justify-center bg-[#40b491] dark:bg-[#309f80] rounded-full hover:bg-[#268a6f] transition">
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>
      
      <Slider ref={sliderRef} {...sliderSettings} className="pb-4">
        {categories.map((category) => (
          <div key={category.id} className="text-center">
            <img src={category.image} alt={category.name} className="rounded-xl shadow-lg w-40 h-32 object-cover border-2 border-gray-200 dark:border-gray-500 mx-auto" />
            <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">{category.name}</p>
          </div>
        ))}
      </Slider>

      <h2 className="text-[56px] font-bold font-['Syne'] text-white bg-[#40b491] py-6 px-6 rounded-lg text-center mt-10">
        Recommended for you
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {recommendedRecipes.map((recipe) => (
          <div key={recipe.id} className="relative bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 p-5 rounded-xl shadow-xl transition transform hover:scale-105 text-left">
            <span className="absolute top-3 right-3 bg-[#40b491] uppercase text-white text-xs font-semibold px-3 py-1 rounded-full">
              {recipe.category}
            </span>
            <img src={recipe.image} alt={recipe.name} className="rounded-full w-44 h-44 object-cover mx-auto" />
            <h3 className="mt-3 text-xl font-semibold font-['Inter'] text-gray-800 dark:text-white">{recipe.name}</h3>
            <p className="mt-1 font-['Inter'] text-gray-500 dark:text-gray-300">{recipe.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-xl font-semibold font-['Inter'] text-[#ff6868] dark:text-white">Rating:</p>
              <p className="text-yellow-500 font-bold flex items-center">⭐ {recipe.rating}</p>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] w-[87px] h-[75px] bg-[#40b491] rounded-tr-[37.50px] rounded-bl-[42.50px] flex items-center justify-center">
              <Heart size={32} className="text-white fill-white" />
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
  );
};


export default ForYoyPage;
