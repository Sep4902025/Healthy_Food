import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/ingredients";

const ingredientsService = {
  // Lấy tất cả nguyên liệu
  getAllIngredients: async () => {
    try {
      const response = await axios.get(API_URL);
      console.log("Fetched Ingredients:", response.data); // Debug API response
      return {
        success: true,
        data: response.data.data || [], // Đảm bảo data luôn là mảng
      };
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Lỗi khi tải danh sách nguyên liệu",
      };
    }
  },

  // Lấy một nguyên liệu theo ID
  getIngredientById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      console.log(`Fetched Ingredient ${id}:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Lỗi khi lấy nguyên liệu:", error);
      return { success: false, message: "Không tìm thấy nguyên liệu!" };
    }
  },

  // Thêm nguyên liệu mới
  createIngredient: async (data) => {
    try {
      console.log("Dữ liệu gửi lên API:", data);
      const response = await axios.post(API_URL, data);
      console.log("Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi thêm nguyên liệu:", error.response?.data || error.message);
      return { success: false, message: "Thêm nguyên liệu thất bại!" };
    }
  },

  // Cập nhật nguyên liệu
  updateIngredient: async (id, data) => {
    try {
      console.log(`Cập nhật nguyên liệu ${id}:`, data);
      await axios.put(`${API_URL}/${id}`, data);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi cập nhật nguyên liệu:", error);
      return { success: false, message: "Cập nhật nguyên liệu thất bại!" };
    }
  },

//   // Xóa mềm nguyên liệu
//   deleteIngredient: async (id) => {
//     try {
//       console.log(`Xóa mềm nguyên liệu ID: ${id}`);
//       await axios.delete(`${API_URL}/${id}`);
//       return { success: true };
//     } catch (error) {
//       console.error("Lỗi khi xóa nguyên liệu:", error);
//       return { success: false, message: "Xóa mềm nguyên liệu thất bại!" };
//     }
//   },

  // Xóa vĩnh viễn nguyên liệu
  hardDeleteIngredient: async (id) => {
    try {
      console.log(`Xóa vĩnh viễn nguyên liệu ID: ${id}`);
      await axios.delete(`${API_URL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi xóa vĩnh viễn nguyên liệu:", error);
      return { success: false, message: "Xóa vĩnh viễn nguyên liệu thất bại!" };
    }
  },
};

export default ingredientsService;
