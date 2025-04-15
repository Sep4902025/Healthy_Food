import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useMemo } from "react";
import HomeService from "../../../services/home.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useFoodData from "../../../helpers/useFoodData";
import DefaultImg from "../../../assets/images/default.jpg";
import useAuthCheck from "../../../helpers/useAuthCheck";
const FoodSlider = ({ userId, dishes = []}) => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();
  const { likedFoods, setLikedFoods, ratings } = useFoodData(userId, dishes);
  const { checkLogin } = useAuthCheck(userId);
  const handleFoodClick = (dishId, recipeId) => {
    if (recipeId) {
      navigate(`/${dishId}/recipes/${recipeId}`);
    }
  };

  const handleLike = async (dishId) => {
    if (!checkLogin()) return;
  
    const foodIndex = likedFoods.findIndex((item) => item.dishId === dishId);
    const isCurrentlyLiked =
      foodIndex !== -1 ? likedFoods[foodIndex].isLike : false;
  
    try {
      const newLikeState = await HomeService.toggleFavoriteDish(
        userId,
        dishId,
        isCurrentlyLiked
      );
      setLikedFoods((prev) =>
        newLikeState
          ? [
              ...prev.filter((item) => item.dishId !== dishId),
              { dishId, isLike: true },
            ]
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
  
  // Ensure dishes is an array before mapping, memoize the result
  const sortedDishes = useMemo(() => {
    const validDishes = Array.isArray(dishes) ? dishes : [];
    return validDishes
      .map((food) => ({
        ...food,
        rating: parseFloat(ratings[food._id]) || 0,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [dishes, ratings]);

  return (
    <div className="relative w-full">
      <h3 className="p-10 text-2xl md:text-2xl lg:text-[50px] font-extrabold leading-normal text-[#ff6868]">
        Recommended Dishes
      </h3>

      <div className="text-center px-4">
        <h1 className="p-10 text-[60px] md:text-4xl lg:text-5xl font-extrabold text-black leading-tight max-w-[90%] md:max-w-[80%] lg:max-w-[60%] mx-auto ">
          Standout Foods From Our Menu
        </h1>
      </div>
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="View previous dish"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="px-4">
        <Swiper
          modules={[Navigation]}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            480: { slidesPerView: 1, spaceBetween: 15 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          loop={false}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {sortedDishes.map((food) => (
            <SwiperSlide key={food._id} className="flex items-stretch">
              <div
                
                className={`food-item w-full max-w-[500px] min-w-[250px] min-h-[550px] aspect-auto h-auto flex flex-col bg-[#c1f1c6] rounded-[35px] shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105 ${
                  food.recipeId ? "cursor-pointer hover:shadow-lg" : "cursor-not-allowed"
                } transition`}
                onClick={() => handleFoodClick(food._id, food.recipeId)}
              >
                <div
                  className="food-like-container flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(food._id);
                  }}
                >
                  <div className="w-[87px] h-[75px] bg-[#40B491] rounded-tr-[37.5px] rounded-bl-[42.5px] flex items-center justify-center relative ">
                    <Heart
                      size={32}
                      className={`text-white ${
                        likedFoods.find((item) => item.dishId === food._id)
                          ?.isLike
                          ? "fill-white"
                          : "stroke-white"
                      }`}
                    />
                  </div>
                </div>

                <div className="center-con">
                  <div className="food-i-container">
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="w-full h-40 object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = DefaultImg; // Fallback image
                      }}
                    />
                  </div>
                </div>

                <div className="food-item-title ">
                  {food.name}
                </div>
                <div className="food-item-des">{food.description}</div>

                <div className="food-item-rating">
                  <p className="food-item-rating-title ">
                    Rating
                  </p>
                  <p className="food-item-rating-average block mb-2 text-lg font-semibold text-gray-700">
                    {food.rating > 0
                      ? food.rating.toFixed(1) + "⭐"
                      : "No ratings yet"}
                  </p>
                </div>

                {/* Thông báo nếu không có công thức */}
                {!food.recipeId && (
                  <p className="mt-2 text-sm text-red-500">
                    No recipe available
                  </p>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="View next dish"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default FoodSlider;