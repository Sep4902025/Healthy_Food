import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import homePicture from "../../assets/images/homePic.png";
import HomeService from "../../services/home.service";
import FoodSlider from "./HomeSection/FoodSlider";
import SeasonSection from "./HomeSection/SeasonSection";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import FoodBySeasonSection from "./HomeSection/FoodBySeasonSection";

const Home = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector(selectAuth)?.user?._id;
  const [selectedSeason, setSelectedSeason] = useState("All seasons");

  const filteredSeasonDishes = Array.isArray(dishes)
    ? selectedSeason === "All seasons"
      ? dishes
      : dishes.filter((dish) => dish.season === selectedSeason)
    : [];

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      try {
        const data = await HomeService.getAllDishes();
        console.log("API Response:", data);
        const dishesArray = data.data.items || data.data || [];
        setDishes(dishesArray);
      } catch (error) {
        console.error("Error fetching food data:", error);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading dishes...</div>;
  }

  if (!dishes.length) {
    return <div className="text-center p-10">No dishes available at the moment.</div>;
  }

  return (
    <div className="home">
      <div className="bg-[#40B491] bg-opacity-20 m-4 pl-10 pr-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="m-10 text-xl md:text-4xl lg:text-[62px] font-extrabold text-black leading-normal md:leading-[1.2] w-full md:w-2/3 lg:w-[65%] text-center md:text-left mx-auto md:mx-0">
              <span className="text-[#40B491]">
                Do you want to personalize it for you?
              </span>
            </h1>
            <p className="pt-5 text-sm md:text-base lg:text-lg">
              Please tell us more about yourself.
            </p>
            <button
              onClick={() => navigate("/another-page")}
              className="mt-5 mb-5 bg-[#40B491] px-[45px] py-[15px] rounded-full text-white font-semibold hover:bg-[#369e7f] transition duration-200 uppercase"
            >
              Take survey here
            </button>
          </div>
          <div className="home-picture md:w-1/2 flex justify-center">
            <img
              src={homePicture}
              alt="home-picture"
              className="w-3/4 md:w-full max-w-xs md:max-w-md lg:max-w-lg mix-blend-multiply"
            />
          </div>
        </div>
      </div>

      <hr className="w-full border-t border-gray-300 my-6" />

      <div>
        <h3 className="p-10 text-2xl md:text-2xl lg:text-[50px] font-extrabold leading-normal text-[#ff6868]">
          Recommended Dishes
        </h3>

        <div className="text-center px-4">
          <h1 className="p-10 text-[60px] md:text-4xl lg:text-5xl font-extrabold text-black leading-tight max-w-[90%] md:max-w-[80%] lg:max-w-[60%] mx-auto">
            Standout Foods From Our Menu
          </h1>
        </div>
        <FoodSlider userId={userId} dishes={dishes} />
        <hr className="w-full border-t border-gray-300 my-6" />

        <SeasonSection onSelectSeason={setSelectedSeason} />
        <hr className="w-full border-t border-gray-300 my-6" />

        <FoodBySeasonSection
          userId={userId}
          selectedSeason={selectedSeason}
          dishes={filteredSeasonDishes}
        />

        <hr className="w-full border-t border-gray-300 my-6" />
      </div>
    </div>
  );
};

export default Home;