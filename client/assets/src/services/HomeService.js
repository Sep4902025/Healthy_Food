import axiosInstance from "./axiosInstance";

const HomeService = {
  // Lấy danh sách nguyên liệu nhóm theo loại
  getIngredientsGroupedByType: async () => {
    try {
      const response = await axiosInstance.get("/Home/ingredients/type");
      return response.data;
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      throw error;
    }
  },

  getIngredientsByType: async (type) => {
    try {
      const response = await axiosInstance.get(`/Home/ingredients/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ingredients for type ${type}:`, error);
      throw error;
    }
  },

  // Lấy nguyên liệu theo ID
  getIngredientById: async (ingredientId) => {
    try {
      const response = await axiosInstance.get(`/ingredients/${ingredientId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching ingredient with ID ${ingredientId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getDishesGroupedByType: async () => {
    try {
      const response = await axiosInstance.get("/Home/dishes/type");
      return response.data;
    } catch (error) {
      console.error("Error fetching dishes:", error);
      throw error;
    }
  },

  getDishesByType: async (type) => {
    try {
      const response = await axiosInstance.get(`/Home/dishes/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching dishes for type ${type}:`, error);
      throw error;
    }
  },

  getAllDishes: async () => {
    try {
      const response = await axiosInstance.get("/dishes");
      return response.data;
    } catch (error) {
      console.error("Error fetching all dishes:", error);
      throw error;
    }
  },

  getDishById: async (dishId) => {
    try {
      const response = await axiosInstance.get(`/dishes/${dishId}`);
      console.log("RESSSS", response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching dish with ID ${dishId}:`, error);
      throw error;
    }
  },

  getRecipeByRecipeId: async (dishId, recipeId) => {
    try {
      const response = await axiosInstance.get(`/dishes/${dishId}/recipes/${recipeId}`);
      return {
        success: true,
        data: response.data?.data || response.data || {},
      };
    } catch (error) {
      console.error("Error fetching recipe:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to load recipe.",
      };
    }
  },

  getFavoriteDishes: async (userId) => {
    try {
      const response = await axiosInstance.get(`/favoriteDishes/${userId}`);
      console.log("UserId", userId);
      if (response.data.status === "success") {
        return response.data.data
          .filter((item) => item.isLike)
          .map((item) => ({
            dishId: item.dishId._id,
            isLike: item.isLike,
          }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching favorite dishes:", error);
      return [];
    }
  },

  toggleFavoriteDish: async (userId, dishId, isLiked) => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`/favoriteDishes`, {
          data: { userId, dishId },
        });
      } else {
        await axiosInstance.post(`/favoriteDishes`, { userId, dishId });
      }
      return !isLiked;
    } catch (error) {
      console.error("Error toggling favorite dish:", error);
      return isLiked;
    }
  },
};

export default HomeService;