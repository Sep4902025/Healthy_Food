import axiosInstance from "./axiosInstance"; // Import axiosInstance

const ingredientsService = {
  // 🔹 Lấy tất cả nguyên liệu
  getAllIngredients: async () => {
    try {
      const response = await axiosInstance.get("/ingredients");
      console.log("📌 Danh sách nguyên liệu:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Lỗi khi tải danh sách nguyên liệu" };
    }
  },

  // 🔹 Lấy nguyên liệu theo ID
  getIngredientById: async (id) => {
    try {
      const response = await axiosInstance.get(`/ingredients/${id}`);
      console.log(`📌 Nguyên liệu ID ${id}:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Không tìm thấy nguyên liệu!" };
    }
  },

  // 🔹 Thêm nguyên liệu mới
  createIngredient: async (data) => {
    try {
      console.log("📤 Gửi dữ liệu tạo nguyên liệu:", data);
      const response = await axiosInstance.post("/ingredients", data);
      console.log("✅ Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi thêm nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Thêm nguyên liệu thất bại!" };
    }
  },

  // 🔹 Cập nhật nguyên liệu
  updateIngredient: async (id, data) => {
    try {
      console.log(`✏️ Cập nhật nguyên liệu ID ${id}:`, data);
      await axiosInstance.put(`/ingredients/${id}`, data);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Cập nhật nguyên liệu thất bại!" };
    }
  },

  // 🔹 Xóa mềm nguyên liệu
  deleteIngredient: async (id) => {
    try {
      console.log(`🗑 Xóa mềm nguyên liệu ID: ${id}`);
      await axiosInstance.delete(`/ingredients/${id}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa mềm nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Xóa mềm nguyên liệu thất bại!" };
    }
  },

  // 🔹 Xóa vĩnh viễn nguyên liệu
  hardDeleteIngredient: async (id) => {
    try {
      console.log(`🗑 Xóa vĩnh viễn nguyên liệu ID: ${id}`);
      await axiosInstance.delete(`/ingredients/${id}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa vĩnh viễn nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Xóa vĩnh viễn nguyên liệu thất bại!" };
    }
  },
};

export default ingredientsService;
