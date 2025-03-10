import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const recipesService = {
  // 🔹 Lấy tất cả công thức
  getAllRecipes: async () => {
    try {
      const response = await axios.get(`${API_URL}/recipes`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("📌 Danh sách công thức:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách công thức:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy danh sách công thức." };
    }
  },

  // 🔹 Lấy danh sách công thức theo `dishId`
  getRecipesByDishId: async (dishId) => {
    try {
      const response = await axios.get(`${API_URL}/recipes/dish/${dishId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Công thức của món ID ${dishId}:`, response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi tải công thức theo món:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy danh sách công thức." };
    }
  },

  // 🔹 Lấy công thức theo `recipeId`
  getRecipeById: async (recipeId) => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${recipeId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Công thức ID ${recipeId}:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy công thức:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy công thức." };
    }
  },

  // 🔹 Tạo công thức mới
  createRecipe: async (data) => {
    try {
      console.log("📤 Gửi dữ liệu tạo công thức:", data);
      const response = await axios.post(`${API_URL}/recipes`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi thêm công thức:", error.response?.data || error.message);
      return { success: false, message: "Thêm công thức thất bại!" };
    }
  },

  // 🔹 Cập nhật công thức theo `recipeId`
  updateRecipe: async (recipeId, data) => {
    try {
      console.log(`✏️ Cập nhật công thức ID ${recipeId}:`, data);
      await axios.put(`${API_URL}/recipes/${recipeId}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật công thức:", error.response?.data || error.message);
      return { success: false, message: "Cập nhật công thức thất bại!" };
    }
  },

  // 🔹 Xóa mềm công thức theo `recipeId`
  deleteRecipe: async (recipeId) => {
    try {
      console.log(`🗑 Xóa mềm công thức ID: ${recipeId}`);
      await axios.delete(`${API_URL}/recipes/${recipeId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa công thức:", error.response?.data || error.message);
      return { success: false, message: "Xóa công thức thất bại!" };
    }
  },

  // 🔹 Xóa vĩnh viễn công thức theo `recipeId`
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
