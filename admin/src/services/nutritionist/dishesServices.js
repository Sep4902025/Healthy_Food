import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const dishesService = {
  // 🔹 Lấy tất cả món ăn với phân trang
  getAllDishes: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`${API_URL}/dishes`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          search,
          sort: "createdAt",
          order: "desc",
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
      console.error(
        "❌ Lỗi khi lấy món ăn:",
        error.response?.data || error.message
      );
      return { success: false, message: "Lỗi khi tải danh sách món ăn" };
    }
  },

  getAllDishesForNutri: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`${API_URL}/dishes/nutritionist`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          search,
          sort: "createdAt",
          order: "desc",
        },
      });
      console.log("🔍 Danh sách món ăn cho nutritionist từ API:", response.data);
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
      console.error(
        "❌ Lỗi khi lấy món ăn cho nutritionist:",
        error.response?.data || error.message
      );
      return { success: false, message: "Lỗi khi tải danh sách món ăn cho nutritionist" };
    }
  },

  createDish: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/dishes`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error(
        "❌ Lỗi khi thêm món ăn:",
        error.response?.data || error.message
      );
      return { success: false, message: "Thêm món ăn thất bại!" };
    }
  },

  updateDish: async (id, data) => {
    try {
      console.log(`📤 Cập nhật món ăn ID: ${id}`, data);
      await axios.put(`${API_URL}/dishes/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error(
        "❌ Lỗi khi cập nhật món ăn:",
        error.response?.data || error.message
      );
      return { success: false, message: "Cập nhật món ăn thất bại!" };
    }
  },

  deleteDish: async (id) => {
    try {
      console.log(`🗑️ Xóa mềm món ăn ID: ${id}`);
      const response = await axios.put(
        `${API_URL}/dishes/${id}`,
        { isDelete: true }, // Gửi dữ liệu để cập nhật isDelete
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(
        "❌ Lỗi khi xóa mềm món ăn:",
        error.response?.data || error.message
      );
      return { success: false, message: "Xóa mềm món ăn thất bại!" };
    }
  },

  getDishById: async (dishId) => {
    try {
      const response = await axios.get(`${API_URL}/dishes/${dishId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("Fetched Dish:", response.data);
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
