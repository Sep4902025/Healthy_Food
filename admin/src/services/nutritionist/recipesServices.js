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
        params: {
          page,
          limit,
          search, // Tìm kiếm theo tên công thức hoặc tiêu chí khác
        },
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

  // 🔹 Lấy danh sách công thức theo `dishId` với phân trang
  getRecipesByDishId: async (dishId, page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`${API_URL}/recipes/dish/${dishId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          search, // Tìm kiếm trong danh sách công thức của món
        },
      });
      console.log(`📌 Công thức của món ID ${dishId}:`, response.data);
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
      console.error("❌ Lỗi khi tải công thức theo món:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy danh sách công thức." };
    }
  },

  // 🔹 Lấy công thức theo `recipeId`
  getRecipeById: async (dishId, recipeId) => {
    try {
      const url = `${API_URL}/dishes/${dishId}/recipes/${recipeId}`;
      console.log(`📡 Gọi API tới: ${url}`);
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Công thức ID ${recipeId}:`, response.data);
      return { success: true, data: response.data };
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
      const response = await axios.post(`${API_URL}/dishes/${dishId}/recipes`, data, {
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
  updateRecipe: async (recipeId, data) => {
    try {
      console.log("✏️ Cập nhật công thức ID:", recipeId, data);
      const response = await axios.put(`${API_URL}/dishes/${data.dishId}/recipes/${recipeId}`, data, {
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

  // 🔹 Xóa mềm công thức
  deleteRecipe: async (dishId, recipeId) => {
    try {
      console.log(`🗑 Xóa công thức ID: ${recipeId} thuộc món ID: ${dishId}`);
      const response = await axios.delete(`${API_URL}/dishes/${dishId}/recipes/${recipeId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true, message: response.data.message || "Recipe has been deleted" };
    } catch (error) {
      console.error("❌ Lỗi khi xóa công thức:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Xóa thất bại!" };
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