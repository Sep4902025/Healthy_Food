import React, { useEffect, useState } from "react";
import HomeService from "../../services/home.service";
import FoodSlider from "./HomeSection/FoodSlider";
import SeasonSection from "./HomeSection/SeasonSection";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import FoodBySeasonSection from "./HomeSection/FoodBySeasonSection";
import IntroSection from "./HomeSection/IntroSection";
import SearchResult from "./HomeSection/SearchResult";
import { useSearch } from "../context/SearchContext";
// Define useCurrentSeason hook directly in Home.js
const useCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1
  if (month >= 1 && month <= 3) return "Spring";
  if (month >= 4 && month <= 6) return "Summer";
  if (month >= 7 && month <= 9) return "Fall";
  return "Winter";
};

const Home = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector(selectAuth)?.user?._id;
  const currentSeason = useCurrentSeason(); // Use the hook to get the current season
  const [selectedSeason, setSelectedSeason] = useState(currentSeason); // Default to current season (e.g., "Summer")
  const { searchTerm } = useSearch();
  const [filteredDishes, setFilteredDishes] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      try {
        const data = await HomeService.getAllDishes(1, 1000);
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

  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter((dish) =>
        dish.name && typeof dish.name === "string"
          ? dish.name.toLowerCase().includes(searchTerm.toLowerCase())
          : false
      );
      setFilteredDishes(filtered);
    }
  }, [searchTerm, dishes]);

  if (loading) {
    return <div className="text-center p-10">Loading dishes...</div>;
  }

  if (!dishes.length) {
    return <div className="text-center p-10">No dishes available at the moment.</div>;
  }

  return (
    <div className="home">
      {/* Intro Section */}
      <IntroSection />

      {/* Search Section */}
      {searchTerm?.trim() && (
        <>
          <SearchResult userId={userId} dishes={filteredDishes} />
          <hr className="w-full border-t border-gray-300 my-6" />
        </>
      )}

      {/* FoodMainSection */}
      <FoodSlider userId={userId} dishes={dishes} />
      <hr className="w-full border-t border-gray-300 my-6" />

      {/* SeasonSection */}
      <SeasonSection onSelectSeason={setSelectedSeason} selectedSeason={selectedSeason} />
      <hr className="w-full border-t border-gray-300 my-6" />

      <FoodBySeasonSection userId={userId} selectedSeason={selectedSeason} />

      <hr className="w-full border-t border-gray-300 my-6" />
    </div>
  );
};

export default Home;
