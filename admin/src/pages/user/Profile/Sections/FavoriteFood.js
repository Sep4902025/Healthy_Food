import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import HomeService from "./../../../../services/home.service";
import { selectAuth } from "./../../../../store/selectors/authSelectors";
import "./FavoriteFood.css"; // Import file CSS

const FavoriteFood = () => {
  const userId = useSelector(selectAuth)?.user?._id;
  const [likedFoods, setLikedFoods] = useState([]);
  const navigate = useNavigate();

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
    const newLikeState = await HomeService.toggleFavoriteDish(userId,dishId,isCurrentlyLiked
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
                likedFoods.map((food) => (
                    <div key={food.dish._id} className="fa-item">
                      <img
                        src={food.dish.image_url}  // ✅ Lấy từ dish
                        alt={food.dish.name}
                        className="food-image"
                        onClick={() => handleFoodClick(food.dish._id)} // ✅ Lấy ID đúng
                      />
                      <div className="fa-item-name">
                        <h3>{food.dish.name}</h3>  
                        <button
                          className="like-button"
                          onClick={() => handleLike(food.dish._id)} // ✅ Gửi đúng ID khi like/unlike
                        >
                          {food.isLike ? "❤️" : "🤍"}
                        </button>
                      </div>
                    </div>
                  ))
                  
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FavoriteFood;
