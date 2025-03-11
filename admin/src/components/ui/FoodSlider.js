import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import HomeService from "../../services/home.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const FoodSlider = ({ userId, dishes = [] }) => {
  const swiperRef = useRef(null);
  const [likedFoods, setLikedFoods] = useState([]);
  const navigate = useNavigate();

  const handleFoodClick = (dishId) => {
    navigate(`/dishes/${dishId}`);
  };

  // 🟢 Lấy danh sách món yêu thích khi component mount
  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      const favoriteDishes = await HomeService.getFavoriteDishes(userId);
      console.log("🔥 Danh sách món yêu thích từ API:", favoriteDishes);
      setLikedFoods(favoriteDishes);
    };

    fetchFavorites();
  }, [userId]);

  // 🟢 Xử lý Like món ăn
  const handleLike = async (dishId) => {
    const foodIndex = likedFoods.findIndex((item) => item.dishId === dishId);
    const isCurrentlyLiked =
      foodIndex !== -1 ? likedFoods[foodIndex].isLike : false;

    // Gửi request lên server
    const newLikeState = await HomeService.toggleFavoriteDish(
      userId,
      dishId,
      isCurrentlyLiked
    );

    // Cập nhật lại state
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
          ? `Đã thêm "${food.name}" vào danh sách yêu thích! ❤️`
          : `Đã xóa "${food.name}" khỏi danh sách yêu thích! 💔`
      );
    }
  };

  return (
    <div className="relative w-full">
      {/* Nút điều hướng trái */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <ChevronLeft size={24} />
      </button>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={3}
        loop={true}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        {dishes.map((food) => (
          <SwiperSlide key={food._id}>
            <div
              className="food-item"
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
                <p className="food-item-rating-average">{food.rating}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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
