import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import HomeService from "../../services/home.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import commentService from "./../../services/comment.service";

const FoodSlider = ({ userId, dishes = [] }) => {
  const swiperRef = useRef(null);
  const [likedFoods, setLikedFoods] = useState([]);
  const [ratings, setRatings] = useState({});
  const navigate = useNavigate();

  const handleFoodClick = (dishId) => {
    navigate(`/dishes/${dishId}`);
  };

  // 🟢 Fetch danh sách yêu thích & đánh giá cùng lúc
  useEffect(() => {
    if (!userId || dishes.length === 0) return;

    const fetchData = async () => {
      try {
        const [favoriteDishes, ratingsData] = await Promise.all([
          HomeService.getFavoriteDishes(userId),
          Promise.all(
            dishes.map(async (dish) => {
              if (!dish.recipeId) return { [dish._id]: "Chưa có đánh giá" };
              try {
                const response = await commentService.getRatingsByRecipe(dish.recipeId);
                const avgRating = response.data.length
                  ? (response.data.reduce((sum, r) => sum + r.star, 0) / response.data.length).toFixed(1)
                  : "Chưa có đánh giá";
                return { [dish._id]: avgRating };
              } catch (error) {
                return { [dish._id]: "Chưa có đánh giá" };
              }
            })
          ),
        ]);

        setLikedFoods(favoriteDishes);
        setRatings(Object.assign({}, ...ratingsData));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [userId, dishes]);

  // 🟢 Xử lý sự kiện Like
  const handleLike = useCallback(async (dishId) => {
    setLikedFoods((prev) =>
      prev.some((item) => item.dishId === dishId)
        ? prev.filter((item) => item.dishId !== dishId)
        : [...prev, { dishId, isLike: true }]
    );

    try {
      const newLikeState = await HomeService.toggleFavoriteDish(userId, dishId);
      const food = dishes.find((item) => item._id === dishId);
      if (food) {
        toast.success(
          newLikeState
            ? `Đã thêm "${food.name}" vào danh sách yêu thích! ❤️`
            : `Đã xóa "${food.name}" khỏi danh sách yêu thích! 💔`
        );
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
    }
  }, [userId, dishes]);

  // 🟢 Sắp xếp & lọc món ăn có rating cao
  const sortedDishes = dishes
    .map((food) => ({
      ...food,
      rating: parseFloat(ratings[food._id]) || 0, // Nếu không có rating, đặt 0
    }))
    .sort((a, b) => b.rating - a.rating) // Sắp xếp theo rating giảm dần
    .slice(0, 8); // Chỉ lấy tối đa 8 món

  return (
    <div className="relative w-full">
      {/* Nút điều hướng trái */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <ChevronLeft size={24} />
      </button>

      <div className="w-full max-w-6xl mx-auto px-4">
      <Swiper
        modules={[Navigation]}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10 }, // Mobile nhỏ
          480: { slidesPerView: 1, spaceBetween: 15 }, // Mobile trung bình
          640: { slidesPerView: 2, spaceBetween: 20 }, // Tablet
          1024: { slidesPerView: 3, spaceBetween: 30 }, // Desktop
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
              {/* Nút Like (Chỉ hiển thị, không có sự kiện onClick) */}
              <div className="food-like-container flex items-center justify-center">
                <div
                  className="w-[87px] h-[75px] bg-[#39da49] rounded-tr-[37.5px] rounded-bl-[42.5px] flex items-center justify-center relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(food._id);
                  }}
                >
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

              {/* Hình ảnh món ăn */}
              <div className="center-con">
                <div className="food-i-container">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              </div>

              {/* Thông tin món ăn */}
              <div className="food-item-title">{food.name}</div>
              <div className="food-item-des">{food.description}</div>

              <div className="food-item-rating">
                <p className="food-item-rating-title">Rating</p>
                <span className="food-item-rating-star"></span>
                <p className="food-item-rating-average block mb-2 text-lg font-semibold text-gray-700">
                  {food.rating > 0
                    ? food.rating.toFixed(1) + "⭐"
                    : "Chưa có đánh giá"}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>

      

      {/* Nút điều hướng phải */}
      <button
        className="swiper-button absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
        onClick={() => swiperRef.current?.slideNext()}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default FoodSlider;
