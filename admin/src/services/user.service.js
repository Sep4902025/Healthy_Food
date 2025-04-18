import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000, // timeout sau 5 giây
});

// Thêm interceptor để xử lý lỗi và thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Có thể thêm redirect tới trang login ở đây
    }
    return Promise.reject(error);
  }
);

const UserService = {
  //Xóa tài khoản
  requestDeleteAccount: async (email) => {
    try {
      if (!email) {
        return {
          success: false,
          message: "Email is required!",
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: "Invalid email format!",
        };
      }

      const response = await axiosInstance.post("/users/request-delete-account", { email });

      const { success, message } = response.data;

      if (success) {
        console.log("requestDeleteAccount Response:", { message });

        return {
          success: true,
          message: message || "OTP has been sent to your email to confirm account deletion",
        };
      } else {
        return {
          success: false,
          message: message || "Unable to send account deletion request",
        };
      }
    } catch (error) {
      console.error(
        "Error sending account deletion request:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Error sending account deletion request",
        error: error.response?.status || 500,
      };
    }
  },

  confirmDeleteAccount: async (email, otp) => {
    try {
      if (!email || !otp) {
        return {
          success: false,
          message: "Email and OTP are required!",
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: "Invalid email format!",
        };
      }

      // Validate OTP format (4-digit number)
      const otpRegex = /^\d{4}$/;
      if (!otpRegex.test(otp)) {
        return {
          success: false,
          message: "Invalid OTP (must be 4 digits)!",
        };
      }

      const response = await axiosInstance.post("/users/confirm-delete-account", { email, otp });

      const { success, message } = response.data;

      if (success) {
        console.log("confirmDeleteAccount Response:", { message });

        // Remove token from localStorage after successful account deletion
        localStorage.removeItem("token");

        return {
          success: true,
          message: message || "Account has been successfully deleted",
        };
      } else {
        return {
          success: false,
          message: message || "Unable to delete account",
        };
      }
    } catch (error) {
      console.error("Error confirming account deletion:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Error confirming account deletion",
        error: error.response?.status || 500,
      };
    }
  },

  getForyou: async (userId, { page = 1, limit = 10, type = "" } = {}) => {
    try {
      if (!userId) {
        return {
          success: false,
          message: "userId là bắt buộc!",
        };
      }

      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(userId)) {
        return {
          success: false,
          message: "userId không hợp lệ (phải là ObjectId)!",
        };
      }

      const response = await axiosInstance.get(`/foryou/${userId}`, {
        params: {
          page,
          limit,
          type, // Không chuẩn hóa type
        },
      });

      const { success, message, data } = response.data;

      if (success) {
        console.log("getForyou Response:", {
          dishes: data.items,
          totalItems: data.totalItems,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          itemsPerPage: data.itemsPerPage,
        });

        return {
          success: true,
          message: message || "Danh sách món ăn được lấy thành công",
          dishes: data.items || [],
          totalItems: data.totalItems || 0,
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 0,
          itemsPerPage: data.itemsPerPage || limit,
        };
      } else {
        return {
          success: false,
          message: message || "Không thể lấy danh sách món ăn",
        };
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách món ăn đề xuất:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi lấy danh sách món ăn",
        error: error.response?.status || 500,
      };
    }
  },

  getForYouDishType: async () => {
    try {
      const response = await axiosInstance.get("/foryou/dish-types");

      const { success, message, data } = response.data;

      if (success) {
        console.log("getForYouDishType Response:", data);

        return {
          success: true,
          message: message || "Danh sách loại món ăn được lấy thành công",
          data: data || [],
        };
      } else {
        return {
          success: false,
          message: message || "Không thể lấy danh sách loại món ăn",
        };
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách loại món ăn:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi lấy danh sách loại món ăn",
        error: error.response?.status || 500,
      };
    }
  },
  getDishById: async (dishId) => {
    try {
      const response = await axios.get(`${API_URL}/dishes/${dishId}`);
      console.log("Fetched Dish:", response.data); // Debug API response
      return {
        success: true,
        data: response.data.data || {}, // Đảm bảo data luôn là object
      };
    } catch (error) {
      console.error("Error fetching dish:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Lỗi khi tải món ăn",
      };
    }
  },

  // Lấy tất cả người dùng (Admin only)
  getAllUsers: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/users?page=${page}&limit=${limit}`);
      return {
        success: true,
        users: response.data.data.users,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      };
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy danh sách người dùng",
      };
    }
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return {
        success: true,
        user: response.data.data.user,
      };
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy thông tin người dùng",
      };
    }
  },
  // Tìm kiếm người dùng theo email
  searchUserByEmail: async (email) => {
    try {
      const response = await axiosInstance.get(`/users/search?email=${email}`);
      return {
        success: true,
        users: response.data.data.users,
        total: response.data.results,
      };
    } catch (error) {
      console.error("Error searching users by email:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Unable to search users by email",
      };
    }
  },
  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get("/users/me");
      return {
        success: true,
        user: response.data.data.user,
      };
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy thông tin người dùng",
      };
    }
  },

  // 🔹 Cập nhật thông tin người dùng từ FE
  updateUser: async (id, data) => {
    if (!id || !data) {
      console.error("❌ Thiếu id hoặc dữ liệu để cập nhật user");
      return {
        success: false,
        message: "Thiếu id hoặc dữ liệu để cập nhật user",
      };
    }

    try {
      console.log(`📤 Cập nhật user ID: ${id}`, data);

      const response = await axios.put(`${API_URL}/users/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return {
        success: true,
        message: "Cập nhật thông tin thành công",
        user: response.data.data.user,
      };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật user:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || `Cập nhật thông tin thất bại: ${error.message}`,
      };
    }
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.patch("/users/update-me", userData);
      return {
        success: true,
        message: "Cập nhật thông tin thành công",
        user: response.data.data.user,
      };
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Cập nhật thông tin thất bại",
      };
    }
  },

  // Xóa user (Chỉ admin)
  deleteUser: async (userId) => {
    try {
      console.log("Sending delete request for userId:", userId); // Add this log
      await axiosInstance.delete(`/users/${userId}`);
      return {
        success: true,
        message: "Xóa người dùng thành công",
      };
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể xóa người dùng",
      };
    }
  },

  // Khôi phục user đã xóa mềm (Chỉ admin)
  restoreUser: async (userId) => {
    try {
      const response = await axiosInstance.patch(`/users/${userId}/restore`);
      return {
        success: true,
        message: "Khôi phục người dùng thành công",
        user: response.data.data.user,
      };
    } catch (error) {
      console.error("Lỗi khôi phục người dùng:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể khôi phục người dùng",
      };
    }
  },
  // Xóa tài khoản (deactivate)
  deactivateAccount: async () => {
    try {
      const response = await axiosInstance.delete("/users/delete-me");
      localStorage.removeItem("token");
      return {
        success: true,
        message: "Tài khoản đã được vô hiệu hóa",
      };
    } catch (error) {
      console.error("Lỗi vô hiệu hóa tài khoản:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể vô hiệu hóa tài khoản",
      };
    }
  },

  // Lấy lịch sử hoạt động
  getActivityHistory: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/users/activities?page=${page}&limit=${limit}`);
      return {
        success: true,
        activities: response.data.data.activities,
        totalPages: response.data.totalPages,
        currentPage: response.data.page,
      };
    } catch (error) {
      console.error("Lỗi lấy lịch sử hoạt động:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy lịch sử hoạt động",
      };
    }
  },

  // Cập nhật ảnh đại diện
  updateAvatar: async (fileData) => {
    try {
      const formData = new FormData();
      formData.append("avatar", fileData);

      const response = await axiosInstance.patch("/users/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        message: "Cập nhật ảnh đại diện thành công",
        avatarUrl: response.data.data.user.photo,
      };
    } catch (error) {
      console.error("Lỗi cập nhật ảnh đại diện:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Cập nhật ảnh đại diện thất bại",
      };
    }
  },

  // Lấy danh sách thông báo
  getNotifications: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/users/notifications?page=${page}&limit=${limit}`);
      return {
        success: true,
        notifications: response.data.data.notifications,
        totalPages: response.data.totalPages,
        currentPage: response.data.page,
      };
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy thông báo",
      };
    }
  },

  // Đánh dấu thông báo đã đọc
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.patch(`/users/notifications/${notificationId}`);
      return {
        success: true,
        message: "Đã đánh dấu thông báo là đã đọc",
      };
    } catch (error) {
      console.error("Lỗi đánh dấu thông báo:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể đánh dấu thông báo",
      };
    }
  },

  // Lấy các thiết lập của người dùng
  getUserSettings: async () => {
    try {
      const response = await axiosInstance.get("/users/settings");
      return {
        success: true,
        settings: response.data.data.settings,
      };
    } catch (error) {
      console.error("Lỗi lấy thiết lập người dùng:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy thiết lập người dùng",
      };
    }
  },

  // Cập nhật thiết lập người dùng
  updateUserSettings: async (settings) => {
    try {
      const response = await axiosInstance.patch("/users/settings", settings);
      return {
        success: true,
        message: "Cập nhật thiết lập thành công",
        settings: response.data.data.settings,
      };
    } catch (error) {
      console.error("Lỗi cập nhật thiết lập:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể cập nhật thiết lập",
      };
    }
  },

  // 📌 Nộp đơn xin trở thành Nutritionist
  submitNutritionistApplication: async (data) => {
    try {
      const response = await axiosInstance.post("/users/submit-nutritionist", data);
      return {
        success: true,
        message: "Đơn xin đã được gửi thành công",
        application: response.data.data.application,
      };
    } catch (error) {
      console.error("Lỗi gửi đơn xin Nutritionist:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể gửi đơn xin Nutritionist",
      };
    }
  },

  // 📌 Lấy danh sách người dùng chờ phê duyệt Nutritionist
  getPendingNutritionists: async () => {
    try {
      const response = await axiosInstance.get("/users/pending-nutritionists");
      console.log("PDN", response);

      return {
        success: true,
        users: response.data.data.users,
      };
    } catch (error) {
      console.error("Lỗi lấy danh sách chờ phê duyệt:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy danh sách chờ phê duyệt",
      };
    }
  },

  // 📌 Phê duyệt hoặc từ chối đơn xin Nutritionist
  reviewNutritionistApplication: async (data) => {
    try {
      const response = await axiosInstance.post("/users/review-nutritionist", data);
      return {
        success: true,
        message: "Xử lý đơn xin thành công",
        user: response.data.data.user,
      };
    } catch (error) {
      console.error("Lỗi xử lý đơn xin Nutritionist:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể xử lý đơn xin Nutritionist",
      };
    }
  },
};

// Hàm kiểm tra quyền admin
export const isAdmin = (userRole) => {
  return userRole === "admin";
};

// Hàm kiểm tra quyền truy cập các tính năng đặc biệt
export const hasSpecialAccess = (userRole) => {
  const specialRoles = ["admin", "nutritionist", "premium"];
  return specialRoles.includes(userRole);
};

export default UserService;
