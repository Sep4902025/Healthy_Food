import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";

// Đồng bộ danh sách với hateGroups
const favoriteGroups = [
  {
    name: "Vegetables",
    icon: "🥦",
    items: [
      { id: "67d78db6bdd60cc0bf1c1c6b", name: "Garlic" },
      { id: "67d78db6bdd60cc0bf1c1c6c", name: "Shallot" },
      { id: "67d78db6bdd60cc0bf1c1c6f", name: "Bean Sprouts" },
      { id: "67d78db6bdd60cc0bf1c1c70", name: "Banana Flower" },
      { id: "67d78db6bdd60cc0bf1c1c73", name: "Scallion" },
      { id: "67d7919bbdd60cc0bf1c1cac", name: "Green Onion" },
    ],
  },
  {
    name: "Meat",
    icon: "🍖",
    items: [
      { id: "67d78db6bdd60cc0bf1c1c65", name: "Beef Shank" },
      { id: "67d78db6bdd60cc0bf1c1c66", name: "Pork Hock" },
    ],
  },
  {
    name: "Dairy",
    icon: "🥛",
    items: [
      { id: "67d6868218855f47c0945154", name: "Butter" },
      { id: "67d6868218855f47c0945155", name: "Milk" },
    ],
  },
  {
    name: "Fruits",
    icon: "🍎",
    items: [{ id: "67d78db6bdd60cc0bf1c1c71", name: "Lime" }],
  },
  {
    name: "Grains",
    icon: "🌾",
    items: [
      { id: "67d6868218855f47c094514f", name: "Flour" },
      { id: "67d78db6bdd60cc0bf1c1c6e", name: "Rice Vermicelli" },
      { id: "67d7919bbdd60cc0bf1c1ca9", name: "Rice Noodles" },
    ],
  },
  {
    name: "Liquid",
    icon: "💧",
    items: [
      { id: "67d6868218855f47c0945150", name: "Water" },
      { id: "67d78db6bdd60cc0bf1c1c6d", name: "Beef Broth" },
    ],
  },
  {
    name: "Leavening Agent",
    icon: "🧀",
    items: [{ id: "67d6868218855f47c0945151", name: "Yeast" }],
  },
  {
    name: "Seasoning",
    icon: "🧂",
    items: [
      { id: "67d6868218855f47c0945152", name: "Salt" },
      { id: "67d6868218855f47c0945153", name: "Sugar" },
      { id: "67d78db6bdd60cc0bf1c1c68", name: "Shrimp Paste" },
      { id: "67d78db6bdd60cc0bf1c1c69", name: "Fish Sauce" },
    ],
  },
  {
    name: "Spice",
    icon: "🌶️",
    items: [{ id: "67d78db6bdd60cc0bf1c1c6a", name: "Chili Powder" }],
  },
  {
    name: "Herb",
    icon: "🌿",
    items: [
      { id: "67d78db6bdd60cc0bf1c1c67", name: "Lemongrass" },
      { id: "67d78db6bdd60cc0bf1c1c72", name: "Coriander" },
      { id: "67d7919bbdd60cc0bf1c1cab", name: "Cilantro" },
    ],
  },
  {
    name: "Protein",
    icon: "🥚",
    items: [{ id: "67d6868218855f47c0945156", name: "Egg" }],
  },
];

const Favorite = () => {
  const navigate = useNavigate();
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [hatedItemIds, setHatedItemIds] = useState([]); // Lưu danh sách hate từ sessionStorage

  // Load dữ liệu từ sessionStorage khi vào trang
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.favorite) {
      setSelectedItemIds(savedData.favorite);
    }
    if (savedData.hate) {
      setHatedItemIds(savedData.hate); // Lấy danh sách hate để kiểm tra
    }
  }, []);

  const toggleItemSelection = (id) => {
    // Không cho chọn nếu id đã có trong hatedItemIds
    if (hatedItemIds.includes(id)) {
      return; // Bỏ qua nếu đã bị ghét
    }
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allItemIds = favoriteGroups
      .flatMap((group) => group.items.map((item) => item.id))
      .filter((id) => !hatedItemIds.includes(id)); // Loại bỏ các id đã bị ghét
    setSelectedItemIds(allItemIds);
  };

  const deselectAll = () => {
    setSelectedItemIds([]);
  };

  const handleSelectAllToggle = (e) => {
    if (e.target.checked) {
      selectAll();
    } else {
      deselectAll();
    }
  };

  const handleNext = () => {
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      favorite: selectedItemIds,
    };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    navigate("/survey/hate");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div
      className="max-w-md mx-auto p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/underdisease")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={94.5} />
      </div>

      <h2 className="text-2xl font-bold text-center">Favorite</h2>
      <p className="text-center text-gray-600">Select your favorite food</p>

      <div className="flex items-center justify-start space-x-2 my-4">
        <input
          type="checkbox"
          id="selectAll"
          onChange={handleSelectAllToggle}
          checked={
            selectedItemIds.length ===
            favoriteGroups
              .flatMap((c) => c.items)
              .filter((item) => !hatedItemIds.includes(item.id)).length
          }
        />
        <label htmlFor="selectAll">Select All</label>
      </div>

      {favoriteGroups.map((group, index) => (
        <div key={index} className="mb-4">
          <div className="font-bold text-lg flex items-center space-x-2">
            <span>{group.icon}</span>
            <span>{group.name}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`p-2 rounded-lg ${
                  selectedItemIds.includes(item.id)
                    ? "bg-green-400 text-white"
                    : hatedItemIds.includes(item.id)
                    ? "bg-red-200 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-green-200"
                } transition`}
                onClick={() => toggleItemSelection(item.id)}
                disabled={hatedItemIds.includes(item.id)} // Vô hiệu hóa nếu đã bị ghét
              >
                {item.name}
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
