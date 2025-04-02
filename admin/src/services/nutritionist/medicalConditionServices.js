import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const medicalConditionService = {
  // 🔹 Lấy tất cả điều kiện y tế
  getAllMedicalConditions: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`${API_URL}/medicalConditions`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          search, // Thêm tìm kiếm
          sort: "createdAt", // Sắp xếp theo ngày tạo
          order: "desc",     // Giảm dần (mới nhất lên trước)
        },
      });
      console.log("📌 List of medical conditions:", response.data);
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
        "❌ Error fetching medical conditions:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to load medical conditions!",
      };
    }
  },
  

  // 🔹 Lấy điều kiện y tế theo ID
  getMedicalConditionById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/medicalConditions/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Medical condition ID ${id}:`, response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "❌ Error fetching medical condition:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Medical condition not found!",
      };
    }
  },

  // 🔹 Thêm điều kiện y tế mới
  createMedicalCondition: async (data) => {
    try {
      console.log("📤 Sending data to create medical condition:", data);
      const response = await axios.post(`${API_URL}/medicalConditions`, data, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("✅ Server response:", response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "❌ Error creating medical condition:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to create medical condition!",
      };
    }
  },

  // 🔹 Cập nhật điều kiện y tế
  updateMedicalCondition: async (id, data) => {
    try {
      console.log(`✏️ Updating medical condition ID ${id}:`, data);
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
      console.log("✅ Update response:", response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        "❌ Error updating medical condition:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update medical condition!",
      };
    }
  },

  // 🔹 Xóa mềm điều kiện y tế (soft delete)
  deleteMedicalCondition: async (id) => {
    try {
      console.log(`🗑 Soft deleting medical condition ID: ${id}`);
      const response = await axios.delete(
        `${API_URL}/medicalConditions/${id}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      console.log("✅ Delete response:", response.data);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error(
        "❌ Error soft deleting medical condition:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to soft delete medical condition!",
      };
    }
  },

  // 🔹 Tìm kiếm điều kiện y tế theo tên
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
      console.log(
        `📌 Search results for medical condition name "${name}":`,
        response.data
      );
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
      console.error(
        "❌ Error searching medical conditions:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to search medical conditions!",
      };
    }
  },
};

export default medicalConditionService;
