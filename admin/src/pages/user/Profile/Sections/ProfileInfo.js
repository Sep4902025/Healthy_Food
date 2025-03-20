import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaUser,
  FaEdit,
  FaUpload,
  FaWeight,
  FaRuler,
  FaCalculator,
} from "react-icons/fa";
import quizService from "../../../../services/quizService";
import { selectUser } from "../../../../store/selectors/authSelectors";

const UserProfile = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [userData, setUserData] = useState(null);
  const [resetInProgress, setResetInProgress] = useState(false);

  const fetchUserData = async () => {
    if (user && user._id) {
      const { success, data, message } = await quizService.getUserPreference(
        user._id
      );
      if (success) {
        setUserData(data);
      } else {
        console.error(message);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
  }, [user, navigate]);

  const handleEditClick = () => {
    navigate(`/edituser/${user._id}`, { state: { user } });
  };

  const handleReset = async () => {
    if (!user || !user._id) return;

    const confirmReset = window.confirm(
      "Bạn có chắc chắn muốn xóa tất cả thông tin cá nhân? Hành động này không thể hoàn tác."
    );

    if (!confirmReset) return;

    try {
      setResetInProgress(true);
      const { success, message } = await quizService.deleteUserPreference(
        user.userPreferenceId
      );
      if (success) {
        alert("Đã xóa thông tin thành công");
        setUserData(null);
        fetchUserData();
      } else {
        alert(`Lỗi khi xóa: ${message}`);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi xóa dữ liệu");
      console.error("Reset error:", error);
    } finally {
      setResetInProgress(false);
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (userData?.data) {
      const weight = parseFloat(userData.data.weight);
      const heightCm = parseFloat(userData.data.height);

      // Kiểm tra nếu weight hoặc height không hợp lệ (null, undefined, NaN, <= 0)
      if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
        return "No data";
      }

      const heightM = heightCm / 100; // Chuyển cm → m
      return (weight / (heightM * heightM)).toFixed(2);
    }
    return "No data";
  };

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI());

    if (bmi < 18)
      return { text: "Thiếu cân", color: "text-blue-600", bg: "bg-blue-100" };
    if (bmi < 30)
      return {
        text: "Bình thường",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (bmi < 40)
      return {
        text: "Thừa cân",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };

    return { text: "Béo phì", color: "text-red-600", bg: "bg-red-100" };
  };

  const InfoItem = ({
    label,
    value,
    icon,
    colorClass = "bg-gray-50",
    textClass = "text-gray-700",
  }) => (
    <div
      className={`${colorClass} p-4 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2 text-gray-600">{icon}</span>}
        <p className="font-medium text-gray-600">{label}</p>
      </div>
      <p className={`text-lg font-semibold ${textClass}`}>{value || "N/A"}</p>
    </div>
  );

  const SectionTitle = ({ title, icon }) => (
    <div className="flex items-center space-x-2 mb-4 border-b border-gray-200 pb-2">
      {icon}
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="p-8 rounded-lg bg-white shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl text-gray-700">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 inline-block px-6 py-2 bg-white rounded-full shadow-md">
            HỒ SƠ CÁ NHÂN
          </h1>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto mb-8 border border-gray-100">
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-8">
                {user.avatar_url ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-lg mb-4">
                    <span>
                      {user.username
                        ? user.username.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>
                )}
                <button className="px-4 py-2 bg-white text-indigo-600 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 shadow-md hover:bg-indigo-50">
                  <FaUpload className="h-4 w-4" />
                  Tải ảnh lên
                </button>
              </div>

              {/* User Info Section */}
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">
                  {userData?.data?.name || user.username || "Người dùng"}
                </h2>
                <p className="text-indigo-100 mb-4">
                  {userData?.data?.email || "No email"}
                </p>
                <button
                  className="px-6 py-2 bg-white text-indigo-600 rounded-full shadow-md transition-all duration-300 font-bold hover:bg-opacity-90 transform hover:scale-105"
                  onClick={handleEditClick}
                >
                  <FaEdit className="inline mr-2" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>
          </div>

          {/* Body Measurements Card */}
          <div className="p-6">
            <SectionTitle
              title="Chỉ số cơ thể"
              icon={<FaCalculator className="text-indigo-600 text-xl" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm flex flex-col items-center md:items-start">
                <div className="flex items-center mb-3">
                  <FaWeight className="text-blue-500 mr-2 text-xl" />
                  <span className="text-gray-600 font-medium">Cân nặng</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 flex items-baseline">
                  {userData?.data?.weight || "?"}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    kg
                  </span>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-100 shadow-sm flex flex-col items-center md:items-start">
                <div className="flex items-center mb-3">
                  <FaRuler className="text-green-500 mr-2 text-xl" />
                  <span className="text-gray-600 font-medium">Chiều cao</span>
                </div>
                <div className="text-3xl font-bold text-green-600 flex items-baseline">
                  {userData?.data?.height || "?"}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    cm
                  </span>
                </div>
              </div>

              <div
                className={`${
                  getBMIStatus().bg
                } rounded-xl p-6 border border-${getBMIStatus().color.replace(
                  "text-",
                  ""
                )} shadow-sm flex flex-col items-center md:items-start`}
              >
                <div className="flex items-center mb-3">
                  <FaCalculator className="text-gray-600 mr-2 text-xl" />
                  <span className="text-gray-600 font-medium">BMI</span>
                </div>
                <div className="flex flex-col">
                  <div className={`text-3xl font-bold ${getBMIStatus().color}`}>
                    {calculateBMI() || "?"}
                  </div>
                  <div className={`text-sm ${getBMIStatus().color}`}>
                    {getBMIStatus().text}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details Section */}
            {userData?.data ? (
              <div className="mt-8">
                <SectionTitle
                  title="Thông tin cá nhân"
                  icon={<FaUser className="text-indigo-600 text-xl" />}
                />

                {/* Basic Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-l-4 border-indigo-500 pl-3">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoItem
                      label="Tuổi"
                      value={userData?.data?.age || "Chưa có dữ liệu"}
                      colorClass="bg-blue-50"
                      textClass="text-blue-700"
                    />
                    <InfoItem
                      label="Giới tính"
                      value={userData?.data?.gender || "Chưa có dữ liệu"}
                      colorClass="bg-purple-50"
                      textClass="text-purple-700"
                    />
                    <InfoItem
                      label="Số điện thoại"
                      value={userData?.data?.phoneNumber || "Chưa có dữ liệu"}
                      colorClass="bg-indigo-50"
                      textClass="text-indigo-700"
                    />
                  </div>
                </div>

                {/* Diet Goals */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-l-4 border-green-500 pl-3">
                    Mục tiêu dinh dưỡng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      label="Mục tiêu"
                      value={userData?.data?.goal || "Chưa có dữ liệu"}
                      colorClass="bg-green-50"
                      textClass="text-green-700"
                    />
                    <InfoItem
                      label="Thời hạn kế hoạch"
                      value={userData?.data?.longOfPlan || "Chưa có dữ liệu"}
                      colorClass="bg-teal-50"
                      textClass="text-teal-700"
                    />
                  </div>
                </div>

                {/* Diet Preferences */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-l-4 border-amber-500 pl-3">
                    Sở thích ăn uống
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      label="Chế độ ăn"
                      value={userData?.data?.diet || "Chưa có dữ liệu"}
                      colorClass="bg-amber-50"
                      textClass="text-amber-700"
                    />
                    <InfoItem
                      label="Thói quen ăn uống"
                      value={
                        userData?.data?.eatHabit?.join(", ") ||
                        "Chưa có dữ liệu"
                      }
                      colorClass="bg-orange-50"
                      textClass="text-orange-700"
                    />
                    <InfoItem
                      label="Thực phẩm ưa thích"
                      value={
                        userData?.data?.favorite?.join(", ") ||
                        "Chưa có dữ liệu"
                      }
                      colorClass="bg-yellow-50"
                      textClass="text-yellow-700"
                    />
                    <InfoItem
                      label="Dị ứng thực phẩm"
                      value={
                        userData?.data?.hate?.join(", ") || "Chưa có dữ liệu"
                      }
                      colorClass="bg-red-50"
                      textClass="text-red-700"
                    />
                    <InfoItem
                      label="Số bữa ăn mỗi ngày"
                      value={userData?.data?.mealNumber || "Chưa có dữ liệu"}
                      colorClass="bg-amber-50"
                      textClass="text-amber-700"
                    />
                  </div>
                </div>

                {/* Health Metrics */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-l-4 border-purple-500 pl-3">
                    Chỉ số sức khỏe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoItem
                      label="Thời gian ngủ"
                      value={userData?.data?.sleepTime || "Chưa có dữ liệu"}
                      colorClass="bg-purple-50"
                      textClass="text-purple-700"
                    />
                    <InfoItem
                      label="Lượng nước uống (L)"
                      value={userData?.data?.waterDrink || "Chưa có dữ liệu"}
                      colorClass="bg-blue-50"
                      textClass="text-blue-700"
                    />
                    <InfoItem
                      label="Bệnh nền"
                      value={userData?.data?.underDisease || "Không có"}
                      colorClass="bg-pink-50"
                      textClass="text-pink-700"
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-md font-medium transform hover:scale-105 disabled:transform-none"
                    onClick={handleReset}
                    disabled={resetInProgress}
                  >
                    {resetInProgress ? "Đang xóa..." : "Xóa dữ liệu cá nhân"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg shadow-inner border border-gray-200 mt-8">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FaUser className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-600 text-lg mb-4">
                    Chưa có dữ liệu cá nhân
                  </p>
                  <button
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md font-medium"
                    onClick={handleEditClick}
                  >
                    Nhập thông tin ngay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
