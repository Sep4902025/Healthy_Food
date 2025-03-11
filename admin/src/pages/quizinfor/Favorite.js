import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

const favoriteGroups = [
  {
    name: "Vegetables",
    icon: "🥦",
    items: [
      "Tomato",
      "Cucumber",
      "Bell pepper",
      "Onion",
      "Spinach",
      "Mushroom",
      "Cherry tomato",
      "Lettuce",
      "Zucchini",
      "Carrot",
    ],
  },
  {
    name: "Meat",
    icon: "🍖",
    items: [
      "Chicken",
      "Beef",
      "Pork",
      "Duck",
      "Lamb",
      "Goose",
      "Goat",
      "Rabbit",
      "Cold cuts",
      "Sausage",
    ],
  },
  {
    name: "Fish",
    icon: "🐟",
    items: [
      "Salmon",
      "Tuna",
      "Mackerel",
      "Basa fish",
      "Herring",
      "Tilapia",
      "Seabass",
      "Pomfret",
      "Scad",
      "Sardine",
    ],
  },
  {
    name: "Dairy",
    icon: "🥛",
    items: [
      "Fresh milk",
      "Yogurt",
      "Cheese",
      "Butter",
      "Almond milk",
      "Soy milk",
      "Whipping cream",
      "Condensed milk",
      "Cream cheese",
      "Walnut milk",
    ],
  },
  {
    name: "Fruits",
    icon: "🍎",
    items: [
      "Apple",
      "Banana",
      "Orange",
      "Strawberry",
      "Pineapple",
      "Mango",
      "Pear",
      "Grapes",
      "Watermelon",
      "Avocado",
    ],
  },
  {
    name: "Grains",
    icon: "🌾",
    items: [
      "White rice",
      "Brown rice",
      "Oats",
      "Quinoa",
      "Millet",
      "Barley",
      "Corn",
      "Chia seeds",
      "Buckwheat",
      "Whole wheat bread",
    ],
  },
];

const Favorite = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.favorite) {
      setSelectedItems(savedData.favorite);
    }
  }, []);

  const toggleItemSelection = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const selectAll = () => {
    const allItems = favoriteGroups.flatMap((favorite) => favorite.items);
    setSelectedItems(allItems);
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const handleSelectAllToggle = (e) => {
    if (e.target.checked) {
      selectAll();
    } else {
      deselectAll();
    }
  };

  const handleNext = () => {
    // Lấy dữ liệu hiện tại từ sessionStorage
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    // Ghi đè favorites vào object hiện tại
    const updatedData = {
      ...currentData,
      favorite: selectedItems,
    };

    // Lưu lại toàn bộ quizData vào sessionStorage
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    // Điều hướng sang trang tiếp theo
    navigate("/quizinfor/hate");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/quizinfor/underdisease")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={10} />
      </div>

      <h2 className="text-2xl font-bold text-center">Favorite</h2>
      <p className="text-center text-gray-600">Select your favorite food</p>

      <div className="flex items-center justify-start space-x-2 my-4">
        <input
          type="checkbox"
          id="selectAll"
          onChange={handleSelectAllToggle}
          checked={
            selectedItems.length ===
            favoriteGroups.flatMap((c) => c.items).length
          }
        />
        <label htmlFor="selectAll">Select All</label>
      </div>

      {favoriteGroups.map((favorite, index) => (
        <div key={index} className="mb-4">
          <div className="font-bold text-lg flex items-center space-x-2">
            <span>{favorite.icon}</span>
            <span>{favorite.name}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {favorite.items.map((item) => (
              <button
                key={item}
                className={`p-2 rounded-lg ${
                  selectedItems.includes(item)
                    ? "bg-green-400 text-white"
                    : "bg-gray-100 hover:bg-green-200"
                } transition`}
                onClick={() => toggleItemSelection(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleNext}
        className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
      >
        Next
      </button>
    </div>
  );
};

export default Favorite;
