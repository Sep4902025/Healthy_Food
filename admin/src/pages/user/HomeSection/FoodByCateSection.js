import React, {useState,useEffect} from "react";
import { Heart } from "lucide-react";
import useFoodData from "../../../helpers/useFoodData";
import HomeService from "../../../services/home.service";

const FoodByCateSection = ({userId, selectedSeason, dishes }) => {

  const { likedFoods, setLikedFoods, ratings } = useFoodData(userId, dishes);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [selectedSeason]);

  const handleLike = async (dishId) => {
    setLikedFoods((prev) =>
      prev.some((item) => item.dishId === dishId)
        ? prev.filter((item) => item.dishId !== dishId)
        : [...prev, { dishId, isLike: true }]
    );

    try {
      await HomeService.toggleFavoriteDish(userId, dishId);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
    }
  };

  // Chỉ hiển thị 6 món đầu tiên nếu chưa nhấn "View All"
  const displayedDishes = showAll ? dishes : dishes.slice(0, 6);
  return (
    <div>
      <h2 className="text-[56px] font-bold font-['Syne'] text-white bg-[#40b491] py-6 px-6 rounded-lg text-left mt-10">
        {selectedSeason} Recipe
      </h2>

      <div className="w-full py-2 px-[50px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
        {displayedDishes.map((dish) => (
          <div
            key={dish._id}
            className="relative bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 p-6 rounded-3xl shadow-2xl shadow-gray-500/50 transition transform hover:scale-105 text-left max-w-[400px] w-full mx-auto"
          >
            {/* Category Tag */}
            <span className="absolute top-2 right-2 bg-[#40b491] uppercase text-white text-xs font-semibold px-2 py-1 rounded-full">
              {dish.season}
            </span>

            {/* Image */}
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="rounded-full w-[200px] h-[200px] object-cover mx-auto"
            />

            {/* Recipe Name */}
            <h3 className="mt-3 text-lg font-semibold font-['Inter'] text-gray-800 dark:text-white">
              {dish.name}
            </h3>

            {/* Description */}
            <p className="mt-1 text-sm font-['Inter'] text-gray-500 dark:text-gray-300 line-clamp-2">
              {dish.description}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-sm font-semibold font-['Inter'] text-[#ff6868] dark:text-white">
                Rating:
              </p>
              <p className="text-yellow-500 font-bold">{ratings[dish._id] + "⭐" || "Chưa có đánh giá"}</p>
            </div>

            {/* Heart Icon */}
            <div className="food-like-container flex items-center justify-center">
            <div className="w-[87px] h-[75px] bg-[#40B491] rounded-tr-[37.5px] rounded-bl-[42.5px] flex items-center justify-center relative"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(dish._id);
                }}
              >
                <Heart size={32} className={likedFoods.find((item) => item.dishId === dish._id)?.isLike ? "fill-white" : "stroke-white"} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút View All */}
      {dishes.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="px-8 py-3 bg-white text-[#40b491] dark:bg-gray-700 dark:text-white font-semibold rounded-full shadow-lg hover:bg-[#40b491] hover:text-[#555555] transition outline"
          >
            {showAll ? "VIEW LESS" : "VIEW ALL RECIPES"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodByCateSection;
