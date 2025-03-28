import { useState, useEffect } from "react";
import HomeService from "../services/home.service";
import commentService from "../services/comment.service";

const useFoodData = (userId, dishes) => {
  const [likedFoods, setLikedFoods] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    if (!userId || dishes.length === 0) return;

    const fetchData = async () => {
      try {
        const [favoriteDishes, ratingsData] = await Promise.all([
          HomeService.getFavoriteDishes(userId),
          Promise.all(
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
          ),
        ]);

        setLikedFoods(favoriteDishes);
        setRatings(Object.assign({}, ...ratingsData));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [userId, dishes]);

  return { likedFoods, setLikedFoods, ratings };
};

export default useFoodData;
