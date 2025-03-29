import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const quizService = {
  submitQuizData: async () => {
    const finalData = JSON.parse(sessionStorage.getItem("finalData"));
    if (!finalData) {
      console.error("🚨 Không tìm thấy finalData trong sessionStorage");
      return {
        success: false,
        message: "Không tìm thấy dữ liệu bài kiểm tra trong sessionStorage",
      };
    }

    if (!finalData.userId || !finalData.email || !finalData.name) {
      console.error("🚨 finalData thiếu các trường bắt buộc:", finalData);
      return {
        success: false,
        message:
          "Dữ liệu gửi lên thiếu các trường bắt buộc: userId, email, name",
      };
    }

    try {
      console.log("🚀 Đang gửi dữ liệu bài kiểm tra:", finalData);
      const response = await axios.post(
        `${API_URL}/userpreference`,
        finalData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Phản hồi từ /userpreference:", response.data);

      if (!response.data.success) {
        console.error("🚨 API trả về success: false:", response.data);
        return {
          success: false,
          message:
            response.data.message || "Không thể gửi dữ liệu bài kiểm tra",
        };
      }

      if (!response.data.data || !response.data.data.user) {
        console.error(
          "🚨 Không có dữ liệu user trong phản hồi:",
          response.data
        );
        return {
          success: false,
          message: "Không có dữ liệu người dùng trả về từ API",
        };
      }

      sessionStorage.removeItem("finalData");
      sessionStorage.removeItem("quizData");

      return {
        success: true,
        message: response.data.message || "Gửi bài kiểm tra thành công",
        user: response.data.data.user,
        userPreference: response.data.data.userPreference, // Thêm userPreference để sử dụng nếu cần
      };
    } catch (error) {
      console.error("🚨 Lỗi trong submitQuizData:", error.message);
      console.error("🚨 Chi tiết lỗi:", error.response?.data || error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể gửi dữ liệu bài kiểm tra",
      };
    }
  },

  getUserPreferenceByUserPreferenceId: async (userPreferenceId) => {
    if (!userPreferenceId) {
      return {
        success: false,
        message: "userPreferenceId là bắt buộc để lấy sở thích người dùng",
      };
    }

    try {
      console.log(
        "🚀 Đang lấy sở thích người dùng với userPreferenceId:",
        userPreferenceId
      );
      const response = await axios.get(
        `${API_URL}/userpreference/${userPreferenceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Phản hồi từ /userPreference:", response.data);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy sở thích người dùng",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Lỗi trong getUserPreferenceByUserPreferenceId:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy sở thích người dùng",
      };
    }
  },

  deleteUserPreference: async (userPreferenceId) => {
    if (!userPreferenceId) {
      return {
        success: false,
        message: "userPreferenceId là bắt buộc để xóa sở thích người dùng",
      };
    }

    try {
      console.log(
        "🚀 Đang xóa sở thích người dùng với userPreferenceId:",
        userPreferenceId
      );
      const response = await axios.delete(
        `${API_URL}/userpreference/${userPreferenceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Phản hồi từ /userPreference delete:", response.data);

      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message || "Xóa sở thích người dùng thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa sở thích người dùng",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Lỗi trong deleteUserPreference:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể xóa sở thích người dùng",
      };
    }
  },

  updateUserPreference: async (userPreferenceId, updatedData) => {
    if (!userPreferenceId) {
      return {
        success: false,
        message: "userPreferenceId là bắt buộc để cập nhật sở thích người dùng",
      };
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return {
        success: false,
        message: "Dữ liệu cập nhật không được để trống",
      };
    }

    try {
      console.log(
        "🚀 Đang cập nhật sở thích người dùng với userPreferenceId:",
        userPreferenceId
      );
      console.log("🚀 Dữ liệu cập nhật:", updatedData);
      const response = await axios.put(
        `${API_URL}/userpreference/${userPreferenceId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Phản hồi từ /userpreference update:", response.data);

      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message || "Cập nhật sở thích người dùng thành công",
        };
      } else {
        return {
          success: false,
          message:
            response.data.message || "Không thể cập nhật sở thích người dùng",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Lỗi trong updateUserPreference:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật sở thích người dùng",
      };
    }
  },

  deleteUserByUserId: async (userId) => {
    if (!userId) {
      return {
        success: false,
        message: "userId là bắt buộc để xóa người dùng",
      };
    }

    try {
      console.log("🚀 Đang xóa người dùng với userId:", userId);
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("🚀 Phản hồi từ /user delete:", response.data);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || "Xóa người dùng thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa người dùng",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Lỗi trong deleteUserByUserId:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Không thể xóa người dùng",
      };
    }
  },
};

export default quizService;
