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
  FaKey,
} from "react-icons/fa";
import quizService from "../../../../services/quizService";
import { selectUser } from "../../../../store/selectors/authSelectors";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

const AuthService = {
  resetPassword: async (email, password, passwordConfirm) => {
    try {
      const response = await axiosInstance.post("/users/reset-password", {
        email,
        password,
        passwordConfirm,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi reset mật khẩu:", error);
      throw error;
    }
  },
};

const UserProfile = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [passwordResetInProgress, setPasswordResetInProgress] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const fetchUserData = async () => {
    if (!user || !user._id) {
      console.error("🚨 User hoặc user._id không tồn tại:", user);
      setLoading(false);
      return;
    }
    if (!user.userPreferenceId) {
      console.warn("🚨 userPreferenceId không tồn tại trong user:", user);
      setUserData(null);
      setLoading(false);
      return;
    }
    try {
      const { success, data, message } =
        await quizService.getUserPreferenceByUserPreferenceId(
          user.userPreferenceId
        );
      if (success) {
        setUserData(data);
      } else {
        console.error("🚨 Lỗi khi lấy dữ liệu userPreference:", message);
        setUserData(null);
      }
    } catch (error) {
      console.error("🚨 Lỗi trong fetchUserData:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  const handleEditClick = () => {
    navigate(`/edit-profile/${user._id}`, { state: { user } });
  };

  const handleReset = async () => {
    if (!user || !user.userPreferenceId) {
      alert("Không tìm thấy userPreferenceId để xóa!");
      return;
    }
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
      console.error("🚨 Reset error:", error);
    } finally {
      setResetInProgress(false);
    }
  };

  const handleResetPassword = async () => {
    if (
      !passwordData.email ||
      !passwordData.password ||
      !passwordData.passwordConfirm
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (passwordData.password !== passwordData.passwordConfirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      setPasswordResetInProgress(true);
      const result = await AuthService.resetPassword(
        passwordData.email,
        passwordData.password,
        passwordData.passwordConfirm
      );
      if (result.success) {
        alert("Đổi mật khẩu thành công!");
        setShowPasswordReset(false);
        setPasswordData({ email: "", password: "", passwordConfirm: "" });
      } else {
        alert(`Lỗi: ${result.message || "Không thể đổi mật khẩu"}`);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi đổi mật khẩu!");
      console.error("🚨 Password reset error:", error);
    } finally {
      setPasswordResetInProgress(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !user._id) {
      alert("Không tìm thấy thông tin người dùng để xóa!");
      return;
    }
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác và bạn sẽ bị đăng xuất!"
    );
    if (!confirmDelete) return;
    try {
      setDeleteInProgress(true);
      const { success, message } = await quizService.deleteUserByUserId(
        user._id
      );
      if (success) {
        alert("Tài khoản đã được xóa thành công!");
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        alert(`Lỗi khi xóa tài khoản: ${message}`);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi xóa tài khoản!");
      console.error("🚨 Delete user error:", error);
    } finally {
      setDeleteInProgress(false);
    }
  };

  const calculateBMI = () => {
    if (userData) {
      const weight = parseFloat(userData.weight);
      const heightCm = parseFloat(userData.height);
      if (!weight || !heightCm || weight <= 0 || heightCm <= 0)
        return "No data";
      const heightM = heightCm / 100;
      return (weight / (heightM * heightM)).toFixed(2);
    }
    return "No data";
  };

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi))
      return {
        text: "Không có dữ liệu",
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
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
      className={`${colorClass} p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2 text-gray-600">{icon}</span>}
        <p className="font-medium text-gray-600">{label}</p>
      </div>
      <p className={`text-lg font-semibold ${textClass}`}>{value || "N/A"}</p>
    </div>
  );

  const SectionTitle = ({ title, icon }) => (
    <div className="flex items-center space-x-2 mb-6 border-b border-gray-200 pb-2">
      {icon}
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-gray-700">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-1/4 w-full">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
            <div className="space-y-4">
              <button
                onClick={handleEditClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
              >
                <FaEdit /> Chỉnh sửa hồ sơ
              </button>
              <button
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md"
              >
                <FaKey /> Đổi mật khẩu
              </button>
              <button
                onClick={handleReset}
                disabled={resetInProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md disabled:bg-red-300"
              >
                {resetInProgress ? "Đang xóa..." : "Xóa dữ liệu cá nhân"}
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteInProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 shadow-md disabled:bg-red-400"
              >
                {deleteInProgress ? "Đang xóa..." : "Xóa tài khoản"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4 w-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-lg">
                      {user.username ? user.username[0].toUpperCase() : "?"}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2 rounded-full shadow-md hover:bg-indigo-100 transition-all duration-300">
                    <FaUpload />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {userData?.name || user.username || "Người dùng"}
                  </h1>
                  <p className="text-indigo-100 mt-1">
                    {userData?.email || user.email || "Chưa có email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Body Measurements */}
              <SectionTitle
                title="Chỉ số cơ thể"
                icon={<FaCalculator className="text-indigo-600" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <FaWeight className="text-blue-500 text-2xl" />
                  <div>
                    <p className="text-gray-600">Cân nặng</p>
                    <p className="text-xl font-semibold text-blue-700">
                      {userData?.weight || "?"}{" "}
                      <span className="text-sm">kg</span>
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <FaRuler className="text-green-500 text-2xl" />
                  <div>
                    <p className="text-gray-600">Chiều cao</p>
                    <p className="text-xl font-semibold text-green-700">
                      {userData?.height || "?"}{" "}
                      <span className="text-sm">cm</span>
                    </p>
                  </div>
                </div>
                <div
                  className={`${
                    getBMIStatus().bg
                  } p-4 rounded-lg shadow-sm flex items-center gap-3`}
                >
                  <FaCalculator className="text-gray-600 text-2xl" />
                  <div>
                    <p className="text-gray-600">BMI</p>
                    <p
                      className={`text-xl font-semibold ${
                        getBMIStatus().color
                      }`}
                    >
                      {calculateBMI()} - {getBMIStatus().text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              {userData ? (
                <>
                  <SectionTitle
                    title="Thông tin cá nhân"
                    icon={<FaUser className="text-indigo-600" />}
                  />
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Thông tin cơ bản
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoItem
                          label="Tuổi"
                          value={userData.age}
                          colorClass="bg-blue-50"
                          textClass="text-blue-700"
                        />
                        <InfoItem
                          label="Giới tính"
                          value={userData.gender}
                          colorClass="bg-purple-50"
                          textClass="text-purple-700"
                        />
                        <InfoItem
                          label="Số điện thoại"
                          value={userData.phoneNumber}
                          colorClass="bg-indigo-50"
                          textClass="text-indigo-700"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Mục tiêu dinh dưỡng
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem
                          label="Mục tiêu"
                          value={userData.goal}
                          colorClass="bg-green-50"
                          textClass="text-green-700"
                        />
                        <InfoItem
                          label="Thời hạn kế hoạch"
                          value={userData.longOfPlan}
                          colorClass="bg-teal-50"
                          textClass="text-teal-700"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Sở thích ăn uống
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem
                          label="Chế độ ăn"
                          value={userData.diet}
                          colorClass="bg-amber-50"
                          textClass="text-amber-700"
                        />
                        <InfoItem
                          label="Thói quen ăn uống"
                          value={userData.eatHabit?.join(", ")}
                          colorClass="bg-orange-50"
                          textClass="text-orange-700"
                        />
                        <InfoItem
                          label="Thực phẩm ưa thích"
                          value={userData.favorite?.join(", ")}
                          colorClass="bg-yellow-50"
                          textClass="text-yellow-700"
                        />
                        <InfoItem
                          label="Dị ứng thực phẩm"
                          value={userData.hate?.join(", ")}
                          colorClass="bg-red-50"
                          textClass="text-red-700"
                        />
                        <InfoItem
                          label="Số bữa ăn/ngày"
                          value={userData.mealNumber}
                          colorClass="bg-amber-50"
                          textClass="text-amber-700"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Chỉ số sức khỏe
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InfoItem
                          label="Thời gian ngủ"
                          value={userData.sleepTime}
                          colorClass="bg-purple-50"
                          textClass="text-purple-700"
                        />
                        <InfoItem
                          label="Lượng nước (L)"
                          value={userData.waterDrink}
                          colorClass="bg-blue-50"
                          textClass="text-blue-700"
                        />
                        <InfoItem
                          label="Bệnh nền"
                          value={userData.underDisease || "Không có"}
                          colorClass="bg-pink-50"
                          textClass="text-pink-700"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Chưa có dữ liệu cá nhân</p>
                  <button
                    onClick={handleEditClick}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
                  >
                    Nhập thông tin ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Đổi mật khẩu
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={passwordData.email}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={passwordData.passwordConfirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      passwordConfirm: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Xác nhận mật khẩu"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordReset(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={passwordResetInProgress}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-300"
                >
                  {passwordResetInProgress ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
