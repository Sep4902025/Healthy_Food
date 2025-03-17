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
      <div className=" flex flex-col md:flex-row items-center justify-between">
        <div className=" text-center md:text-left md:w-1/2">
        <h1 className="m-10 text-xl md:text-4xl lg:text-[62px] font-extrabold text-black leading-normal md:leading-[1.2] w-full md:w-2/3 lg:w-[65%] text-center md:text-left mx-auto md:mx-0">
            <span className="text-green">
              Do you want to personalize it for you?
            </span>
          </h1>
          <p className="pt-5 text-sm md:text-base lg:text-lg">
            Please tell us more about yourself.
          </p>
          <button
            onClick={() => navigate("/another-page")}
            className="btn-discover bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm md:text-base"
          >
            Take survey here
          </button>
        </div>
        <div className="home-picture md:w-1/2 flex justify-center">
          <img
            src={homePicture}
            alt="home-picture"
            className="w-3/4 md:w-full max-w-xs md:max-w-md lg:max-w-lg"
          />
        </div>
      </div>

      {/* Danh sách món ăn từ API */}
      <div className="text-center px-4 p-10">
        <h3 className="p-10 text-2xl md:text-2xl lg:text-[50px] font-extrabold leading-normal text-[#ff6868]">
          Recommended Dishes
        </h3>

        <div className=" text-center px-4">
          <h1 className="p-10 text-[60px] md:text-4xl lg:text-5xl font-extrabold text-black leading-tight max-w-[90%] md:max-w-[80%] lg:max-w-[60%] mx-auto">
            Standout Foods From Our Menu
          </h1>
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
