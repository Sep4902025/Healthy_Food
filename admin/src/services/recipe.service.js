import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const recipeService = {
  // Lấy công thức theo dishId và recipeId
  getRecipeByRecipeId: async (dishId, recipeId) => {
    try {
      const response = await axios.get(`${API_URL}/dishes/${dishId}/recipes/${recipeId}`);

      console.log("Fetched Recipes nè :", response.data.data); // Debug API response

      return {
        success: true,
        data: response.data?.data || {}, // Đảm bảo luôn có object
      };
    } catch (error) {
      console.error("Error fetching recipe:", error);

      return {
        success: false,
        message: error.response?.data?.error || "Không thể tải công thức. Vui lòng thử lại sau!",
      };
    }
  },
};

export default recipeService;
