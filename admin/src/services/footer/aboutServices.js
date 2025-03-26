import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const aboutService = {
  getAboutUs: async (page = 1, limit = 5) => {
    try {
      const response = await axios.get(`${API_URL}/footer/about`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: { page, limit }, // Truyền page và limit vào query params
      });

      return {
        success: true,
        data: response.data || {},
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Lỗi khi tải dữ liệu",
      };
    }
  },

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
