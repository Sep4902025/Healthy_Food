import React from "react";
import SpringImg from "../../../assets/images/Season/Spring.jpg";
import SummerImg from "../../../assets/images/Season/Summer.avif";
import AutumnImg from "../../../assets/images/Season/Autumn.jpg";
import WinterImg from "../../../assets/images/Season/Winter.avif";
import AllSeasonImg from "../../../assets/images/Season/AllSeason.jpg";
import Logo from "../../../assets/images/Season/Logo.png";

const categories = [
  { id: 1, name: "Spring", image: SpringImg },
  { id: 2, name: "Summer", image: SummerImg },
  { id: 3, name: "Autumn", image: AutumnImg },
  { id: 4, name: "Winter", image: WinterImg },
  { id: 5, name: "All seasons", image: AllSeasonImg },
];

const SeasonSection = ({onSelectSeason }) => {
  return (
    <div className="w-full bg-white py-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Danh mục món ăn cùng logo */}
        <div className="flex justify-start w-full">
          <div className="flex flex-col items-center">
            <img src={Logo} alt="Explore" className="w-40 h-28" />
            <p className="text-gray-700 font-medium mt-2">Let's explore with us</p>
          </div>
          <div className="flex justify-end gap-8 flex-wrap flex-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center group transition-all duration-300"
                onClick={() => onSelectSeason(category.name)} 
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-24 h-24 rounded-full shadow-md object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <p className="text-gray-700 mt-2 transition-colors duration-300 group-hover:text-[#40B491]">
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonSection;
