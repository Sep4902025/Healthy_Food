import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/footer/contact";

const contactServices = {
  createContact: async (contactData) => {
    try {
      const response = await axios.post(API_URL, contactData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || "Lỗi khi gửi liên hệ." 
      };
    }
  },

  getContacts: async () => {
    try {
      const response = await axios.get(API_URL);
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
