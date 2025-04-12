import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const recipesService = {
  // 🔹 Lấy tất cả công thức với phân trang
  getAllRecipes: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`${API_URL}/recipes`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: { page, limit, search },
      });
      console.log("📌 Danh sách công thức:", response.data);
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
      console.error("❌ Lỗi khi tải danh sách công thức:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy danh sách công thức." };
    }
  },

  // 🔹 Lấy công thức theo `recipeId` (không cần phân trang ở đây)
  getRecipesByDishId: async (recipeId) => {
    try {
      const response = await axios.get(`${API_URL}/recipes/dish/${recipeId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Công thức với recipeId ${recipeId}:`, response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi tải công thức theo recipeId:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy công thức." };
    }
  },

  // 🔹 Lấy công thức theo `dishId` và `recipeId`
  getRecipeById: async (dishId, recipeId) => {
    try {
      const url = `${API_URL}/recipes/${dishId}/${recipeId}`;
      console.log(`📡 Gọi API tới: ${url}`);
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Công thức ID ${recipeId}:`, response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy công thức:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy công thức.",
      };
    }
  },

  // 🔹 Tạo công thức mới
  createRecipe: async (dishId, data) => {
    try {
      console.log("📤 Gửi dữ liệu tạo công thức:", data);
      const response = await axios.post(`${API_URL}/recipes/${dishId}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi thêm công thức:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Thêm công thức thất bại!",
      };
    }
  },

  // 🔹 Cập nhật công thức
  updateRecipe: async (dishId, recipeId, data) => {
    // Thêm dishId để khớp với backend
    try {
      console.log("✏️ Cập nhật công thức ID:", recipeId, data);
      const response = await axios.put(`${API_URL}/recipes/${dishId}/${recipeId}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật công thức:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Cập nhật công thức thất bại!",
      };
    }
  },

  // 🔹 Xóa công thức
  deleteRecipe: async (dishId, recipeId) => {
    try {
      console.log(`🗑 Xóa công thức ID: ${recipeId} thuộc món ID: ${dishId}`);
      const response = await axios.delete(`${API_URL}/recipes/${dishId}/${recipeId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true, message: response.data.message || "Công thức đã được xóa" };
    } catch (error) {
      console.error("❌ Lỗi khi xóa công thức:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Xóa thất bại!" };
    }
  },

  // 🔹 Xóa vĩnh viễn công thức (nếu backend hỗ trợ, hiện tại chưa có trong recipeRouter)
  hardDeleteRecipe: async (recipeId) => {
    try {
      console.log(`🗑 Xóa vĩnh viễn công thức ID: ${recipeId}`);
      await axios.delete(`${API_URL}/recipes/hard/${recipeId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa vĩnh viễn công thức:", error.response?.data || error.message);
      return { success: false, message: "Xóa vĩnh viễn công thức thất bại!" };
    }
  },
};

export default recipesService;
