import React from "react";
import CategoryImg from "../../../assets/images/Category/Category.png";
import HeavImg from "../../../assets/images/Category/HeavyMeal.png";
import LightImg from "../../../assets/images/Category/LightMeal.png";
import SeasonImg from "../../../assets/images/Category/Season.png";
import DessertImg from "../../../assets/images/Category/Dessert.png";


const categories = [
  { id: 1, name: "Heavy Meals", image: HeavImg },
  { id: 2, name: "Light Meals", image: LightImg },
  { id: 3, name: "Desserts", image: DessertImg },
  { id: 4, name: "Seasons", image: SeasonImg },
];

const CategorySection = () => {
    return (
      <div className="w-full bg-white py-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* Danh mục món ăn cùng logo */}
          <div className="flex justify-start  w-full">
            <div className="flex flex-col items-center">
              <img src={CategoryImg} alt="Explore" className="w-40 h-28" />
              <p className="text-gray-700 font-medium mt-2">Let's explore with us</p>
            </div>
            <div className="flex justify-end gap-8 flex-wrap flex-1">
              {categories.map((category) => (
                <div key={category.id} className="flex flex-col items-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-24 h-24 rounded-full shadow-md object-cover"
                  />
                  <p className="text-gray-700 mt-2">{category.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default CategorySection;
