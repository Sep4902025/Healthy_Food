import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/footer";

const faqServices = {
  getFAQs: async () => {
    try {
      const response = await axios.get(`${API_URL}/faqs`);
      console.log("API Response:", response.data); // Kiểm tra dữ liệu nhận được
      return { success: true, data: response.data.data || [] }; // Đảm bảo data luôn là mảng
    } catch (error) {
      console.error("Lỗi khi lấy FAQs:", error);
      return { success: false, message: error.response?.data?.message || "Lỗi khi lấy dữ liệu FAQs" };
    }
  },

    createFAQ: async (data) => {
        try {
            console.log("Dữ liệu gửi lên API:", data);
            const response = await axios.post(`${API_URL}/faqs`, data);
            console.log("Phản hồi từ server:", response.data);
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi gọi API:", error.response?.data || error.message);

            if (error.response?.status === 400) {
                return { success: false, message: error.response.data.error };
            }

            return { success: false, message: "Thêm mới thất bại!" };
        }
    },

    updateFAQ: async (id, data) => {
        try {
            await axios.put(`${API_URL}/faqs/${id}`, data);
            return { success: true };
        } catch (error) {
            return { success: false, message: "Cập nhật thất bại!" };
        }
    },


    hardDeleteFAQ: async (id) => {
        try {
            await axios.delete(`${API_URL}/faqs/hard/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: "Xóa vĩnh viễn thất bại!" };
        }
    },
};

export default faqServices;
