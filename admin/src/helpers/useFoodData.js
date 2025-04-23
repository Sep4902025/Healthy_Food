import { useState, useEffect } from "react";
import HomeService from "../services/home.service";
import commentService from "../services/comment.service";

const useFoodData = (userId, dishes) => {
  const [likedFoods, setLikedFoods] = useState([]);
  const [ratings, setRatings] = useState({});

  // Fetch liked foods (only for logged-in users)
  useEffect(() => {
    if (!userId || dishes.length === 0) return;

    const fetchLikedFoods = async () => {
      try {
        const favoriteDishes = await HomeService.getFavoriteDishes(userId);
        setLikedFoods(favoriteDishes || []);
      } catch (error) {
        console.error("Error loading liked foods:", error);
        setLikedFoods([]);
      }
    };

    fetchLikedFoods();
  }, [userId, dishes]);

  // Fetch ratings (for all users, including guests)
  useEffect(() => {
    if (dishes.length === 0) return;

    const fetchRatings = async () => {
      try {
        const ratingsData = await Promise.all(
          dishes.map(async (dish) => {
            if (!dish.recipeId) return { [dish._id]: "No ratings yet" };
            try {
              const response = await commentService.getRatingsByRecipe(dish.recipeId);
              const avgRating = response.data.length
                ? (
                    response.data.reduce((sum, r) => sum + r.star, 0) / response.data.length
                  ).toFixed(1)
                : "No ratings yet";
              return { [dish._id]: avgRating };
            } catch (error) {
              return { [dish._id]: "No ratings yet" };
            }
          })
        );
        setRatings(Object.assign({}, ...ratingsData));
      } catch (error) {
        console.error("Error loading ratings:", error);
        setRatings({});
      }
    };

    fetchRatings();
  }, [dishes]); // Only depends on dishes, not userId

  return { likedFoods, setLikedFoods, ratings };
};

export default useFoodData;
