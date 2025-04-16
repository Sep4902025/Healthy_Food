import React, { useState, useEffect, useCallback, useRef } from "react";
import { Heart, Star } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useFoodData from "../../../helpers/useFoodData";
import HomeService from "../../../services/home.service";
import useAuthCheck from "../../../helpers/useAuthCheck";
import DefaultImg from "../../../assets/images/default.jpg";

const FoodBySeasonSection = ({ userId, selectedSeason }) => {
  const [displayedDishes, setDisplayedDishes] = useState([]);
  const { likedFoods, setLikedFoods, ratings } = useFoodData(userId, displayedDishes);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false);
  const navigate = useNavigate();
  const observer = useRef();
  const limit = 6; // Align with initial display limit
  const { checkLogin } = useAuthCheck(userId);

  useEffect(() => {
    setDisplayedDishes([]);
    setPage(1);
    setHasMore(true);
    setShowAll(false);
    setEnableInfiniteScroll(false);
    loadMoreDishes(1, true);
  }, [selectedSeason]);

  const loadMoreDishes = async (pageNum, reset = false) => {
    if (!hasMore && !reset) return;
    setLoading(true);

    try {
      let response;
      const isAllSeasons = selectedSeason.toLowerCase() === "all seasons";

      // Call appropriate API based on selected season
      if (isAllSeasons) {
        response = await HomeService.getAllDishes(pageNum, limit);
      } else {
        response = await HomeService.getDishBySeason(selectedSeason, pageNum, limit);
      }

      console.log("API Response:", response);

      if (response.success === true) {
        if (!response.data || !Array.isArray(response.data.items)) {
          throw new Error("Invalid response format: data.items is not an array");
        }

        const newDishes = response.data.items;

        setDisplayedDishes((prev) => {
          const updatedDishes = reset ? newDishes : [...prev, ...newDishes];
          return updatedDishes;
        });

        setPage(pageNum);
        setHasMore(pageNum < response.data.totalPages);
      } else {
        console.error("Failed to load dishes:", response.message || "Unknown error");
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading dishes:", error.message || error);
      setHasMore(false);
      toast.error("Failed to load dishes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    setShowAll(true);
    setEnableInfiniteScroll(true);
  };

  const lastDishElementRef = useCallback(
    (node) => {
      if (loading || !enableInfiniteScroll) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreDishes(page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, enableInfiniteScroll]
  );

  const handleLike = async (dishId) => {
    if (!checkLogin()) return;
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

    const food = displayedDishes.find((item) => item._id === dishId);
    if (food) {
      toast.success(
        newLikeState
          ? `Added "${food.name}" to favorites! ❤️`
          : `Removed "${food.name}" from favorites! 💔`
      );
    }
  };

  const handleDishClick = (dishId, recipeId) => {
    if (!recipeId) return; // Prevent navigation if no recipeId
    navigate(`/${dishId}/recipes/${recipeId}`);
  };

  const visibleDishes = showAll ? displayedDishes : displayedDishes.slice(0, 6);

  return (
    <div className="py-6">
      <h2 className="text-4xl font-bold font-['Syne'] text-white bg-[#40b491] py-4 px-6 rounded-lg text-left mb-6">
        {selectedSeason} Recipes
      </h2>

      {visibleDishes.length === 0 && !loading ? (
        <p className="text-center text-gray-500">No dishes found for this season.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
          {visibleDishes.map((dish, index) => {
            const isLastElement = visibleDishes.length === index + 1;
            const hasRecipe = !!dish.recipeId; // Check if recipeId exists
            return (
              <div
                key={dish._id}
                ref={isLastElement ? lastDishElementRef : null}
                className={`relative bg-white rounded-2xl shadow-md overflow-hidden ${
                  hasRecipe ? "cursor-pointer hover:shadow-lg" : "cursor-not-allowed"
                } transition`}
                onClick={() => handleDishClick(dish._id, dish.recipeId)}
              >
                <span className="absolute top-2 right-2 bg-[#40b491] text-white text-xs font-semibold uppercase px-2 py-1 rounded">
                  {dish.season}
                </span>

                <div className="flex justify-center pt-2">
                  <img
                    src={
                      dish.imageUrl ||
                      "https://i.pinimg.com/736x/a2/76/1f/a2761ff3654cddb3992f412589f6c3e6.jpg"
                    }
                    alt={dish.name}
                    className="w-48 h-48 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DefaultImg;
                    }}
                  />
                </div>

                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 font-['Inter'] truncate">
                    {dish.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-['Inter'] mt-1 line-clamp-2">
                    {dish.description}
                  </p>

                  {!hasRecipe && (
                    <p className="text-red-500 text-sm italic mt-2">No recipe available</p>
                  )}

                  <div className="flex justify-center items-center mt-3">
                    <span className="text-sm font-semibold text-[#ff6868] uppercase mr-1">
                      RATING
                    </span>
                    {ratings[dish._id] ? (
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-500 mr-1" />
                        <span className="text-gray-800 font-bold">{ratings[dish._id]}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No ratings yet</span>
                    )}
                  </div>
                </div>

                <div
                  className="absolute bottom-0 right-0 bg-[#40b491] rounded-tl-[40px] p-4"
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
            );
          })}
        </div>
      )}

      {loading && (
        <div className="text-center mt-4">
          <p className="text-gray-500">Loading more dishes...</p>
        </div>
      )}

      {hasMore && !showAll && (
        <div className="text-center mt-8">
          <button
            onClick={handleViewAll}
            className="px-6 py-2 bg-white text-[#40b491] font-semibold uppercase text-sm rounded-full border border-[#40b491] hover:bg-[#40b491] hover:text-white transition"
          >
            VIEW ALL RECIPES
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodBySeasonSection;
