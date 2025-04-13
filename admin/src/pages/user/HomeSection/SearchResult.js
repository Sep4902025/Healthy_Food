import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import HomeService from "../../../services/home.service";
import useFoodData from "../../../helpers/useFoodData";
import DefaultImg from "../../../assets/images/default.jpg";
import useAuthCheck from "../../../helpers/useAuthCheck";

const SearchResult = ({ userId, dishes = [] }) => {
  const navigate = useNavigate();
  const { likedFoods, setLikedFoods, ratings } = useFoodData(userId, dishes);
  const [showAll, setShowAll] = useState(false);

  const { checkLogin } = useAuthCheck(userId);


  const handleFoodClick = (dishId, recipeId) => {
    if (!recipeId) return;
    navigate(`/${dishId}/recipes/${recipeId}`);
  };

  const handleLike = async (dishId) => {
    if (!checkLogin()) return;

    const foodIndex = likedFoods.findIndex((item) => item.dishId === dishId);
    const isCurrentlyLiked = foodIndex !== -1 ? likedFoods[foodIndex].isLike : false;

    try {
      const newLikeState = await HomeService.toggleFavoriteDish(userId, dishId, isCurrentlyLiked);
      setLikedFoods((prev) =>
        newLikeState
          ? [...prev.filter((item) => item.dishId !== dishId), { dishId, isLike: true }]
          : prev.filter((item) => item.dishId !== dishId)
      );
      const food = dishes.find((item) => item._id === dishId);
      if (food) {
        toast.success(
          newLikeState
            ? `Added "${food.name}" to favorites! ❤️`
            : `Removed "${food.name}" from favorites! 💔`
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("An error occurred while updating favorites!");
    }
  };

  const sortedDishes = useMemo(() => {
    const validDishes = Array.isArray(dishes) ? dishes : [];
    return validDishes
      .map((food) => ({
        ...food,
        rating: parseFloat(ratings[food._id]) || 0,
      }))
      .sort((a, b) => b.rating - a.rating);
  }, [dishes, ratings]);

  const visibleDishes = showAll ? sortedDishes : sortedDishes.slice(0, 8);

  return (
    <div className="px-4 py-6">
      <h3 className="text-center text-2xl md:text-3xl font-bold text-[#ff6868] mb-8">
        Search Results 🍽️
      </h3>

      {visibleDishes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleDishes.map((food) => {
            const hasRecipe = !!food.recipeId;
            const isLiked = likedFoods.find((item) => item.dishId === food._id)?.isLike;

            return (
              <div
                key={food._id}
                className={`relative flex flex-col bg-[#c1f1c6] rounded-[35px] overflow-hidden shadow-lg transition transform hover:scale-[1.01] ${
                  hasRecipe ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                }`}
                onClick={() => handleFoodClick(food._id, food.recipeId)}
              >
                {/* Like button */}
                <div
                  className="absolute top-0 right-0 m-3 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(food._id);
                  }}
                >
                  <div className="w-10 h-10 bg-[#40B491] rounded-full flex items-center justify-center shadow-md">
                    <Heart
                      size={24}
                      className={isLiked ? "text-white fill-white" : "text-white stroke-white"}
                    />
                  </div>
                </div>

                {/* Image */}
                <img
                  src={food.imageUrl || DefaultImg}
                  alt={food.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DefaultImg;
                  }}
                  className="w-full h-40 object-cover"
                />

                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-bold text-lg truncate">{food.name}</h3>
                  <p className="text-sm text-gray-700 line-clamp-2">{food.description}</p>

                  {!hasRecipe && (
                    <p className="text-red-500 text-sm italic">No recipe available</p>
                  )}

                  <div className="mt-2 text-sm font-medium text-gray-800">
                    Rating: {food.rating > 0 ? `${food.rating.toFixed(1)} ⭐` : "No ratings yet"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">No dishes found.</p>
      )}

      {sortedDishes.length > 8 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-[#40B491] text-white px-6 py-2 rounded-full text-lg hover:bg-[#379e7e] transition"
          >
            {showAll ? "View Less" : "View More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
