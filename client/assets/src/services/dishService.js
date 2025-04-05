import axiosInstance from "./axiosInstance"; 
import AsyncStorage from "@react-native-async-storage/async-storage";


const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error("Error getting token from AsyncStorage:", error);
    return {};
  }
};

const dishesService = {

  getAllDishes: async (page, limit, search = "") => {
    try {
      const response = await axiosInstance.get("/dishes", {
        params: {
          page,
          limit,
          search, 
        },
      });
      console.log("🔍 Danh sách món ăn từ API:", response.data);
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
      console.error("❌ Lỗi khi lấy món ăn:", error.response?.data || error.message);
      return { success: false, message: "Lỗi khi tải danh sách món ăn" };
    }
  },

  createDish: async (data) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axiosInstance.post("/dishes", data, { headers });
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn:", error.response?.data || error.message);
      return { success: false, message: "Thêm món ăn thất bại!" };
    }
  },

  updateDish: async (id, data) => {
    try {
      console.log(`📤 Cập nhật món ăn ID: ${id}`, data);
      const headers = await getAuthHeaders();
      await axiosInstance.put(`/dishes/${id}`, data, { headers });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật món ăn:", error.response?.data || error.message);
      return { success: false, message: "Cập nhật món ăn thất bại!" };
    }
  },


  hardDeleteDish: async (id) => {
    try {
      console.log(`🗑️ Xóa vĩnh viễn món ăn ID: ${id}`);
      const headers = await getAuthHeaders();
      await axiosInstance.delete(`/dishes/${id}`, { headers });
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa vĩnh viễn món ăn:", error.response?.data || error.message);
      return { success: false, message: "Xóa vĩnh viễn món ăn thất bại!" };
    }
  },


  getRecipeByRecipeId: async (dishId, recipeId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axiosInstance.get(`/dishes/${dishId}/recipes/${recipeId}`, {
        headers,
      });
      console.log("Fetched Recipes nè :", response.data.data);
      return {
        success: true,
        data: response.data?.data || {}, 
      };
    } catch (error) {
      console.error("Error fetching recipe:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Không thể tải công thức. Vui lòng thử lại sau!",
      };
    }
  },


  getDishById: async (dishId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axiosInstance.get(`/dishes/${dishId}`, { headers });
      return {
        success: true,
        data: response.data.data || {}, 
      };
    } catch (error) {
      console.error("Error fetching dish:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Lỗi khi tải món ăn",
      };
    }
  },
};

export default dishesService;
