import React, {useEffect, useState} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAuth } from "../../store/selectors/authSelectors";
 // Import the icons
import homePicture from "../../assets/images/homePic.png";
import brow from "../../assets/images/brow.png";
import dessert from "../../assets/images/dessert.png";
import dish from "../../assets/images/mainDish.png";
import breakfast from "../../assets/images/breakfast.png";
import salad from "../../assets/images/Salad.png";

const Home = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);

  

  console.log("user state", user);

  if (user) {
    return (
      <div className="home">
        <div className="home-container">
          <div className="home-content">
            <h1 className="home-title bold text-black-600">
              Dive into Delights Of Delectable <span className="text-green">Food</span>
            </h1>
            <h2 className="home-title-s">Kill the Hunger</h2>
            <p className="home-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
            </p>
            <button
              onClick={() => navigate("/another-page")} // Replace "/another-page" with the desired path
              className="btn-discover bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Discover Now
            </button>
          </div>
          <div className="home-picture">
            <img src={homePicture} alt="home-picture" className="picture" />
          </div>
        </div>

        <div className="cate-container">
          <h1 className="cate-title">Popular Dishes</h1>
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
          <h3 className="food-slogan">Recommended Food</h3>
          <div className="food-title-container">
            <h1 className="food-title">Standout Foods From Our Menu</h1>
            <div className="food-btn-slide">
              
              <div className="food-btn-s">
              
              </div>
              <div className="food-btn-s"></div>
              
            </div>
          </div>

          <div className="food-content">
            <div className="food-item">
              <div className="food-like-container">
              <div className="w-[87px] h-[75px] bg-[#39da49] rounded-tr-[37.50px] rounded-bl-[42.50px]"></div>
              </div>

              <div className="center-con">
                <div className="food-i-container">
                  <img src={salad} alt="salad" />
                </div>
              </div>

              <div className="food-item-title">Fattoush salad</div>
              <div className="food-item-des">Description of the item</div>

              <div className="food-item-rating">
                <p className="food-item-rating-title">Rating</p>
                <span className="food-item-rating-star"></span>
                <p className="food-item-rating-average">4.9</p>
              </div>
            </div>

            <div className="food-item">
            <div className="food-like-container">
              <div className="w-[87px] h-[75px] bg-[#39da49] rounded-tr-[37.50px] rounded-bl-[42.50px]"></div>
              </div>
              <div className="center-con">
                <div className="food-i-container">
                  <img src={salad} alt="salad" />
                </div>
              </div>

              <div className="food-item-title">Fattoush salad</div>
              <div className="food-item-des">Description of the item</div>

              <div className="food-item-rating">
                <p className="food-item-rating-title">Rating</p>
                <span className="food-item-rating-star"></span>
                <p className="food-item-rating-average">4.9</p>
              </div>
            </div>

            <div className="food-item">
            <div className="food-like-container">
              <div className="w-[87px] h-[75px] bg-[#39da49] rounded-tr-[37.50px] rounded-bl-[42.50px]">
                
              </div>
              </div>
              <div className="center-con">
                <div className="food-i-container">
                  <img src={salad} alt="salad" />
                </div>
              </div>

              <div className="food-item-title">Fattoush salad</div>
              <div className="food-item-des">Description of the item</div>

              <div className="food-item-rating">
                <p className="food-item-rating-title">Rating</p>
                <span className="food-item-rating-star"></span>
                <p className="food-item-rating-average">4.9</p>
              </div>
            </div>
          </div>

          <div className="chef-container">
            <div className="chef-img-container">
              </div>
              <div className="chef-content">
              </div>
            
          </div>
            
  
  

        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p>You must be login to see out product</p>
    </div>
  );
};

export default Home;