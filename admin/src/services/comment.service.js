import api from "./api"; // Import instance api đã cấu hình
const commentService = {
  // Đánh giá công thức
  rateRecipe: async (recipeId, userId, star) => {
    try {
      const response = await api.post(`/comment/rate`, { recipeId, userId, star });
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || "Không thể gửi đánh giá" };
      }
    } catch (error) {
      console.error("Lỗi khi đánh giá công thức:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể gửi đánh giá",
      };
    }
  },

  // Lấy danh sách đánh giá của công thức
  getRatingsByRecipe: async (recipeId) => {
    try {
      const response = await api.get(`/comment/rate/${recipeId}`);
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data || [] };
      } else {
        return { success: false, message: data.message || "Không thể tải đánh giá" };
      }
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể tải đánh giá",
      };
    }
  },

  // Xóa đánh giá
  deleteRating: async (recipeId, userId) => {
    try {
      const response = await api.delete(`/comment/rate/${recipeId}`, {
        data: { userId }, // Gửi userId trong body của DELETE request
      });
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || "Không thể xóa đánh giá" };
      }
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể xóa đánh giá",
      };
    }
  },

  // Lấy danh sách bình luận của món ăn
  getCommentsByDishId: async (dishId) => {
    try {
      const response = await api.get(`/comment/${dishId}/comment`);
      console.log("RECOMNET", response.data);

      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data || [] };
      } else {
        return { success: false, message: data.message || "Không thể tải bình luận" };
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bình luận:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể tải bình luận",
      };
    }
  },

  // Thêm bình luận
  addComment: async (dishId, text, userId) => {
    try {
      const response = await api.post(`/comment/${dishId}/comment`, { userId, text });
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || "Không thể thêm bình luận" };
      }
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể thêm bình luận",
      };
    }
  },

  // Cập nhật bình luận
  updateComment: async (commentId, newText) => {
    try {
      const response = await api.put(`/comment/comment/${commentId}`, { text: newText });
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || "Không thể cập nhật bình luận" };
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bình luận:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể cập nhật bình luận",
      };
    }
  },

  // Xóa bình luận
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comment/comment/${commentId}`);
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || "Không thể xóa bình luận" };
      }
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể xóa bình luận",
      };
    }
  },

  // Thích bình luận
  toggleLikeComment: async (commentId, userId) => {
    try {
      const response = await api.post(`/comment/${commentId}/like`, { userId });
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || "Không thể thích bình luận" };
      }
    } catch (error) {
      console.error("Lỗi khi thích bình luận:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể thích bình luận",
      };
    }
  },

  // Lấy danh sách lượt thích của bình luận
  getLikesByComment: async (commentId) => {
    try {
      const response = await api.get(`/comment/like/${commentId}`);
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data || [] };
      } else {
        return { success: false, message: data.message || "Không thể tải danh sách lượt thích" };
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lượt thích:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể tải danh sách lượt thích",
      };
    }
  },

  // Bỏ thích bình luận
  unlikeComment: async (commentId, userId) => {
    try {
      const response = await api.delete(`/comment/like/${commentId}`, {
        data: { userId }, // Gửi userId trong body của DELETE request
      });
      const data = response.data;

      if (data.status === "success") {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || "Không thể bỏ thích bình luận" };
      }
    } catch (error) {
      console.error("Lỗi khi bỏ thích bình luận:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể bỏ thích bình luận",
      };
    }
  },
};

export default commentService;
