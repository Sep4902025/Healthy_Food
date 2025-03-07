import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/dishes";

const recipeService = {
  // Lấy công thức theo dishId
  getRecipeByRecipeId: async (dishId) => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${dishId}`);
      console.log("Fetched Recipes:", response.data); // Debug API response

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
