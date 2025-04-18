import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import { loginSuccess } from "../../store/slices/authSlice";
import { RiArrowLeftSLine } from "react-icons/ri";
const hateGroups = [
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

// Function to map from id to name
export const getHateNameById = (id) => {
  for (const group of hateGroups) {
    const item = group.items.find((item) => item.id === id);
    if (item) return item.name;
  }
  return "Unknown"; // Return "Unknown" if the id is not found
};

// Function to map a list of ids to a list of names
export const getHateNamesByIds = (ids) => {
  if (!ids || !Array.isArray(ids)) return [];
  return ids.map((id) => getHateNameById(id));
};

const getItemById = (id) => {
  for (const group of hateGroups) {
    const item = group.items.find((item) => item.id === id);
    if (item) return item;
  }
  return null;
};

const Hate = () => {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState([]); // Store the favorite list from sessionStorage

  // Load data from sessionStorage when the page loads
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.hate) {
      setSelectedItemIds(savedData.hate);
    }
    if (savedData.favorite) {
      setFavoriteItemIds(savedData.favorite); // Get the favorite list for checking
    }
  }, []);

  const toggleItemSelection = (id) => {
    // Do not allow selection if the id is in favoriteItemIds
    if (favoriteItemIds.includes(id)) {
      return; // Skip if already favorite
    }
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allItemIds = hateGroups
      .flatMap((group) => group.items.map((item) => item.id))
      .filter((id) => !favoriteItemIds.includes(id)); // Exclude ids that are favorite
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

  const handleNext = async () => {
    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const updatedData = {
      ...currentData,
      hate: selectedItemIds,
    };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));

    if (!user || !user._id || !user.email || !user.username) {
      alert("User information is incomplete. Please log in again!");
      console.error("❌ Missing user information in Redux:", user);
      return;
    }

    const requiredFields = [
      "age",
      "diet",
      "eatHabit",
      "longOfPlan",
      "mealNumber",
      "goal",
      "sleepTime",
      "waterDrink",
      "weight",
      "weightGoal",
      "height",
      "activityLevel",
      "gender",
      "underDisease",
    ];

    const missingFields = requiredFields.filter(
      (field) => !currentData[field] && currentData[field] !== 0
    );

    if (missingFields.length > 0) {
      alert(
        `Please complete the previous steps. Missing fields: ${missingFields.join(
          ", "
        )}`
      );
      console.error("❌ Missing fields in quizData:", missingFields);
      return;
    }

    const finalData = {
      userId: user._id,
      email: user.email,
      name: user.username,
      age: currentData.age || null,
      diet: currentData.diet || null,
      eatHabit: currentData.eatHabit || [],
      favorite: currentData.favorite || [],
      longOfPlan: currentData.longOfPlan || null,
      mealNumber: currentData.mealNumber || "0",
      goal: currentData.goal || null,
      sleepTime: currentData.sleepTime || null,
      waterDrink: currentData.waterDrink || null,
      hate: selectedItemIds,
      weight: currentData.weight || 0,
      weightGoal: currentData.weightGoal || 0,
      height: currentData.height || 0,
      activityLevel: currentData.activityLevel
        ? currentData.activityLevel.value
        : 1.2,
      gender: currentData.gender || null,
      phoneNumber: currentData.phoneNumber || null,
      underDisease: currentData.underDisease || [],
      theme: currentData.theme || false,
      isDelete: false,
    };

    if (!finalData.userId || !finalData.email || !finalData.name) {
      alert("Data is incomplete for server submission!");
      console.error("❌ finalData is incomplete:", finalData);
      return;
    }

    sessionStorage.setItem("finalData", JSON.stringify(finalData));
    console.log("🚀 finalData sent to backend:", finalData);

    try {
      const result = await quizService.submitQuizData();
      if (result.success) {
        if (result.user) {
          if (!result.user.userPreferenceId) {
            console.warn("⚠️ userPreferenceId is still null:", result.user);
            alert(
              "userPreferenceId has not been updated. Please check the backend logic."
            );
          } else {
            console.log(
              "✅ userPreferenceId has been updated:",
              result.user.userPreferenceId
            );
          }
          dispatch(
            loginSuccess({
              user: result.user,
              token: localStorage.getItem("token"),
            })
          );
          console.log("✅ Updated user in Redux:", result.user);
          navigate("/");
        } else {
          console.error("🚨 No user data in submitQuizData response:", result);
          alert(
            `Unable to retrieve updated user data: ${
              result.message || "User data is missing in the response."
            }`
          );
        }
      } else {
        console.error("🚨 Submission failed:", result.message);
        alert(
          `Error submitting quiz: ${
            result.message || "An unknown error occurred."
          }`
        );
      }
    } catch (error) {
      console.error("🚨 Error in handleNext:", error);
      alert(
        `An error occurred while submitting the quiz: ${
          error.message || "Unknown error"
        }`
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleNext();
    }
  };

  return (
    <div
      className="w-[400px] mx-auto p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex items-center justify-center mt-2">
        <button
          onClick={() => navigate("/survey/favorite")}
          className="absolute left-20 w-12 h-12 p-2 bg-white border border-[#40B491] rounded-full shadow hover:bg-[#66e3ba] transition flex items-center justify-center"
        >
          <RiArrowLeftSLine className="w-12 h-12 text-[#40B491]" />
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
          checked={
            selectedItemIds.length ===
            hateGroups
              .flatMap((c) => c.items)
              .filter((item) => !favoriteItemIds.includes(item.id)).length
          }
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
                key={item.id}
                className={`p-2 rounded-lg ${
                  selectedItemIds.includes(item.id)
                    ? "bg-green-400 text-white"
                    : favoriteItemIds.includes(item.id)
                    ? "bg-blue-200 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-green-200"
                } transition`}
                onClick={() => toggleItemSelection(item.id)}
                disabled={favoriteItemIds.includes(item.id)} // Disable if already favorite
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

export default Hate;
