import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import HomeService from "./../../../../services/home.service";
import { selectAuth } from "./../../../../store/selectors/authSelectors";
import "./FavoriteFood.css"; // Import file CSS

import { Heart} from "lucide-react";

const FavoriteFood = () => {
  const userId = useSelector(selectAuth)?.user?._id;
  const [likedFoods, setLikedFoods] = useState([]);
  const navigate = useNavigate();

  const colors = [
    { bg: "#FFEBE6", outline: "#FF4D4D", text: "#CC0000" }, // Hồng nhạt - viền đỏ
    { bg: "#EEFDEE", outline: "#4CAF50", text: "#006600" }, // Xanh lá nhạt - viền xanh lá
    { bg: "#D9D9D9", outline: "#000000", text: "#000000" }, // Xám - viền trắng
    { bg: "#E0FFFF", outline: "#00BFFF", text: "#006699" }  // Xanh nhạt - viền xanh dương
  ];

  const handleFoodClick = (dishId) => {
    navigate(`/dishes/${dishId}`);
  };

  // 🟢 Lấy danh sách món yêu thích khi component mount
  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        // Lấy danh sách món ăn yêu thích
        const favoriteDishes = await HomeService.getFavoriteDishes(userId);
        console.log("Dữ liệu từ API:", favoriteDishes);
        // Lấy chi tiết từng món ăn dựa vào dishId
        const dishDetailsPromises = favoriteDishes.map(async (fav) => {
          const response = await HomeService.getDishById(fav.dishId);
          return response.data; // 🔹 Chỉ lấy phần `data`
        });

        const dishDetails = await Promise.all(dishDetailsPromises);

        // Kết hợp dữ liệu
        const updatedFavorites = favoriteDishes.map((fav, index) => ({
          ...fav,
          dish: dishDetails[index], // 🔹 Bây giờ `dish` chứa dữ liệu đúng
        }));

        setLikedFoods(updatedFavorites);
        console.log("Updated Favorites:", updatedFavorites);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách món ăn yêu thích:", error);
      }
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

    const food = likedFoods.find((item) => item._id === dishId);
    if (food) {
      toast.success(
        newLikeState
          ? `Đã thêm "${food.name}" vào danh sách yêu thích! ❤️`
          : `Đã xóa "${food.name}" khỏi danh sách yêu thích! 💔`
      );
    }
  };

  

  return (
    <div>
      <div className="user-container-nav">
        <div className="nav-container">
          <div className="nav-text">Favorite Food</div>
        </div>
      </div>

      <div className="content-container">
        <div className="favorite-content">
          <div className="fa-detail-container">
            <div className="fa-content">
              {likedFoods.length === 0 ? (
                <p className="text-gray-600 text-center">
                  Bạn chưa có món ăn yêu thích nào.
                </p>
              ) : (
                likedFoods.map((food, index) => {
                  const { bg, outline, text } = colors[index % colors.length];

                  return (
                    <div
                      key={food.dish._id}
                      className="relative w-full p-4 rounded-2xl shadow-md flex flex-col md:flex-row items-center md:justify-between"
                      style={{ backgroundColor: bg }}
                    >
                      {/* Nút Like đặt ở góc trên cùng bên phải */}
                      <div className="m-20">
                      <Heart
                        onClick={() => handleLike(food.dish._id)}
                        color="red" // Màu viền
                        size={32}
                        style={{ cursor: "pointer", fill: food.isLike ? "red" : "none" }}
                      >
                      </Heart>
                      </div>
                      

                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold" style={{ color: text }}>
                          {food.dish.name}
                        </h3>
                        <div className="flex flex-wrap justify-center md:justify-start items-center mt-2 gap-2">
                          <div
                            className="w-64 px-4 py-1 rounded-full outline outline-1 flex justify-center items-center"
                            style={{ outlineColor: outline, color: text}}
                          >
                            <span className="text-xl">{food.dish.type}</span>
                          </div>
                          {/* Nút View Detail & View Recipe */}
                          <button
                            className="px-3 py-1 text-white rounded-lg text-sm"
                            style={{ backgroundColor: outline }}
                            onClick={() => handleFoodClick(food.dish._id)}
                          >
                            View Detail
                          </button>
                          <button
                            className="px-3 py-1 text-white rounded-lg text-sm"
                            style={{ backgroundColor: outline }}
                          >
                            View Recipe
                          </button>
                        </div>
                      </div>
                      <img
                        src={food.dish.image_url}
                        alt={food.dish.name}
                        className="w-32 h-32 rounded-full object-cover cursor-pointer mt-4 md:mt-0"
                        onClick={() => handleFoodClick(food.dish._id)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteFood;
