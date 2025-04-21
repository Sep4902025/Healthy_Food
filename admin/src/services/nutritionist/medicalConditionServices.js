import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const medicalConditionService = {
  // Get all health conditions
  getAllMedicalConditions: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`${API_URL}/medicalConditions`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          search, // Add search
          sort: "createdAt", // Sort by creation date
          order: "desc", // Descending (newest first)
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
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to load health conditions!",
      };
    }
  },

  // Get health condition by ID
  getMedicalConditionById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/medicalConditions/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      if (response.data.data?.isDelete === true) {
        return {
          success: false,
          message: "health condition has been soft deleted!",
        };
      }
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "health condition not found!",
      };
    }
  },

  // Create a new health condition
  createMedicalCondition: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/medicalConditions`, data, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      if (
        error.response?.data?.message ===
        "health condition with this name already exists"
      ) {
        return {
          success: false,
          message: "health condition with this name already exists",
        };
      }
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to add health condition!",
      };
    }
  },

  // Update health condition
  updateMedicalCondition: async (id, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/medicalConditions/${id}`,
        data,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update health condition!",
      };
    }
  },

  // Soft delete health condition
  deleteMedicalCondition: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/medicalConditions/${id}`,
        { isDelete: true },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      return {
        success: true,
        message:
          response.data.message || "health condition has been soft deleted",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to soft delete health condition!",
      };
    }
  },

  searchMedicalConditionByName: async (name, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/medicalConditions/search`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          name,
          page,
          limit,
        },
      });
      return {
        success: true,
        data: {
          items: response.data.data || [],
          total: response.data.results || 0,
          currentPage: page,
          totalPages: Math.ceil(response.data.results / limit) || 1,
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to search health conditions!",
      };
    }
  },
};

export default medicalConditionService;
