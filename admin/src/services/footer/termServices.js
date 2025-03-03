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
                    _id: item._id,  // ✅ Thêm ID để sử dụng trong cập nhật
                    bannerUrl: item.bannerUrl || "",
                    content: item.content || "",
                    isVisible: item.isVisible || false,
                })),
            };
        } catch (error) {
            console.error("Lỗi khi gọi API Term:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Không thể kết nối đến API",
            };
        }
    },

    createTerm: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/terms`, data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Lỗi khi tạo mới:", error.response?.data || error.message);
            return { success: false, message: "Thêm mới thất bại!" };
        }
    },

    updateTerm: async (id, termData) => {
        if (!id) return { success: false, message: "ID không hợp lệ" };

        try {
            const response = await axios.put(`${API_URL}/terms/${id}`, termData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Lỗi khi cập nhật term:", error.response?.data || error.message);
            return { success: false, message: "Không thể cập nhật Term" };
        }
    },

    hardDeleteTerm: async (id) => {
        try {
            await axios.delete(`${API_URL}/terms/hard/${id}`);
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa:", error.response?.data || error.message);
            return { success: false, message: "Xóa thất bại!" };
        }
    },
};

export default termService;
