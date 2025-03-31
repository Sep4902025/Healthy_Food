import React, { useRef, useContext, useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DarkModeContext } from "../context/DarkModeContext";
import UserService from "../../services/user.service";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";


const ForYouPage = () => {
  const sliderRef = useRef(null);
  const { darkMode } = useContext(DarkModeContext);
  const user = useSelector(selectUser); // Lấy thông tin user từ Redux store
  const userId = user?._id; // Giả định user có trường id, điều chỉnh nếu khác
  console.log("USERID", userId);
  const navigate = useNavigate();

  // State để lưu danh sách món ăn đề xuất
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm xử lý sự kiện khi nhấn vào món ăn
  const handleRecipeClick = (dishId, recipeId) => {
    // navigate(`/${dishId}/recipes/${recipeId}`) // Chuyển hướng đến trang chi tiết món ăn
    console.log("Dish ID:", dishId);
  }

  

  
  
  // Danh sách category tĩnh (giữ nguyên)
  const categories = [
    {
      id: 1,
      name: "Breakfast",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 2,
      name: "Dessert",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 3,
      name: "Dinner",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
    {
      id: 4,
      name: "Lunch",
      image:
        "https://dayphache.edu.vn/wp-content/uploads/2021/07/che-bap-dau-xanh.jpg",
    },
  ];

  // Gọi API từ UserService khi component mount hoặc userId thay đổi
  useEffect(() => {
    const fetchRecommendedRecipes = async () => {
      setLoading(true);
      const result = await UserService.getForyou(userId); // Gọi từ UserService với userId
      if (result.success) {
        setRecommendedRecipes(result.dishes); // Cập nhật danh sách món ăn từ API
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    if (userId) {
      fetchRecommendedRecipes();
    } else {
      setError("Bạn cần đăng nhập để xem danh sách món ăn đề xuất!");
      setLoading(false);
    }
  }, [userId]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Hiển thị khi đang tải hoặc có lỗi
  if (loading) {
    return <div className="text-center p-6">Đang tải danh sách món ăn...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">
      <div className="p-6 flex items-center justify-between mb-4">
        <h2 className="text-[56px] font-bold font-['Syne'] text-[#40b491] dark:text-white">
          Recipes by category
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => sliderRef.current.slickPrev()}
            className="w-8 h-8 flex items-center justify-center bg-[#40b491] dark:bg-[#309f80] rounded-full hover:bg-[#268a6f] transition"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={() => sliderRef.current.slickNext()}
            className="w-8 h-8 flex items-center justify-center bg-[#40b491] dark:bg-[#309f80] rounded-full hover:bg-[#268a6f] transition"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>

      <Slider ref={sliderRef} {...sliderSettings} className="pb-4">
        {categories.map((category) => (
          <div key={category.id} className="text-center">
            <img
              src={category.image}
              alt={category.name}
              className="rounded-xl shadow-lg w-40 h-32 object-cover border-2 border-gray-200 dark:border-gray-500 mx-auto"
            />
            <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">
              {category.name}
            </p>
          </div>
        ))}
      </Slider>

      <h2 className="text-[56px] font-bold font-['Syne'] text-white bg-[#40b491] py-6 px-6 rounded-lg text-left mt-10">
        Recommended for you
      </h2>

      <div className="w-full py-2 px-[50px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {recommendedRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="relative bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 p-4 rounded-xl shadow-lg transition transform hover:scale-105 text-left max-w-[300px] mx-auto"
          >
            <span className="absolute top-2 right-2 bg-[#40b491] uppercase text-white text-xs font-semibold px-2 py-1 rounded-full">
              {recipe.category}
            </span>
            <img
              src={recipe.image}
              alt={recipe.name}
              className="rounded-full w-[200px] h-[200px] object-cover mx-auto"
              onClick={() => handleRecipeClick(recipe)} // Thêm sự kiện click vào hình ảnh
            />
            <h3 className="mt-3 text-lg font-semibold font-['Inter'] text-gray-800 dark:text-white">
              {recipe.name}
            </h3>
            <p className="mt-1 text-sm font-['Inter'] text-gray-500 dark:text-gray-300 line-clamp-2">
              {recipe.description}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-sm font-semibold font-['Inter'] text-[#ff6868] dark:text-white">
                Rating:
              </p>
              <p className="text-yellow-500 font-bold flex items-center text-sm">
                ⭐ {recipe.rating}
              </p>
            </div>
            <div className="absolute right-[-10px] bottom-[-5px] w-[55px] h-[35px] bg-[#40b491] rounded-tr-[37.50px] rounded-bl-[42.50px] flex items-center justify-center">
              <Heart size={25} className="text-white fill-white" />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button className="px-8 py-3 bg-white text-[#40b491] dark:bg-gray-700 dark:text-white font-semibold rounded-full shadow-lg hover:bg-[#40b491] hover:text-[#555555] transition outline">
          VIEW ALL RECIPES
        </button>
      </div>
    </div>
  );
};

export default ForYouPage;
