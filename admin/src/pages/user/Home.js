import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAuth } from "../../store/selectors/authSelectors";
// Import the icons
import homePicture from "../../assets/images/homePic.png";
import brow from "../../assets/images/brow.png";
import dessert from "../../assets/images/dessert.png";
import dish from "../../assets/images/mainDish.png";
import breakfast from "../../assets/images/breakfast.png";
import HomeService from "../../services/home.service";
import FoodSlider from "../../components/ui/FoodSlider";

const Home = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const userId = useSelector(selectAuth)?.user?._id;

  const [quizInfo, SetQuizInfo] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await HomeService.getAllDishes();
        setDishes(data.data);
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
            <span className="text-green">Do you want to personalize it for you?</span>
          </h1>
          <p className="home-description">
          Please tell us more about yourself.
          </p>
          <button
            onClick={() => navigate("/another-page")} // Replace "/another-page" with the desired path
            className="btn-discover bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Take survey here
          </button>
        </div>
        <div className="home-picture">
          <img src={homePicture} alt="home-picture" className="picture" />
        </div>
      </div>

      <div className="cate-container">
        <h1 className="cate-title">Popular Categories</h1>
        <div className="cate-list">
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={dish} alt="Main Dishes" />
              </div>
            </div>
            <h2 className="cate-item-title">Main Dish</h2>
            <h3 className="cate-item-count">(86 dishes)</h3>
          </div>
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={breakfast} alt="BreakFast" />
              </div>
            </div>
            <h2 className="cate-item-title">Break Fast</h2>
            <h3 className="cate-item-count">(12 break fast)</h3>
          </div>
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={dessert} alt="Dessert" />
              </div>
            </div>
            <h2 className="cate-item-title">Dessert</h2>
            <h3 className="cate-item-count">(48 desert)</h3>
          </div>
          <div className="cate-item">
            <div className="center-con">
              <div className="cate-i-container">
                <img src={brow} alt="Browse" />
              </div>
            </div>
            <h2 className="cate-item-title">Browse All</h2>
            <h3 className="cate-item-count">(255 items)</h3>
          </div>
        </div>
      </div>

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
