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

const FoodSlider = ({ userId, dishes = [] }) => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();
  const { likedFoods, setLikedFoods, ratings } = useFoodData(userId, dishes);

  const handleFoodClick = (dishId) => {
    navigate(`/dishes/${dishId}`);
  };

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
      const food = dishes.find((item) => item._id === dishId);
      if (food) {
        toast.success(
          newLikeState
            ? `Đã thêm "${food.name}" vào danh sách yêu thích! ❤️`
            : `Đã xóa "${food.name}" khỏi danh sách yêu thích! 💔`
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Có lỗi xảy ra khi cập nhật yêu thích!");
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
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Xem món trước"
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
                className="food-item w-full max-w-[500px] min-w-[250px] min-h-[550px] aspect-auto h-auto flex flex-col bg-[#c1f1c6] rounded-[35px]"
                onClick={() => handleFoodClick(food._id)}
              >
                <div
                  className="food-like-container flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(food._id);
                  }}
                >
                  <div className="w-[87px] h-[75px] bg-[#40B491] rounded-tr-[37.5px] rounded-bl-[42.5px] flex items-center justify-center relative">
                    <Heart
                      size={32}
                      className={`text-white ${
                        likedFoods.find((item) => item.dishId === food._id)?.isLike
                          ? "fill-white"
                          : "stroke-white"
                      }`}
                    />
                  </div>
                </div>

                <div className="center-con">
                  <div className="food-i-container">
                    <img
                      src={food.imageUrl || "/fallback-image.jpg"}
                      alt={food.name}
                      className="w-full h-40 object-cover rounded-md"
                      onError={(e) => (e.target.src = "/fallback-image.jpg")}
                    />
                  </div>
                </div>

                <div className="food-item-title">{food.name}</div>
                <div className="food-item-des">{food.description}</div>

                <div className="food-item-rating">
                  <p className="food-item-rating-title">Rating</p>
                  <p className="food-item-rating-average block mb-2 text-lg font-semibold text-gray-700">
                    {food.rating > 0 ? food.rating.toFixed(1) + "⭐" : "Chưa có đánh giá"}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Xem món tiếp theo"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default FoodSlider;  