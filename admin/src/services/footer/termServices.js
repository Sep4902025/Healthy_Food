import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/footer";

const termService = {
    getTerms: async () => {
        try {
            const response = await axios.get(`${API_URL}/terms`);
            console.log("Raw API Response:", response.data);

            if (!response.data || !Array.isArray(response.data.data)) {
                return { success: false, message: "Dữ liệu API không hợp lệ" };
            }

            return {
                success: true,
                data: response.data.data.map((item) => ({
                    banner_url: item.banner_url || "",
                    content: String(item.content || ""),
                })),
            };
        } catch (error) {
            console.error("Lỗi khi gọi API Term:", error);
            return {
                success: false,
                message: error.response?.data?.error || "Không thể kết nối đến API",
            };
        }
    },

    createTerm: async (data) => {
        try {
            console.log("Dữ liệu gửi lên API:", data);
            const response = await axios.post(`${API_URL}/terms`, data);
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

    updateTerm: async (id, data) => {
        try {
            await axios.put(`${API_URL}/terms/${id}`, data);
            return { success: true };
        } catch (error) {
            return { success: false, message: "Cập nhật thất bại!" };
        }
    },

    deleteTerm: async (id) => {
        try {
            await axios.delete(`${API_URL}/terms/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: "Xóa mềm thất bại!" };
        }
    },

    hardDeleteTerm: async (id) => {
        try {
            await axios.delete(`${API_URL}/terms/hard/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: "Xóa vĩnh viễn thất bại!" };
        }
    },
};

export default termService;
