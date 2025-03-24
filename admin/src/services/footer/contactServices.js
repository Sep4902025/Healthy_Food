import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};  

const contactServices = {
  // Tạo mới một liên hệ
  createContact: async (data) => {
    try {
      await axios.post(`${API_URL}/footer/contact`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Gửi liên hệ thất bại!",
      };
    }
  },

  updateContact: async (id, updateData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`${API_URL}/footer/contact/${id}`, updateData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Lỗi cập nhật contact:", error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || "Lỗi không xác định khi cập nhật contact." };
    }
},


  // Lấy danh sách liên hệ
  getContacts: async () => {
    try {
        const response = await axios.get(`${API_URL}/footer/contact`, {
            headers: getAuthHeaders(),
            withCredentials: true, 
        });
        return { success: true, data: Array.isArray(response.data.data) ? response.data.data : [response.data.data] };
      } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.error || "Lỗi khi tải danh sách liên hệ." 
        };
    }
},

   // Xóa một liên hệ theo ID
   deleteContact: async (id) => {
    try {
        const token = localStorage.getItem("token"); // Lấy token từ localStorage hoặc Redux store
        const response = await axios.delete(`${API_URL}/footer/contact/hard/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Lỗi khi gọi API xóa liên hệ:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.message || error.message || "Lỗi không xác định khi xóa liên hệ."
        };
    }
}


};

export default contactServices;
