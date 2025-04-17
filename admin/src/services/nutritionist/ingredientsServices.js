import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ingredientsService = {
  // Get all ingredients with pagination and filtering
  getAllIngredients: async (page = 1, limit = 10, type = "all", search = "") => {
    try {
      const response = await axios.get(`${API_URL}/ingredients`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          type,  // Filter by ingredient type
          search, // Search by name
          sort: "createdAt", // Add sort parameter
          order: "desc",     // Sort in descending order
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
      return { success: false, message: "Error loading ingredients list" };
    }
  },

  // Get ingredient by ID
  getIngredientById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/ingredients/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: "Ingredient not found!" };
    }
  },

  // Create a new ingredient
  createIngredient: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/ingredients`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true, data: response.data.data }; // Return ingredient data if needed
    } catch (error) {
      // Check for duplicate name error from server
      if (error.response?.data?.message === "Ingredient with this name already exists") {
        return { 
          success: false, 
          message: "Ingredient with this name already exists" 
        };
      }
  
      // Handle other errors
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to add ingredient!" 
      };
    }
  },

  // Update an ingredient
  updateIngredient: async (id, data) => {
    try {
      await axios.put(`${API_URL}/ingredients/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: "Failed to update ingredient!" };
    }
  },

  // Soft delete an ingredient
  deleteIngredient: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/ingredients/${id}`,
        { isDelete: true }, // Send data to update isDelete
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: "Failed to soft delete ingredient!" };
    }
  },
};

export default ingredientsService;