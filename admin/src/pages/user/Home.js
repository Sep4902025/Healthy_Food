import React, { useEffect, useState, useContext } from "react";
import HomeService from "../../services/home.service";
import FoodSlider from "./HomeSection/FoodSlider";
import SeasonSection from "./HomeSection/SeasonSection";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import FoodBySeasonSection from "./HomeSection/FoodBySeasonSection";
import { useOutletContext } from "react-router-dom";
import IntroSection from "./HomeSection/IntroSection";
const Home = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector(selectAuth)?.user?._id;
  const [selectedSeason, setSelectedSeason] = useState("All seasons");
  const { darkMode } = useOutletContext();

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
    return (
      <div className="text-center p-10">No dishes available at the moment.</div>
    );
  }

  return (
    <div className="home">
      {/* Intro section */}
      <IntroSection darkMode={darkMode}></IntroSection>

      <hr className="w-full border-t border-gray-300 my-6" />
      {/* All dish section */}

      <FoodSlider userId={userId} dishes={dishes} />
      <hr className="w-full border-t border-gray-300 my-6" />

      {/* Season section */}
      <SeasonSection onSelectSeason={setSelectedSeason} />
      <hr className="w-full border-t border-gray-300 my-6" />

      {/* Food by season section */}
      <FoodBySeasonSection
        userId={userId}
        selectedSeason={selectedSeason}
        dishes={filteredSeasonDishes}
      />
      <hr className="w-full border-t border-gray-300 my-6" />
    </div>
  );
};

export default Home;
