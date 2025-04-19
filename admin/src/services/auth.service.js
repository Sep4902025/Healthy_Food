import axios from "axios";
import api from "./api";
const API_URL = process.env.REACT_APP_API_URL;

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000, // timeout sau 5 giây
});

// Thêm interceptor để xử lý lỗi
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

  googleAuth: async (token) => {
    try {
      const response = await axiosInstance.post("/users/login-google", {
        idToken: token,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Lỗi Google Auth:", error);
      throw error;
    }
  },

  signup: async (data) => {
    try {
      console.log("Sending signup request:", data);
      const response = await axiosInstance.post("/users/signup", data);
      console.log("Signup response:", response.data);

      // Kiểm tra response
      if (response.data) {
        // Đảm bảo trả về đúng format
        return {
          success: true,
          message: response.data.message || "Đăng ký thành công",
          data: response.data,
        };
      }

      return {
        success: false,
        message: "Không nhận được phản hồi từ server",
      };
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại");
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await axiosInstance.post("/users/verify", {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  resendOTP: async (email) => {
    try {
      const response = await axiosInstance.post("/users/resend-otp", { email });
      return response.data;
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error.response?.data?.message || error.message);
      throw error;
    }
  },
  verifyOtpForSignUp: async ({ email, otp }) => {
    try {
      const data = { email, otp };
      const response = await axiosInstance.post("/users/verify-otp", data);
      return response;
    } catch (error) {
      console.log("verifyOtp error: ", error);
      return error;
    }
  },

  requestOtpForSignUp: async ({ email }) => {
    try {
      const data = { email };
      const response = await axiosInstance.post("/users/request-otp", data);
      return response;
    } catch (error) {
      console.log("requestOtp error: ", error);
      return error;
    }
  },
  login: async (credentials) => {
    try {
      console.log("Sending login request:", credentials);
      const response = await axiosInstance.post("/users/login", credentials);
      console.log("Raw API response:", response.data);

      if (response.data) {
        // Lưu token vào localStorage
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        // Format lại dữ liệu
        return {
          success: true,
          message: response.data.message || "Đăng nhập thành công",
          token: response.data.token,
          user: response.data.data.user, // Truy cập trực tiếp vào user data
        };
      }

      return {
        success: false,
        message: "Không nhận được phản hồi từ server",
      };
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại",
      };
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post(
        "/users/logout",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      localStorage.removeItem("token");
      return response.data;
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      throw error;
    }
  },

  changePassword: async ({ currentPassword, newPassword, newPasswordConfirm }) => {
    // Kiểm tra đầu vào
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return {
        success: false,
        message: "All fields are required",
      };
    }

    if (newPassword !== newPasswordConfirm) {
      return {
        success: false,
        message: "New password and confirmation do not match",
      };
    }

    try {
      const response = await api.post("users/change-password", {
        // Thay PATCH thành POST để khớp BE
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return {
        success: true,
        message: response.data.message || "Password changed successfully",
        token: response.data.token || null, // Trả về null nếu không có token
      };
    } catch (error) {
      console.error("Password change error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to change password",
      };
    }
  },

  forgetPassword: async (email) => {
    try {
      const response = await axiosInstance.post("/users/forget-password", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      throw error;
    }
  },

  // Hàm mới: getUpdatedUser
  getUpdatedUser: async () => {
    try {
      const response = await axiosInstance.get("/users/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Get updated user response:", response.data);

      if (response.data) {
        return {
          success: true,
          message: response.data.message || "Lấy thông tin user thành công",
          user: response.data.data?.user || response.data.user, // Linh hoạt với format trả về
        };
      }

      return {
        success: false,
        message: "Không nhận được phản hồi từ server",
      };
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lấy thông tin user thất bại",
      };
    }
  },
};

const CHAT_ALLOWED_ROLES = ["user", "nutritionist"];

export const canAccessChat = (userRole) => {
  return CHAT_ALLOWED_ROLES.includes(userRole);
};

export default AuthService;
