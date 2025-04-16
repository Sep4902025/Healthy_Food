// Import module axiosInstance đã được cấu hình sẵn từ file axiosInstance.js
import axiosInstance from "./axiosInstance"; // Import instance axiosInstance đã cấu hình

// Khai báo object commentService chứa các phương thức xử lý bình luận và đánh giá
const commentService = {
  // Phương thức đánh giá công thức (thêm số sao)
  rateRecipe: async (recipeId, userId, star) => {
    try {
      // Gửi request POST đến endpoint '/comment/rate' với dữ liệu recipeId, userId và star
      const response = await axiosInstance.post(`/comment/rate`, { recipeId, userId, star });
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server
        return { success: true, data: data.data };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể gửi đánh giá" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi đánh giá công thức:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể gửi đánh giá",
      };
    }
  },

  // Phương thức lấy danh sách đánh giá của một công thức cụ thể
  getRatingsByRecipe: async (recipeId) => {
    try {
      // Gửi request GET đến endpoint '/comment/rate/{recipeId}'
      const response = await axiosInstance.get(`/comment/rate/${recipeId}`);
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server hoặc mảng rỗng nếu không có dữ liệu
        return { success: true, data: data.data || [] };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể tải đánh giá" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi lấy đánh giá:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể tải đánh giá",
      };
    }
  },

  // Phương thức xóa đánh giá của người dùng đối với một công thức
  deleteRating: async (recipeId, userId) => {
    try {
      // Gửi request DELETE đến endpoint '/comment/rate/{recipeId}' với userId trong body
      const response = await axiosInstance.delete(`/comment/rate/${recipeId}`, {
        data: { userId }, // Gửi userId trong body của DELETE request
      });
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server
        return { success: true, data: data.data };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể xóa đánh giá" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi xóa đánh giá:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể xóa đánh giá",
      };
    }
  },

  // Phương thức lấy danh sách bình luận của một món ăn
  getCommentsByDishId: async (dishId) => {
    try {
      // Gửi request GET đến endpoint '/comment/{dishId}/comment'
      const response = await axiosInstance.get(`/comment/${dishId}/comment`);
      // Ghi log dữ liệu bình luận nhận được để debug
      console.log("COMMENTS", response.data);

      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server hoặc mảng rỗng nếu không có dữ liệu
        return { success: true, data: data.data || [] };
      } else {
        // Nếu status không phải "success" nhưng cũng không phải lỗi hệ thống, trả về mảng rỗng
        return { success: true, data: [] };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi lấy danh sách bình luận:", error.response?.data || error.message);

      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể tải bình luận",
      };
    }
  },

  // Phương thức thêm bình luận cho một món ăn
  addComment: async (dishId, text, userId) => {
    try {
      // Gửi request POST đến endpoint '/comment/{dishId}/comment' với dữ liệu userId và text
      const response = await axiosInstance.post(`/comment/${dishId}/comment`, { userId, text });
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server
        return { success: true, data: data.data };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể thêm bình luận" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi thêm bình luận:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể thêm bình luận",
      };
    }
  },

  // Phương thức cập nhật nội dung bình luận
  updateComment: async (commentId, newText) => {
    try {
      // Gửi request PUT đến endpoint '/comment/comment/{commentId}' với dữ liệu text mới
      const response = await axiosInstance.put(`/comment/comment/${commentId}`, { text: newText });
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server
        return { success: true, data: data.data };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể cập nhật bình luận" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi cập nhật bình luận:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể cập nhật bình luận",
      };
    }
  },

  // Phương thức xóa bình luận
  deleteComment: async (commentId) => {
    try {
      // Gửi request DELETE đến endpoint '/comment/comment/{commentId}'
      const response = await axiosInstance.delete(`/comment/comment/${commentId}`);
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server
        return { success: true, data: data.data };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể xóa bình luận" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi xóa bình luận:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể xóa bình luận",
      };
    }
  },

  // Phương thức thích hoặc bỏ thích bình luận (toggle)
  toggleLikeComment: async (commentId, userId) => {
    try {
      // Gửi request POST đến endpoint '/comment/{commentId}/like' với dữ liệu userId
      const response = await axiosInstance.post(`/comment/${commentId}/like`, { userId });
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server
        return { success: true, data: data.data };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể thích bình luận" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi thích bình luận:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể thích bình luận",
      };
    }
  },

  // Phương thức lấy danh sách người dùng đã thích một bình luận
  getLikesByComment: async (commentId) => {
    try {
      // Gửi request GET đến endpoint '/comment/like/{commentId}'
      const response = await axiosInstance.get(`/comment/like/${commentId}`);
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server hoặc mảng rỗng nếu không có dữ liệu
        return { success: true, data: data.data || [] };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể tải danh sách lượt thích" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi lấy danh sách lượt thích:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể tải danh sách lượt thích",
      };
    }
  },

  // Phương thức bỏ thích bình luận
  unlikeComment: async (commentId, userId) => {
    try {
      // Gửi request DELETE đến endpoint '/comment/like/{commentId}' với userId trong body
      const response = await axiosInstance.delete(`/comment/like/${commentId}`, {
        data: { userId }, // Gửi userId trong body của DELETE request
      });
      // Trích xuất dữ liệu từ response
      const data = response.data;

      // Kiểm tra trạng thái của response
      if (data.status === "success") {
        // Nếu thành công, trả về object với success=true và dữ liệu từ server
        return { success: true, data: data.data };
      } else {
        // Nếu không thành công, trả về object với success=false và thông báo lỗi
        return { success: false, message: data.message || "Không thể bỏ thích bình luận" };
      }
    } catch (error) {
      // Ghi log lỗi nếu xảy ra exception
      console.error("Lỗi khi bỏ thích bình luận:", error.response?.data || error.message);
      // Trả về object với success=false và thông báo lỗi chi tiết
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể bỏ thích bình luận",
      };
    }
  },
};

// Export commentService để có thể import và sử dụng ở các component khác
export default commentService;