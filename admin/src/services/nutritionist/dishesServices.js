import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const dishesService = {
  // Get all dishes with pagination and filtering
  getAllDishes: async (page = 1, limit = 10, type = "all", search = "") => {
    try {
      const response = await axios.get(`${API_URL}/dishes`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          type, // Filter by dish type
          search,
          sort: "createdAt",
          order: "desc",
        },
      });
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
      return { success: false, message: "Error loading dishes list" };
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
      return { success: false, message: "Error loading dishes list for nutritionist" };
    }
  },

  createDish: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/dishes`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true, data: response.data.data }; // Return dish data if needed
    } catch (error) {
      // Check for duplicate name error from server
      if (error.response?.data?.message === "Dish with this name already exists") {
        return {
          success: false,
          message: "Dish with this name already exists",
        };
      }

      // Handle other errors
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add dish!",
      };
    }
  },

  updateDish: async (id, data) => {
    try {
      await axios.put(`${API_URL}/dishes/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: "Failed to update dish!" };
    }
  },

  deleteDish: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/dishes/${id}`,
        { isDelete: true }, // Send data to update isDelete
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: "Failed to soft delete dish!" };
    }
  },

  getDishById: async (dishId) => {
    try {
      const response = await axios.get(`${API_URL}/dishes/${dishId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return {
        success: true,
        data: response.data.data || {},
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Error loading dish",
      };
    }
  },
};

export default dishesService;
