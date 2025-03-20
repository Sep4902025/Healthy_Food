import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const medicalConditionService = {
  // 🔹 Lấy tất cả điều kiện y tế
  getAllMedicalConditions: async () => {
    try {
      const response = await axios.get(`${API_URL}/medicalConditions`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("📌 List of medical conditions:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Error fetching medical conditions:", error.response?.data || error.message);
      return { success: false, message: "Failed to load medical conditions!" };
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
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Error fetching medical condition:", error.response?.data || error.message);
      return { success: false, message: "Medical condition not found!" };
    }
  },

  // 🔹 Thêm điều kiện y tế mới
  createMedicalCondition: async (data) => {
    try {
      console.log("📤 Sending data to create medical condition:", data);
      const response = await axios.post(`${API_URL}/medicalConditions`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("✅ Server response:", response.data);
      return { success: true };
    } catch (error) {
      console.error("❌ Error creating medical condition:", error.response?.data || error.message);
      return { success: false, message: "Failed to create medical condition!" };
    }
  },

  // 🔹 Cập nhật điều kiện y tế
  updateMedicalCondition: async (id, data) => {
    try {
      console.log(`✏️ Updating medical condition ID ${id}:`, data);
      await axios.put(`${API_URL}/medicalConditions/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating medical condition:", error.response?.data || error.message);
      return { success: false, message: "Failed to update medical condition!" };
    }
  },

  // 🔹 Xóa vĩnh viễn điều kiện y tế
  deleteMedicalCondition: async (id) => {
    try {
      console.log(`🗑 Permanently deleting medical condition ID: ${id}`);
      await axios.delete(`${API_URL}/medicalConditions/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Error permanently deleting medical condition:", error.response?.data || error.message);
      return { success: false, message: "Failed to permanently delete medical condition!" };
    }
  },

  // 🔹 Tìm kiếm điều kiện y tế theo tên
  searchMedicalConditionByName: async (name) => {
    try {
      const response = await axios.get(`${API_URL}/medicalConditions/search?name=${name}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log(`📌 Search results for medical condition name "${name}":`, response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Error searching medical conditions:", error.response?.data || error.message);
      return { success: false, message: "Failed to search medical conditions!" };
    }
  },
};

export default medicalConditionService;