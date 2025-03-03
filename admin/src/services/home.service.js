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
      const response = await axiosInstance.get(`/Home/ingredients/type/${type}`);
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

};

export default HomeService;
