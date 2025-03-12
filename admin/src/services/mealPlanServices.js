import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ Import đúng cách

const API_URL = process.env.REACT_APP_API_URL;

// 🔹 Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ Không tìm thấy token trong localStorage!");
    return null;
  }

  try {
    const decoded = jwtDecode(token); // ✅ Giải mã token
    return decoded?.userId || decoded?.id || null; // Trả về userId nếu có
  } catch (error) {
    console.error("❌ Lỗi khi giải mã token:", error);
    return null;
  }
};

const mealPlanService = {
  getUserIdFromToken, // ✅ Thêm vào object để export đúng cách
  getAllMealPlans: async () => {
    try {
      const userId = getUserIdFromToken(); // Lấy userId từ token
      if (!userId) {
        console.error("❌ Không tìm thấy userId từ token!");
        return { success: false, message: "User chưa đăng nhập!" };
      }

      const response = await axios.get(`${API_URL}/mealPlan`, {
        headers: getAuthHeaders(),
        params: { userId },
        withCredentials: true,
      });

      console.log("🔍 Danh sách MealPlans từ API:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealPlans:", error.response?.data || error.message);
      return { success: false, message: "Lỗi khi tải danh sách MealPlans" };
    }
  },


  // 🔹 Lấy chi tiết một MealPlan theo ID
  getMealPlanById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/mealPlan/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("🔍 Chi tiết MealPlan:", response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Không tìm thấy MealPlan!" };
    }
  },

  // 🔹 Lấy danh sách MealDays theo MealPlan ID
  getMealDaysByMealPlan: async (mealPlanId) => {
    try {
      const response = await axios.get(`${API_URL}/mealPlan/${mealPlanId}/mealDay`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("🔍 Danh sách MealDays:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDays:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDays" };
    }
  },

  // 🔹 Lấy danh sách Meals theo MealDay ID
  getMealsByMealDay: async (mealPlanId, mealDayId) => {
    try {
      console.log(`📤 Gửi request GET /mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`);
      const response = await axios.get(`${API_URL}/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      console.log("📥 Dữ liệu Meals từ API:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy Meals:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy Meals" };
    }
  },
  
  createMealPlan: async (mealPlanData) => {
    try {
      const userId = getUserIdFromToken(); // Lấy userId từ token
      if (!userId) {
        return { success: false, message: "User chưa đăng nhập!" };
      }
  
      const requestData = { ...mealPlanData, userId, createdBy: userId };
  
      console.log(`📤 Gửi request tạo Meal Plan:`, requestData);
  
      const response = await axios.post(`${API_URL}/mealPlan`, requestData, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
  
      console.log("✅ Meal Plan đã được tạo:", response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi tạo Meal Plan:", error.response?.data || error.message);
      return { success: false, message: "Không thể tạo Meal Plan!" };
    }
  },

  // 🔹 Thêm món ăn vào Meal
  addDishToMeal: async (mealPlanId, mealDayId, mealId, dish) => {
    try {
      const userId = getUserIdFromToken(); // 🔥 Lấy userId từ token
      if (!userId) {
        return { success: false, message: "User chưa đăng nhập!" };
      }

      // 🔍 Lấy danh sách món ăn hiện tại của Meal
      const mealsResponse = await axios.get(
        `${API_URL}/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      const existingDishes = mealsResponse.data.data?.dishes || [];

      // ⚠️ Kiểm tra xem món ăn đã tồn tại hay chưa
      const isAlreadyAdded = existingDishes.some((existingDish) => existingDish.dishId === dish.dishId);

      if (isAlreadyAdded) {
        console.warn("⚠️ Món ăn đã tồn tại trong bữa ăn!");
        return { success: false, message: "Món ăn này đã được thêm vào bữa ăn!" };
      }

      const dishData = {
        userId,
        dishes: [dish], // 🔥 Gửi danh sách món ăn dưới dạng mảng
      };

      console.log(`📤 Gửi request POST với dữ liệu:`, dishData);

      const response = await axios.post(
        `${API_URL}/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}/dishes`,
        dishData,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      console.log("✅ Món ăn đã được thêm:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn vào Meal:", error.response?.data || error.message);
      return { success: false, message: "Không thể thêm món ăn!" };
    }
  },

  


  getAllDishes: async () => {
    try {
      console.log(`📤 Gửi request GET /dishes`);
      const response = await axios.get(`${API_URL}/dishes`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
  
      console.log("📥 Danh sách món ăn từ API:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách món ăn:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy danh sách món ăn!" };
    }
  },

  // 🔹 Cập nhật MealPlan
  updateMealPlan: async (id, data) => {
    try {
      console.log(`📤 Cập nhật MealPlan ID: ${id}`, data);

      await axios.put(`${API_URL}/mealPlan/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Cập nhật MealPlan thất bại!" };
    }
  },

  removeDishFromMeal: async (mealPlanId, mealDayId, mealId, dishId) => {
    try {
      const userId = getUserIdFromToken(); // 🔥 Lấy userId từ token
      if (!userId) {
        return { success: false, message: "User chưa đăng nhập!" };
      }

      console.log(`📤 Xóa món ăn ${dishId} khỏi Meal ${mealId} với userId: ${userId}`);

      const response = await axios.delete(
        `${API_URL}/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}/dishes/${dishId}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
          data: { userId }, // 🔥 Gửi userId trong body request
        }
      );

      console.log("✅ Món ăn đã được xóa:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi xóa món ăn:", error.response?.data || error.message);
      return { success: false, message: "Không thể xóa món ăn!" };
    }
  },

  


  // 🔹 Xóa MealPlan
  deleteMealPlan: async (id) => {
    try {
      console.log(`🗑️ Xóa MealPlan ID: ${id}`);

      await axios.delete(`${API_URL}/mealPlan/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Xóa MealPlan thất bại!" };
    }
  },
};


export default mealPlanService;
