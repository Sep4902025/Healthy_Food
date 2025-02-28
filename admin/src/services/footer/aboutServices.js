import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/footer";

const aboutService = {
  getAboutUs: async () => {
    try {
      const response = await axios.get(`${API_URL}/about`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Lỗi khi tải dữ liệu",
      };
    }
  },

  createAboutUs: async (data) => {
    try {
        console.log("Dữ liệu gửi lên API:", data);
        const response = await axios.post(`${API_URL}/about`, data);
        console.log("Phản hồi từ server:", response.data);
        return { success: true };
    } catch (error) {
        console.error("Lỗi khi gọi API:", error.response?.data || error.message);

        // Nếu lỗi do thiếu dữ liệu, hiển thị thông báo cụ thể hơn
        if (error.response?.status === 400) {
            return { success: false, message: error.response.data.error };
        }

        return { success: false, message: "Thêm mới thất bại!" };
    }
},

  updateAboutUs: async (id, data) => {
    try {
      await axios.put(`${API_URL}/about/${id}`, data);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Cập nhật thất bại!" };
    }
  },

  deleteAboutUs: async (id) => {
    try {
      await axios.delete(`${API_URL}/about/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Xóa mềm thất bại!" };
    }
  },

  hardDeleteAboutUs: async (id) => {
    try {
      await axios.delete(`${API_URL}/about/hard/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Xóa vĩnh viễn thất bại!" };
    }
  },
};

export default aboutService;
