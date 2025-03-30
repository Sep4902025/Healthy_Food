import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";

const UnderDisease = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  const [selectedItems, setSelectedItems] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalConditions = async () => {
      try {
        console.log("Token được sử dụng:", token);

        const response = await fetch(
          "http://localhost:8080/api/v1/medicalconditions",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch medical conditions: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Dữ liệu từ API medicalconditions:", data);

        // Xử lý dữ liệu: nếu API trả về mảng trực tiếp thì dùng luôn, nếu trả về object thì lấy data
        let conditions = data;
        if (!Array.isArray(data)) {
          if (data.data && Array.isArray(data.data)) {
            conditions = data.data; // Lấy mảng từ data.data nếu API trả về object
          } else {
            throw new Error("Dữ liệu trả về không phải là mảng");
          }
        }

        // Làm phẳng dữ liệu nếu là mảng lồng nhau
        if (
          Array.isArray(conditions) &&
          conditions.length > 0 &&
          Array.isArray(conditions[0])
        ) {
          conditions = conditions.flat();
        }

        if (conditions.length === 0) {
          setError("Không có bệnh nền nào để hiển thị.");
          setMedicalConditions([]);
        } else {
          const mappedData = conditions.map((condition) => ({
            id: condition._id,
            name: condition.name,
          }));
          setMedicalConditions(mappedData);
          console.log("Dữ liệu sau khi ánh xạ:", mappedData);
        }
      } catch (error) {
        console.error("Error fetching medical conditions:", error.message);
        setError(`Không thể tải danh sách bệnh nền: ${error.message}`);
        setMedicalConditions([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMedicalConditions();
    } else {
      setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
      setLoading(false);
    }

    const savedData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    if (savedData.underDisease) {
      const validObjectIds = savedData.underDisease.filter((id) =>
        /^[0-9a-fA-F]{24}$/.test(id)
      );
      setSelectedItems(validObjectIds);
    }
  }, [token]);

  useEffect(() => {
    console.log("State medicalConditions hiện tại:", medicalConditions);
  }, [medicalConditions]);

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) => {
      const noDiseaseId = medicalConditions.find(
        (d) => d.name === "Không mắc bệnh"
      )?.id;
      if (id === noDiseaseId) {
        return prev.includes(id) ? [] : [id];
      }
      const filtered = prev.filter((item) => item !== noDiseaseId);
      return filtered.includes(id)
        ? filtered.filter((item) => item !== id)
        : [...filtered, id];
    });
  };

  const isSelected = (id) => selectedItems.includes(id);

  const handleNext = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một lựa chọn.");
      return;
    }

    const currentData = JSON.parse(sessionStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, underDisease: selectedItems };
    sessionStorage.setItem("quizData", JSON.stringify(updatedData));
    console.log("Danh sách ID đã chọn (UnderDisease):", selectedItems);
    navigate("/survey/favorite");
  };

  // Hàm xử lý khi nhấn phím
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
          onClick={() => navigate("/survey/eathabit")}
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow hover:bg-gray-400 transition"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <ProgressBar progress={84} />
      </div>

      <h2 className="text-2xl font-bold text-center">Bệnh nền</h2>
      <p className="text-center text-gray-600">
        Hãy cho tôi biết về bệnh nền của bạn
      </p>

      {loading && (
        <div className="text-center text-gray-500 mt-4">
          Đang tải danh sách bệnh nền...
        </div>
      )}

      {error && !loading && (
        <div className="text-center text-red-500 mt-4">{error}</div>
      )}

      {!loading && !error && medicalConditions.length > 0 && (
        <div className="space-y-3 mt-4">
          {medicalConditions.map((condition) => (
            <div
              key={condition.id}
              className={`flex items-center p-3 border rounded-xl cursor-pointer ${
                isSelected(condition.id)
                  ? "bg-yellow-50 border-yellow-400"
                  : "bg-gray-100"
              }`}
              onClick={() => toggleItemSelection(condition.id)}
            >
              <input
                type="checkbox"
                checked={isSelected(condition.id)}
                onChange={() => toggleItemSelection(condition.id)}
                className="w-5 h-5 mr-3"
              />
              <span
                className={`font-medium ${
                  isSelected(condition.id) ? "text-yellow-700" : "text-gray-700"
                }`}
              >
                {condition.name}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleNext}
        className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-5"
      >
        Tiếp theo
      </button>
    </div>
  );
};

export default UnderDisease;
