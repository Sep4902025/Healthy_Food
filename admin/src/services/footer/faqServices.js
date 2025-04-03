import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const faqServices = {
  getFAQs: async (page = 1, limit = 5) => {
    try {
      const response = await axios.get(`${API_URL}/footer/faqs`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          sort: "createdAt", // Thêm tham số sắp xếp
          order: "desc", // Thứ tự giảm dần
        }, // Truyền page, limit, sort, và order vào query params
      });
  
      console.log("🔍 FAQs từ API:", response.data);
      return { success: true, data: response.data || {} };
    } catch (error) {
      console.error("❌ Lỗi khi lấy FAQs:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi tải FAQs",
      };
    }
  },

  createFAQ: async (data) => {
    try {
      console.log("📤 Dữ liệu gửi lên API:", data);
      const response = await axios.post(`${API_URL}/footer/faqs`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi tạo FAQ:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Thêm mới thất bại!",
      };
    }
  },

  updateFAQ: async (id, data) => {
    try {
      console.log(`📤 Cập nhật FAQ ID: ${id}`, data);
      await axios.put(`${API_URL}/footer/faqs/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật FAQ:", error.response?.data || error.message);
      return { success: false, message: "Cập nhật thất bại!" };
    }
  },

  hardDeleteFAQ: async (id) => {
    try {
      console.log(`🗑️ Xóa vĩnh viễn FAQ ID: ${id}`);
      await axios.delete(`${API_URL}/footer/faqs/hard/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa FAQ:", error.response?.data || error.message);
      return { success: false, message: "Xóa vĩnh viễn thất bại!" };
    }
  },
};

export default faqServices;
