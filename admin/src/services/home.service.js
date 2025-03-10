import axios from "axios";

const API_URL = "http://localhost:8080/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000, // timeout sau 5 giây
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Có thể thêm redirect tới trang login ở đây
    }
    return Promise.reject(error);
  }
);

const HomeService = {
  // Gọi API để lấy danh sách nguyên liệu nhóm theo loại
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
      const response = await axiosInstance.get(
        `/Home/ingredients/type/${type}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching ingredients for type ${type}:`, error);
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
      return response.data;
    } catch (error) {
      console.error(`Error fetching dish with ID ${dishId}:`, error);
      throw error;
    }
  },

  getFavoriteDishes: async (userId) => {
    try {
        const response = await axiosInstance.get(`/favoriteDishes/${userId}`);
        if (response.data.status === "success") {
          console.log("🔥 Danh sách món ăn yêu thích từ API:", response.data.data);
            return response.data.data.map((item) => ({
                dishId: item.dishId._id, 
                isLike: item.isLike 
            }));
        }
        return [];
    } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
        return [];
    }
},


  // 🟢 Toggle Like / Unlike món ăn
  toggleFavoriteDish: async (userId, dishId, isLiked) => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`/favoriteDishes`, { data: { userId, dishId } });
      } else {
        await axiosInstance.post(`/favoriteDishes`, { userId, dishId });
      }
      return !isLiked; // Trả về trạng thái mới của món ăn (liked hoặc unliked)
    } catch (error) {
      console.error("Lỗi khi cập nhật món ăn yêu thích:", error);
      return isLiked; // Nếu lỗi, giữ nguyên trạng thái cũ
    }
  },

};



export default HomeService;
