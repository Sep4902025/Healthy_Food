import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // Chỉ giữ nguyên API_URL

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const aboutService = {
  // Lấy danh sách About Us với phân trang
  getAboutUs: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/footer/about`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
        },
      });

      return {
        success: true,
        data: response.data.data || { items: [], total: 0, currentPage: page, totalPages: 1 },
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi tải dữ liệu",
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
        message: error.response?.data?.message || "Cập nhật thất bại!",
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