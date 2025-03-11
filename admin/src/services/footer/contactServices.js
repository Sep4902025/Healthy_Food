import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const contactServices = {
  // Tạo mới một liên hệ
  createContact: async (contactData) => {
    try {
      const response = await axios.post(`${API_URL}/footer/contact`, contactData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || "Lỗi khi gửi liên hệ." 
      };
    }
  },

  // Lấy danh sách liên hệ
  getContacts: async () => {
    try {
      const response = await axios.get(`${API_URL}/footer/contact`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || "Lỗi khi tải danh sách liên hệ." 
      };
    }
  }
};

export default contactServices;
