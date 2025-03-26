import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const contactServices = {
  createContact: async (data) => {
    try {
      await axios.post(`${API_URL}/footer/contact`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Gửi liên hệ thất bại!",
      };
    }
  },

  updateContact: async (id, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/footer/contact/${id}`,
        updateData,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Lỗi cập nhật contact:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Lỗi không xác định khi cập nhật contact.",
      };
    }
  },

  getContacts: async (page = 1, limit = 5) => {
    try {
      const response = await axios.get(`${API_URL}/footer/contact`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: { page, limit }, // Truyền page và limit vào query params
      });
      return { success: true, data: response.data || {} };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Lỗi khi tải danh sách liên hệ.",
      };
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/footer/contact/hard/${id}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Lỗi khi gọi API xóa liên hệ:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Lỗi không xác định khi xóa liên hệ.",
      };
    }
  },
};

export default contactServices;
