import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import { loginSuccess } from "../../store/slices/authSlice";

// Tạo danh sách với ID cho từng món
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

// Helper function để tìm item từ ID
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

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.hate) {
      setSelectedItemIds(savedData.hate);
    }
  }, []);

  const toggleItemSelection = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allItemIds = hateGroups.flatMap((group) =>
      group.items.map((item) => item.id)
    );
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

    // Kiểm tra user từ Redux
    if (!user || !user._id || !user.email || !user.username) {
      alert("Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại!");
      console.error("❌ Thiếu thông tin người dùng trong Redux:", user);
      return;
    }

    // Lấy underDisease (ID) từ currentData
    const underDiseaseIds = currentData.underDisease || [];

    // Tạo finalData với ID thay vì nhãn
    const finalData = {
      ...currentData,
      hate: selectedItemIds, // Lưu ID thay vì nhãn
      underDisease: underDiseaseIds, // Lưu ID thay vì nhãn
      userId: user._id,
      email: user.email,
      name: user.username,
    };

    // Kiểm tra finalData trước khi lưu
    if (!finalData.userId || !finalData.email || !finalData.name) {
      alert("Dữ liệu không đầy đủ để gửi lên server!");
      console.error("❌ finalData không đầy đủ:", finalData);
      return;
    }

    sessionStorage.setItem("finalData", JSON.stringify(finalData));
    console.log("🚀 finalData gửi lên backend:", finalData);

    try {
      const result = await quizService.submitQuizData();
      if (result.success) {
        if (result.user) {
          if (!result.user.userPreferenceId) {
            console.warn("⚠️ userPreferenceId vẫn là null:", result.user);
            alert(
              "userPreferenceId chưa được cập nhật. Vui lòng kiểm tra logic backend."
            );
          } else {
            console.log(
              "✅ userPreferenceId đã được cập nhật:",
              result.user.userPreferenceId
            );
          }
          dispatch(
            loginSuccess({
              user: result.user,
              token: localStorage.getItem("token"),
            })
          );
          console.log("✅ Đã cập nhật user trong Redux:", result.user);
          navigate("/");
        } else {
          console.error(
            "🚨 Không có dữ liệu user trong phản hồi submitQuizData:",
            result
          );
          alert(
            `Không thể lấy dữ liệu user đã cập nhật: ${
              result.message || "Dữ liệu user bị thiếu trong phản hồi."
            }`
          );
        }
      } else {
        console.error("🚨 Gửi thất bại:", result.message);
        alert(
          `Lỗi khi gửi bài kiểm tra: ${
            result.message || "Đã xảy ra lỗi không xác định."
          }`
        );
      }
    } catch (error) {
      console.error("🚨 Lỗi trong handleNext:", error);
      alert(
        `Đã xảy ra lỗi khi gửi bài kiểm tra: ${
          error.message || "Lỗi không xác định"
        }`
      );
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
          checked={
            selectedItemIds.length === hateGroups.flatMap((c) => c.items).length
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
                    : "bg-gray-100 hover:bg-green-200"
                } transition`}
                onClick={() => toggleItemSelection(item.id)}
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
