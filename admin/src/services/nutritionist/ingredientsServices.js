import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ingredientsService = {
  // 🔹 Lấy tất cả nguyên liệu với phân trang và lọc
  getAllIngredients: async (page = 1, limit = 10, type = "all", search = "") => {
    try {
      const response = await axios.get(`${API_URL}/ingredients`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          type, // Lọc theo loại nguyên liệu
          search, // Tìm kiếm theo tên
        },
      });
      console.log("📌 Danh sách nguyên liệu:", response.data);
      return {
        success: true,
        data: {
          items: response.data.data.items || [],
          total: response.data.data.total || 0,
          currentPage: response.data.data.currentPage || page,
          totalPages: response.data.data.totalPages || 1,
        },
      };
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Lỗi khi tải danh sách nguyên liệu" };
    }
  },

  // 🔹 Lấy nguyên liệu theo ID
  getIngredientById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/ingredients/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Nguyên liệu ID ${id}:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Không tìm thấy nguyên liệu!" };
    }
  },

  // 🔹 Thêm nguyên liệu mới
  createIngredient: async (data) => {
    try {
      console.log("📤 Gửi dữ liệu tạo nguyên liệu:", data);
      const response = await axios.post(`${API_URL}/ingredients`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi thêm nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Thêm nguyên liệu thất bại!" };
    }
  },

  // 🔹 Cập nhật nguyên liệu
  updateIngredient: async (id, data) => {
    try {
      console.log(`✏️ Cập nhật nguyên liệu ID ${id}:`, data);
      await axios.put(`${API_URL}/ingredients/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Cập nhật nguyên liệu thất bại!" };
    }
  },

  // 🔹 Xóa mềm nguyên liệu
  deleteIngredient: async (id) => {
    try {
      console.log(`🗑 Xóa mềm nguyên liệu ID: ${id}`);
      await axios.delete(`${API_URL}/ingredients/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa mềm nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Xóa mềm nguyên liệu thất bại!" };
    }
  },

  // 🔹 Xóa vĩnh viễn nguyên liệu
  hardDeleteIngredient: async (id) => {
    try {
      console.log(`🗑 Xóa vĩnh viễn nguyên liệu ID: ${id}`);
      await axios.delete(`${API_URL}/ingredients/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa vĩnh viễn nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Xóa vĩnh viễn nguyên liệu thất bại!" };
    }
  },
};

export default ingredientsService;