import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // Chỉ giữ nguyên API_URL

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const aboutService = {
  // Lấy danh sách About Us
  getAboutUs: async () => {
    try {
      const response = await axios.get(`${API_URL}/footer/about`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Lỗi khi tải dữ liệu",
      };
    }
  },

  // Tạo mới About Us
  createAboutUs: async (data) => {
    try {
      await axios.post(`${API_URL}/footer/about`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Thêm mới thất bại!",
      };
    }
  },

  // Cập nhật About Us
  updateAboutUs: async (id, data) => {
    try {
      await axios.put(`${API_URL}/footer/about/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: "Cập nhật thất bại!",
      };
    }
  },

  // Xóa vĩnh viễn About Us
  hardDeleteAboutUs: async (id) => {
    try {
      await axios.delete(`${API_URL}/footer/about/hard/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Xóa vĩnh viễn thất bại!",
      };
    }
  },
};

export default aboutService;
