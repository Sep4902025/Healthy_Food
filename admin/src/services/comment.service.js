import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/comment";

const commentService = {
  // Recipes
  rateRecipe: async (recipeId, userId, star) => {
    try {
      const response = await axios.post(`${API_URL}/rate`, {
        recipeId,
        userId,
        star,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Lỗi khi đánh giá công thức:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể gửi đánh giá.",
      };
    }
  },

  getRatingsByRecipe: async (recipeId) => {
    try {
      const response = await axios.get(`${API_URL}/rate/${recipeId}`);
      return {
        success: true,
        data: response.data?.data || [],
      };
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      return {
        success: false,
        message: "Không thể tải đánh giá.",
      };
    }
  },

  //Comments

  getCommentsByDishId: async (dishId) => {
    try {
      const response = await axios.get(`${API_URL}/${dishId}/comment`);
      
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bình luận:", error);
      throw error;
    }
  },

  addComment: async (dishId, text, userId) => {
    try {
      const response = await axios.post(`${API_URL}/${dishId}/comment`, { userId, text });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      throw error;
    }
  },

  updateComment: async (commentId, newText) => {
    try {
      const response = await axios.put(`${API_URL}/comment/${commentId}`, { text: newText });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật bình luận:", error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      await axios.delete(`${API_URL}/comment/${commentId}`);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      throw error;
    }
  },

  toggleLikeComment: async (commentId, userId) => {
    try {
      const response = await axios.post(`${API_URL}/${commentId}/like`, { userId });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi like/unlike bình luận:", error);
      throw error;
    }
  },

  getLikesByComment: async (commentId) => {
    try {
      const response = await axios.get(`${API_URL}/like/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách like:", error);
      throw error;
    }
  },

  unlikeComment: async (commentId, userId) => {
    try {
      const response = await axios.post(`${API_URL}/like/${commentId}`, { userId });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi bỏ like bình luận:", error);
      throw error;
    }
  },

  deleteRating: async (recipeId, userId) => {
    try {
      const response = await axios.delete(`${API_URL}/rate/${recipeId}`, { data: { userId } });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      return { success: false, message: "Không thể xóa đánh giá." };
    }
  },
  


};

export default commentService;
