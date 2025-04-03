import React, { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import useFoodData from "../../../helpers/useFoodData";
import HomeService from "../../../services/home.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DefaultImg from "../../../assets/images/default.jpg";

const FoodBySeasonSection = ({ userId, selectedSeason, dishes }) => {
  const { likedFoods, setLikedFoods, ratings } = useFoodData(userId, dishes);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowAll(false); // Reset showAll when selectedSeason changes
  }, [selectedSeason]);

  const handleLike = async (dishId) => {
    if (!userId) {
      toast.info("You need to login to like dish!", {
        autoClose: 3000,
        onClose: () => navigate("/signin"), // Chuyển hướng sau khi thông báo đóng
      });
      return;
    }
    const foodIndex = likedFoods.findIndex((item) => item.dishId === dishId);
    const isCurrentlyLiked = foodIndex !== -1 ? likedFoods[foodIndex].isLike : false;

    const newLikeState = await HomeService.toggleFavoriteDish(userId, dishId, isCurrentlyLiked);

    setLikedFoods((prev) => {
      if (newLikeState) {
        return [...prev, { dishId, isLike: true }];
      } else {
        return prev.filter((item) => item.dishId !== dishId);
      }
    });

    const food = dishes.find((item) => item._id === dishId);
    if (food) {
      toast.success(
        newLikeState
          ? `Added "${food.name}" to favorites! ❤️`
          : `Removed "${food.name}" from favorites! 💔`
      );
    }
  };

  const handleFoodClick = (dish) => {
    if (dish.recipeId) {
      navigate(`/${dish._id}/recipes/${dish.recipeId}`);
    }
  };

  const displayedDishes = showAll ? dishes : dishes.slice(0, 6);

  return (
    <div className="py-6">
      <h2 className="text-4xl font-bold font-['Syne'] text-white bg-[#40b491] py-4 px-6 rounded-lg text-left mb-6 dark:bg-[#1edc61]">
        {selectedSeason} Recipes
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {displayedDishes.map((dish) => (
          <div
            key={dish._id}
            className="relative bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition dark:bg-[#67f598]"
            onClick={() => handleFoodClick(dish)}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.2)")}
          >
            <span className="absolute top-2 right-2 bg-[#40b491] text-white text-xs font-semibold uppercase px-2 py-1 rounded dark:bg-[#1edc61] dark:text-gray-300">
              {dish.season}
            </span>

            <div className="flex justify-center pt-2">
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="w-48 h-48 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = DefaultImg; // Fallback image
                }}
              />
            </div>

            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold text-gray-800 font-['Inter']">{dish.name}</h3>
              <p className="text-sm text-gray-500 font-['Inter'] mt-1 line-clamp-2">
                {dish.description}
              </p>

              <div className="flex justify-center items-center mt-3">
                <span className="text-sm font-semibold text-[#ff6868] uppercase mr-1">RATING</span>
                {ratings[dish._id] ? (
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-500 mr-1" />
                    <span className="text-gray-800 font-bold">{ratings[dish._id]}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">No ratings yet</span>
                )}
              </div>

              {!dish.recipeId && (
                  <p className="mt-2 text-sm text-red-500">
                    No recipe available
                  </p>
                )}
            </div>

            <div
              className="absolute bottom-0 right-0 bg-[#40b491] rounded-tl-[40px] p-4 dark:bg-[#1edc61]"
              onClick={(e) => {
                e.stopPropagation();
                handleLike(dish._id);
              }}
            >
              <Heart
                size={24}
                className={
                  likedFoods.find((item) => item.dishId === dish._id)?.isLike
                    ? "fill-white text-white"
                    : "stroke-white text-transparent"
                }
              />
            </div>
          </div>
        ))}
      </div>

      {dishes.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="px-6 py-2 bg-white text-[#40b491] font-semibold uppercase text-sm rounded-full border border-[#40b491] hover:bg-[#40b491] hover:text-white transition"
          >
            {showAll ? "VIEW LESS" : "VIEW ALL RECIPES"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodBySeasonSection;
