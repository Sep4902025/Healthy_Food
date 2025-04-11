import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const recipeService = {
  // Lấy công thức theo dishId và recipeId
  getRecipeByRecipeId: async (recipeId) => { // Chỉ cần recipeId
    try {
      const response = await axios.get(`${API_URL}/recipes/dish/${recipeId}`);
      console.log("Fetched Recipe:", response.data);
      return {
        success: true,
        data: response.data?.data || {},
      };
    } catch (error) {
      console.error("Error fetching recipe:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể tải công thức!",
      };
    }
  },
};

export default recipeService;
