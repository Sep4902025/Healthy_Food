import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const termService = {
  getTerms: async (page = 1, limit = 5) => {
    try {
      const response = await axios.get(`${API_URL}/footer/terms`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: { page, limit }, // Truyền page và limit vào query params
      });
      console.log("🔍 Terms từ API:", response.data);
      return { success: true, data: response.data || {} };
    } catch (error) {
      console.error(
        "❌ Lỗi khi lấy Terms:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi tải Terms",
      };
    }
  },

  createTerm: async (data) => {
    try {
      console.log("📤 Dữ liệu gửi lên API:", data);
      const response = await axios.post(`${API_URL}/footer/terms`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error(
        "❌ Lỗi khi tạo Term:",
        error.response?.data || error.message
      );
      return { success: false, message: "Thêm mới thất bại!" };
    }
  },

  updateTerm: async (id, data) => {
    try {
      console.log(`📤 Cập nhật Term ID: ${id}`, data);
      await axios.put(`${API_URL}/footer/terms/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error(
        "❌ Lỗi khi cập nhật Term:",
        error.response?.data || error.message
      );
      return { success: false, message: "Cập nhật thất bại!" };
    }
  },

  hardDeleteTerm: async (id) => {
    try {
      console.log(`🗑️ Xóa vĩnh viễn Term ID: ${id}`);
      await axios.delete(`${API_URL}/footer/terms/hard/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error(
        "❌ Lỗi khi xóa Term:",
        error.response?.data || error.message
      );
      return { success: false, message: "Xóa vĩnh viễn thất bại!" };
    }
  },
};

export default termService;
