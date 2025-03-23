import React, { useState, useEffect } from "react";
import quizService from "../../services/quizService";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";

const UserProfileUpdate = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    height: "",
    weight: "",
    weightGoal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchUserPreference();
  }, [user]);

  const fetchUserPreference = async () => {
    if (!user || !user._id) {
      console.error("🚨 User hoặc user._id không tồn tại:", user);
      setError("Không tìm thấy thông tin người dùng.");
      setLoading(false);
      return;
    }

    if (!user.userPreferenceId) {
      console.warn("🚨 userPreferenceId không tồn tại trong user:", user);
      setError("Chưa có dữ liệu cá nhân. Vui lòng hoàn thành khảo sát trước.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await quizService.getUserPreferenceByUserPreferenceId(
        user.userPreferenceId
      );
      console.log("🚀 Kết quả từ API:", result);
      setLoading(false);

      if (result.success && result.data) {
        const { name, email, phoneNumber, height, weight, weightGoal } =
          result.data;
        setFormData({
          name: name || "",
          email: email || "",
          phoneNumber: phoneNumber || "",
          height: height || "",
          weight: weight || "",
          weightGoal: weightGoal || "",
        });
      } else {
        setError(result.message || "Không thể lấy dữ liệu cá nhân.");
      }
    } catch (error) {
      console.error("🚨 Lỗi trong fetchUserPreference:", error);
      setError("Đã xảy ra lỗi khi lấy dữ liệu: " + error.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!user.userPreferenceId) {
      setError("Không tìm thấy userPreferenceId để cập nhật!");
      setLoading(false);
      return;
    }

    const updatedData = {
      ...formData,
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      weightGoal: formData.weightGoal ? Number(formData.weightGoal) : undefined,
    };

    if (updatedData.weightGoal === undefined || isNaN(updatedData.weightGoal)) {
      setError("Mục tiêu cân nặng phải là một số hợp lệ!");
      setLoading(false);
      return;
    }

    try {
      const result = await quizService.updateUserPreference(
        user.userPreferenceId,
        updatedData
      );
      setLoading(false);

      if (result.success) {
        setSuccess("Cập nhật thông tin thành công!");
        window.scrollTo(0, 0);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi cập nhật: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Cập Nhật Thông Tin Cá Nhân
      </h2>

      {loading && (
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          <p className="font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="name"
            >
              Họ tên
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="form-group">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="form-group">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="phoneNumber"
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="form-group">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="height"
            >
              Chiều cao (cm)
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="form-group">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="weight"
            >
              Cân nặng (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="form-group">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="weightGoal"
            >
              Mục tiêu cân nặng (kg)
            </label>
            <input
              type="number"
              id="weightGoal"
              name="weightGoal"
              value={formData.weightGoal}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang cập nhật...
              </span>
            ) : (
              "Cập nhật"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileUpdate;
