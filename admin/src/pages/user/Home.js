import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dishesService from "../../services/nutritionist/dishesServices";
import ingredientsService from "../../services/nutritionist/ingredientsServices"; // Import dịch vụ API
import homePicture from "../../assets/images/homePic.png";

const Home = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [ingredients, setIngredients] = useState([]); // State lưu nguyên liệu

  useEffect(() => {
    const fetchData = async () => {
      const dishesResponse = await dishesService.getAllDishes();
      const ingredientsResponse = await ingredientsService.getAllIngredients();

      if (dishesResponse.success) setDishes(dishesResponse.data);
      if (ingredientsResponse.success) setIngredients(ingredientsResponse.data);
    };

    fetchData();
  }, []);

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title bold text-black-600">
            Dive into Delights Of Delectable <span className="text-green">Food</span>
          </h1>
          <h2 className="home-title-s">Kill the Hunger</h2>
          <p className="home-description">
            Enjoy the best dishes prepared with love and expertise.
          </p>
          <button
            onClick={() => navigate("/another-page")}
            className="btn-discover bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Discover Now
          </button>
        </div>
        <div className="home-picture">
          <img src={homePicture} alt="home-picture" className="picture" />
        </div>
      </div>

      {/* Danh sách món ăn từ API */}
      <div className="food-container">
        <h3 className="food-slogan">Recommended Food</h3>
        <h1 className="food-title">Standout Foods From Our Menu</h1>

        <div className="food-content">
  {dishes.length > 0 ? (
    dishes.map((dish) => (
      <div key={dish._id} className="food-item">
        <div className="food-like-container">
          <div className="w-[87px] h-[75px] bg-[#39da49] rounded-tr-[37.50px] rounded-bl-[42.50px]"></div>
        </div>
        <div className="center-con">
          <div className="food-i-container">
            {/* Hiển thị ảnh món ăn từ imageUrl */}
            {dish.imageUrl ? (
              <img src={dish.imageUrl} alt={dish.name} className="object-cover w-full h-[150px]" />
            ) : (
              <p>No Image</p>
            )}
          </div>
        </div>
        <div className="food-item-title">{dish.name}</div>
        <div className="food-item-des">{dish.description || "No description"}</div>
        <div className="food-item-rating">
          <p className="food-item-rating-title">Rating</p>
          <p className="food-item-rating-average">{dish.rating || "N/A"}</p>
        </div>
      </div>
    ))
  ) : (
    <p>Loading dishes...</p>
  )}
</div>

      </div>

      {/* Danh sách nguyên liệu từ API */}
      <div className="ingredients-container">
        <h3 className="ingredients-slogan">Fresh Ingredients</h3>
        <h1 className="ingredients-title">Handpicked for the Best Taste</h1>

        <div className="food-content">
  {ingredients.length > 0 ? (
    ingredients.map((ingredient) => (
      <div key={ingredient._id} className="food-item">
        <div className="food-like-container">
          <div className="w-[87px] h-[75px] bg-[#39da49] rounded-tr-[37.50px] rounded-bl-[42.50px]"></div>
        </div>
        <div className="center-con">
          <div className="food-i-container">
            {/* Hiển thị ảnh nguyên liệu từ imageUrl */}
            {ingredient.imageUrl ? (
              <img src={ingredient.imageUrl} alt={ingredient.name} className="object-cover w-full h-[150px]" />
            ) : (
              <p>No Image</p>
            )}
          </div>
        </div>
        <div className="food-item-title">{ingredient.name}</div>
        <div className="food-item-des">{ingredient.description || "No description"}</div>
      </div>
    ))
  ) : (
    <p>Loading ingredients...</p>
  )}
</div>
      </div>
    </div>
  );
};

export default Home;
