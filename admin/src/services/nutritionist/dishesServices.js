import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/dishes";

const dishesService = {
  // Lấy tất cả món ăn
  getAllDishes: async () => {
    try {
      const response = await axios.get(API_URL);
      console.log("Fetched Dishes:", response.data); // Debug API response
      return {
        success: true,
        data: response.data.data || [], // Đảm bảo data luôn là mảng
      };
    } catch (error) {
      console.error("Error fetching dishes:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Lỗi khi tải danh sách món ăn",
      };
    }
  },

  // Thêm món ăn mới
  createDish: async (data) => {
    try {
      console.log("Dữ liệu gửi lên API:", data);
      const response = await axios.post(API_URL, data);
      console.log("Phản hồi từ server:", response.data);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi thêm món ăn:", error.response?.data || error.message);
      return { success: false, message: "Thêm món ăn thất bại!" };
    }
  },

  // Cập nhật món ăn
  updateDish: async (id, data) => {
    try {
      console.log(`Cập nhật món ăn ${id}:`, data);
      await axios.put(`${API_URL}/${id}`, data);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi cập nhật món ăn:", error);
      return { success: false, message: "Cập nhật món ăn thất bại!" };
    }
  },

  // Xóa mềm món ăn
  deleteDish: async (id) => {
    try {
      console.log(`Xóa mềm món ăn ID: ${id}`);
      await axios.delete(`${API_URL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi xóa món ăn:", error);
      return { success: false, message: "Xóa mềm món ăn thất bại!" };
    }
  },

  // Xóa vĩnh viễn món ăn
  hardDeleteDish: async (id) => {
    try {
      console.log(`Xóa vĩnh viễn món ăn ID: ${id}`);
      await axios.delete(`${API_URL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi xóa vĩnh viễn món ăn:", error);
      return { success: false, message: "Xóa vĩnh viễn món ăn thất bại!" };
    }
  },
};

export default dishesService;
