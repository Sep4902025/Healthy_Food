import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import quizService from "../../services/quizService"; // Import service
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";

const hateGroups = [
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

const Hate = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.hate) {
      setSelectedItems(savedData.hate);
    }
  }, []);

  const toggleItemSelection = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const selectAll = () => {
    const allItems = hateGroups.flatMap((group) => group.items);
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

  const handleNext = async () => {
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};

    if (!user || !user._id) {
      alert("User ID is missing. Please login again.");
      console.error("❌ No user._id found in Redux.");
      return;
    }

    const finalData = {
      ...currentData,
      hate: selectedItems,
      userId: user._id, // Lấy trực tiếp từ Redux
    };

    sessionStorage.setItem("finalData", JSON.stringify(finalData));

    console.log("🚀 FINALDATA to send:", finalData);

    const result = await quizService.submitQuizData();

    if (result.success) {
      navigate("/");
    } else {
      alert(`Error: ${result.message}`);
      console.error("🚨 Submit failed:", result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/favorite")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={100} />
      </div>

      <h2 className="text-2xl font-bold text-center">Hate</h2>
      <p className="text-center text-gray-600">Select your allergic food</p>

      <div className="flex items-center justify-start space-x-2 my-4">
        <input
          type="checkbox"
          id="selectAll"
          onChange={handleSelectAllToggle}
          checked={selectedItems.length === hateGroups.flatMap((c) => c.items).length}
        />
        <label htmlFor="selectAll">Select All</label>
      </div>

      {hateGroups.map((group, index) => (
        <div key={index} className="mb-4">
          <div className="font-bold text-lg flex items-center space-x-2">
            <span>{group.icon}</span>
            <span>{group.name}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {group.items.map((item) => (
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

export default Hate;
