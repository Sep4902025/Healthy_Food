import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

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
  // Lấy tất cả người dùng (Admin only)
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get("/users");
      return {
        success: true,
        users: response.data.data.users,
        total: response.data.results
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

  // Cập nhật thông tin người dùng theo ID (Admin hoặc chính user)
  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.patch(`/users/${userId}`, userData);
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

  // Xóa mềm user (Chỉ admin)
  deleteUser: async (userId) => {
    try {
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

  // Thay đổi mật khẩu
  changePassword: async (currentPassword, newPassword, passwordConfirm) => {
    try {
      const response = await axiosInstance.patch("/users/update-password", {
        passwordCurrent: currentPassword,
        password: newPassword,
        passwordConfirm,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return {
        success: true,
        message: "Thay đổi mật khẩu thành công",
        token: response.data.token,
      };
    } catch (error) {
      console.error("Lỗi thay đổi mật khẩu:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Thay đổi mật khẩu thất bại",
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