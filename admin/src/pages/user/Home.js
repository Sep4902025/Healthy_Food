import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import homePicture from "../../assets/images/homePic.png";
import HomeService from "../../services/home.service";
import FoodSlider from "../../components/ui/FoodSlider";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
const Home = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const userId = useSelector(selectAuth)?.user?._id;

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await HomeService.getAllDishes();
        setDishes(data.data);
        console.log("Full dishes:", dishes);
      } catch (error) {
        console.error("Error fetching food data:", error);
      }
    };

    fetchDishes();
  }, []);
  return (
    <div className="home">
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title bold text-black-600">
            <span className="text-green">
              Do you want to personalize it for you?
            </span>
          </h1>
          <p className="home-description">
            Please tell us more about yourself.
          </p>
          <button
            onClick={() => navigate("/another-page")}
            className="btn-discover bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Take survey here
          </button>
        </div>
        <div className="home-picture">
          <img src={homePicture} alt="home-picture" className="picture" />
        </div>
      </div>

      {/* Danh sách món ăn từ API */}
      <div className="food-container">
        <h3 className="food-slogan">Recommended Dishes</h3>
        <div className="food-title-container">
          <h1 className="food-title">Standout Foods From Our Menu</h1>
        </div>

        <FoodSlider userId={userId} dishes={dishes} />

        <div className="chef-container">
          <div className="chef-img-container"></div>
          <div className="chef-content"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
