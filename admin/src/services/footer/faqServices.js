import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// 🛠️ Hàm lấy token từ localStorage để gửi kèm trong headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const faqServices = {
  // 🔹 Lấy danh sách FAQs
  getFAQs: async () => {
    try {
      const response = await axios.get(`${API_URL}/footer/faqs`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      console.log("🔍 FAQs từ API:", response.data);

      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy FAQs:", error.response?.data || error.message);

      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi tải FAQs",
      };
    }
  },

  // 🔹 Tạo mới FAQ
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

  // 🔹 Cập nhật FAQ
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

  // 🔹 Xóa vĩnh viễn FAQ
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
