import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const dishesService = {
  // 🔹 Lấy tất cả món ăn
  getAllDishes: async () => {
    try {
      const response = await axios.get(`${API_URL}/dishes`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("🔍 Danh sách món ăn từ API:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy món ăn:", error.response?.data || error.message);
      return { success: false, message: "Lỗi khi tải danh sách món ăn" };
    }
  },

  // 🔹 Thêm món ăn mới
  createDish: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/dishes`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn:", error.response?.data || error.message);
      return { success: false, message: "Thêm món ăn thất bại!" };
    }
  },

  // 🔹 Cập nhật món ăn
  updateDish: async (id, data) => {
    try {
      console.log(`📤 Cập nhật món ăn ID: ${id}`, data);

      await axios.put(`${API_URL}/dishes/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật món ăn:", error.response?.data || error.message);
      return { success: false, message: "Cập nhật món ăn thất bại!" };
    }
  },

  // 🔹 Xóa mềm món ăn
  deleteDish: async (id) => {
    try {
      console.log(`🗑️ Xóa mềm món ăn ID: ${id}`);

      await axios.delete(`${API_URL}/dishes/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa món ăn:", error.response?.data || error.message);
      return { success: false, message: "Xóa món ăn thất bại!" };
    }
  },

  // 🔹 Xóa vĩnh viễn món ăn
  hardDeleteDish: async (id) => {
    try {
      console.log(`🗑️ Xóa vĩnh viễn món ăn ID: ${id}`);

      await axios.delete(`${API_URL}/dishes/hard/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa vĩnh viễn món ăn:", error.response?.data || error.message);
      return { success: false, message: "Xóa vĩnh viễn món ăn thất bại!" };
    }
  },
};

export default dishesService;
