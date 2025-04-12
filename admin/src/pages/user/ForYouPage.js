import React, { useRef, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import UserService from "../../services/user.service";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";
import { toast } from "react-toastify";
import HomeService from "../../services/home.service";

// Hàm debounce để giới hạn tần suất gọi handleScroll
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Define fallback images based on type
const FALLBACK_IMAGES = {
  ALL: "https://i.pinimg.com/736x/93/00/a4/9300a4f74d823f7bb93be955493a0155.jpg",
  "HEAVY MEALS": "https://i.pinimg.com/736x/e8/8b/12/e88b123fd4a3f0555d7e70045ac14f9c.jpg",
  "LIGHT MEALS": "https://i.pinimg.com/474x/db/c5/36/dbc53635aad70a15ce04489d02467605.jpg",
  DESSERT: "https://i.pinimg.com/474x/e0/7c/de/e07cde796c00d499dc5d93d517082c00.jpg",
  BEVERAGES: "https://i.pinimg.com/474x/08/76/98/0876982d7a1c29ca365fc84c0731ee78.jpg",
  SNACKS: "https://i.pinimg.com/736x/5b/99/fb/5b99fbbebc94914af6601309fa53475a.jpg",
  BREAKFAST: "https://i.pinimg.com/736x/5b/99/fb/5b99fbbebc94914af6601309fa53475a.jpg",
  VEGAN: "https://i.pinimg.com/736x/5b/99/fb/5b99fbbebc94914af6601309fa53475a.jpg",
  "VIETNAMESE BEEF": "https://i.pinimg.com/736x/5b/99/fb/5b99fbbebc94914af6601309fa53475a.jpg",
  "VIETNAMESE BEVERAGE": "https://i.pinimg.com/736x/5b/99/fb/5b99fbbebc94914af6601309fa53475a.jpg",
  DEFAULT:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop",
};

const ForYouPage = () => {
  const sliderRef = useRef(null);
  const user = useSelector(selectUser);
  const userId = user?._id;
  const navigate = useNavigate();

  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [categories, setCategories] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [likedFoods, setLikedFoods] = useState([]); // Thêm state để quản lý danh sách món ăn yêu thích

  const limit = 8;

  // Hàm lấy danh sách món ăn yêu thích từ API
  const fetchLikedFoods = useCallback(async () => {
    try {
      const response = await UserService.getFavoriteDishes(userId);
      if (response.success) {
        const likedDishes = response.data.map((dish) => ({
          dishId: dish._id,
          isLike: true,
        }));
        setLikedFoods(likedDishes);
      } else {
        console.error("Failed to fetch liked foods:", response.message);
      }
    } catch (err) {
      console.error("Error fetching liked foods:", err);
    }
  }, [userId]);

  // Gọi API để lấy danh sách món ăn yêu thích khi component mount
  useEffect(() => {
    if (userId) {
      fetchLikedFoods();
    }
  }, [userId, fetchLikedFoods]);

  const formatCategoryName = (name) => {
    if (!name) return "Unknown";
    return name.toUpperCase().replace(/_/g, " ");
  };

  const normalizeTypeForApi = (type) => {
    if (!type || type === "ALL") return "";
    return type
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchCategories = async () => {
    try {
      const response = await UserService.getForYouDishType();
      if (response.success) {
        const formattedCategories = response.data.map((category) => {
          const formattedName = formatCategoryName(category.name);
          const isPlaceholderImage = category.image?.includes("via.placeholder.com");
          const image =
            !category.image || isPlaceholderImage
              ? FALLBACK_IMAGES[formattedName] || FALLBACK_IMAGES["DEFAULT"]
              : category.image;

          console.log(
            `Category: ${formattedName}, API Image: ${category.image}, Using Image: ${image}`
          );

          return {
            ...category,
            name: formattedName,
            image,
          };
        });
        setCategories([
          { id: "all", name: "ALL", image: FALLBACK_IMAGES["ALL"] },
          ...formattedCategories,
        ]);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch category list!");
      console.error(err);
    }
  };

  const loadRecipes = useCallback(
    async (page, type) => {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!userId || !objectIdRegex.test(userId)) {
        setError("You need to log in or the user ID is invalid!");
        setLoading(false);
        return;
      }

      if (page > totalPages && totalPages !== 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const normalizedType = normalizeTypeForApi(type);
        const result = await UserService.getForyou(userId, { page, limit, type: normalizedType });

        if (result.success) {
          setRecommendedRecipes((prevRecipes) =>
            page === 1 ? result.dishes : [...prevRecipes, ...result.dishes]
          );
          setCurrentPage(result.currentPage);
          setTotalPages(result.totalPages);
        } else {
          setError(
            result.error === 404
              ? "No matching dishes found!"
              : result.message || "Error fetching dish list!"
          );
        }
      } catch (err) {
        setError("Error fetching dish list!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [userId, limit, totalPages]
  );

  const handleSelectType = (type) => {
    setSelectedType(type);
    setRecommendedRecipes([]);
    setCurrentPage(1);
    setTotalPages(0);
    loadRecipes(1, type);
  };

  useEffect(() => {
    const initializeData = async () => {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!userId || !objectIdRegex.test(userId)) {
        setError("You need to log in or the user ID is invalid!");
        return;
      }
      await fetchCategories();
      loadRecipes(1, selectedType);
    };
    initializeData();
  }, [userId, loadRecipes, selectedType]);

  const handleScroll = useCallback(
    debounce(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !loading &&
        currentPage < totalPages
      ) {
        loadRecipes(currentPage + 1, selectedType);
      }
    }, 300),
    [currentPage, totalPages, loading, loadRecipes, selectedType]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const handleDishClick = (dishId, recipe) => {
    const recipeId = recipe?._id;

    if (!recipeId) {
      toast.error("This dish does not have a recipe yet!");

      return;
    }

    navigate(`/${dishId}/recipes/${recipeId}`);
  };

  // Hàm xử lý thả tim yêu thích món ăn
  const handleLike = async (dishId) => {
    const foodIndex = likedFoods.findIndex((item) => item.dishId === dishId);
    const isCurrentlyLiked = foodIndex !== -1 ? likedFoods[foodIndex].isLike : false;

    try {
      const newLikeState = await HomeService.toggleFavoriteDish(userId, dishId, isCurrentlyLiked);
      setLikedFoods((prev) =>
        newLikeState
          ? [...prev.filter((item) => item.dishId !== dishId), { dishId, isLike: true }]
          : prev.filter((item) => item.dishId !== dishId)
      );
      const food = recommendedRecipes.find((item) => item._id === dishId);
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

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 min-h-screen">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {alertMessage}
        </div>
      )}

      <div className="p-6 flex items-center justify-between mb-8">
        <h2 className="text-[48px] md:text-[56px] font-bold font-['Syne'] text-[#40b491] dark:text-white">
          Recipes by Category
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => sliderRef.current.slickPrev()}
            className="w-10 h-10 flex items-center justify-center bg-[#40b491] dark:bg-[#309f80] rounded-full hover:bg-[#268a6f] transition"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <button
            onClick={() => sliderRef.current.slickNext()}
            className="w-10 h-10 flex items-center justify-center bg-[#40b491] dark:bg-[#309f80] rounded-full hover:bg-[#268a6f] transition"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>
      </div>

      <Slider ref={sliderRef} {...sliderSettings} className="pb-6">
        {categories.map((category) => (
          <div key={category.id} className="text-center px-2">
            <div
              onClick={() => handleSelectType(category.name)}
              className={`cursor-pointer group transition-all duration-300 ${
                selectedType === category.name ? "opacity-100 scale-105" : "opacity-80"
              } hover:opacity-100 hover:scale-105`}
            >
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="rounded-xl shadow-lg w-48 h-36 object-cover border-2 border-gray-200 dark:border-gray-500 mx-auto transition-all duration-300 group-hover:shadow-xl"
                  onError={(e) =>
                    (e.target.src = FALLBACK_IMAGES[category.name] || FALLBACK_IMAGES["DEFAULT"])
                  }
                />
              </div>
              <p className="mt-3 font-semibold text-lg text-gray-700 dark:text-gray-300 capitalize">
                {category.name}
              </p>
            </div>
          </div>
        ))}
      </Slider>

      <div className="mt-12">
        <h2 className="text-[48px] md:text-[56px] font-bold font-['Syne'] text-white bg-[#40b491] py-6 px-6 rounded-lg">
          Recommended for You
        </h2>
      </div>

      {recommendedRecipes.length === 0 && !loading && !error ? (
        <div className="text-center p-6 text-gray-600 dark:text-gray-400 text-lg">
          No recommended dishes found!
        </div>
      ) : (
        <div className="w-full py-4 px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {recommendedRecipes.map((recipe) => (
            <div
              key={recipe._id}
              onClick={() => handleDishClick(recipe._id, recipe.recipeId)}
              className={`relative bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 p-5 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-left max-w-[300px] mx-auto ${
                recipe.recipeId ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="absolute top-3 right-3 bg-[#40b491] uppercase text-white text-xs font-semibold px-3 py-1 rounded-full">
                {formatCategoryName(recipe.type)}
              </span>
              <img
                src={
                  recipe.imageUrl && recipe.imageUrl !== "ERR_WRONG_CONNECTION_TIME"
                    ? recipe.imageUrl
                    : "https://via.placeholder.com/200"
                }
                alt={recipe.name}
                className="rounded-full w-[200px] h-[200px] object-cover mx-auto"
                onError={(e) =>
                  (e.target.src =
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop")
                }
              />
              <h3 className="mt-4 text-xl font-semibold font-['Inter'] text-gray-800 dark:text-white line-clamp-1">
                {recipe.name}
              </h3>
              <p className="mt-2 text-sm font-['Inter'] text-gray-500 dark:text-gray-300 line-clamp-2">
                {recipe.description || "No description available"}
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <p className="text-sm font-semibold font-['Inter'] text-[#ff6868] dark:text-white">
                  Calories:
                </p>
                <p className="text-yellow-500 font-bold flex items-center text-sm">
                  {recipe.calories || "N/A"} kcal
                </p>
              </div>
              {!recipe.recipeId && <p className="mt-2 text-sm text-red-500">No recipe available</p>}
              <div
                className="absolute right-[-10px] bottom-[-5px] w-[55px] h-[35px] bg-[#40b491] rounded-tr-[37.50px] rounded-bl-[42.50px] flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan lên thẻ cha
                  handleLike(recipe._id);
                }}
              >
                <Heart
                  size={25}
                  className={`text-white ${
                    likedFoods.find((item) => item.dishId === recipe._id)?.isLike
                      ? "fill-white"
                      : "stroke-white"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center p-6 text-gray-600 dark:text-gray-400">
          Loading more dishes...
        </div>
      )}
      {currentPage >= totalPages && recommendedRecipes.length > 0 && !loading && (
        <div className="text-center p-6 text-gray-600 dark:text-gray-400">All dishes loaded!</div>
      )}
      {error && recommendedRecipes.length > 0 && (
        <div className="text-center p-6 text-red-500">{error}</div>
      )}
    </div>
  );
};

export default ForYouPage;
