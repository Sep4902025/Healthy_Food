import api from "./api";
const API_URL = process.env.REACT_APP_API_URL;

const mealPlanService = {
  getAllMealPlans: async () => {
    try {
      const response = await api.get(`/mealPlan`);
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
      const response = await api.get(`/mealPlan/${id}`);
      console.log("🔍 Chi tiết MealPlan:", response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Không tìm thấy MealPlan!" };
    }
  },

  // Lấy MealPlan hiện tại của user
  getUserMealPlan: async (userId) => {
    try {
      const response = await api.get(`/mealPlan/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy meal plan của user:", error);
      throw error;
    }
  },

  // 🔹 Lấy danh sách MealDays theo MealPlan ID
  getMealDaysByMealPlan: async (mealPlanId) => {
    try {
      const response = await api.get(`/mealPlan/${mealPlanId}/mealDay`);
      console.log("🔍 Danh sách MealDays:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDays:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDays" };
    }
  },
  // In your mealPlanService, add this function:
  getMealDayById: async (mealPlanId, mealDayId) => {
    try {
      const response = await api.get(`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`);
      return { success: true, data: response.data.data || {} };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDay:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDay" };
    }
  },
  // 🔹 Lấy danh sách Meals theo MealDay ID
  getMealsByMealDay: async (mealPlanId, mealDayId) => {
    try {
      const response = await api.get(`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy Meals:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy Meals" };
    }
  },
  // Lấy chi tiết một bữa ăn cụ thể
  getMealByMealId: async (mealPlanId, mealDayId, mealId) => {
    try {
      const response = await api.get(`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết bữa ăn:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy chi tiết bữa ăn",
      };
    }
  },

  createMealPlan: async (mealPlanData) => {
    try {
      const requestData = { ...mealPlanData };
      console.log("📤 Gửi request POST /mealPlan với dữ liệu:", requestData);
      const response = await api.post(`/mealPlan`, requestData);
      console.log("✅ Meal Plan đã được tạo:", response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi tạo Meal Plan:", error.response?.data || error.message);
      return { success: false, message: "Không thể tạo Meal Plan!" };
    }
  },

  // 🔹 Thêm bữa ăn vào ngày
  addMealToDay: async (mealPlanId, mealDayId, mealData) => {
    try {
      console.log("📤 Gửi request POST để thêm bữa ăn:", mealData);

      const response = await api.post(
        `/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`,
        mealData
      );

      console.log("✅ Bữa ăn đã được thêm:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi thêm bữa ăn vào ngày:", error.response?.data || error.message);
      return { success: false, message: "Không thể thêm bữa ăn!" };
    }
  },

  // Xóa bữa ăn khỏi ngày
  removeMealFromDay: async (mealPlanId, mealDayId, mealId) => {
    try {
      console.log("📤 Gửi request DELETE để xóa bữa ăn:", mealId);

      const response = await api.delete(
        `/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}`
      );

      console.log("✅ Bữa ăn đã được xóa:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi xóa bữa ăn:", error.response?.data || error.message);
      return { success: false, message: "Không thể xóa bữa ăn!" };
    }
  },

  // 🔹 Thêm món ăn vào Meal
  addDishToMeal: async (mealPlanId, mealDayId, mealId, dish, userId) => {
    try {
      console.log("cos USERID", userId);

      // 🔍 Lấy danh sách món ăn hiện tại của Meal
      const mealsResponse = await api.get(
        `/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}`
      );

      const existingDishes = mealsResponse.data.data?.dishes || [];

      // ⚠️ Kiểm tra xem món ăn đã tồn tại hay chưa
      const isAlreadyAdded = existingDishes.some(
        (existingDish) => existingDish.dishId === dish.dishId
      );

      if (isAlreadyAdded) {
        console.warn("⚠️ Món ăn đã tồn tại trong bữa ăn!");
        return { success: false, message: "Món ăn này đã được thêm vào bữa ăn!" };
      }

      const dishData = {
        userId: userId,
        dishes: [dish], // 🔥 Gửi danh sách món ăn dưới dạng mảng
      };

      console.log(`📤 Gửi request POST với dữ liệu:`, dishData);

      const response = await api.post(
        `/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}/dishes`,
        dishData
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
      const response = await api.get(`/dishes`);

      console.log("📥 Danh sách món ăn từ API:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách món ăn:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy danh sách món ăn!" };
    }
  },

  deleteDishFromMeal: async (mealPlanId, mealDayId, mealId, dishId) => {
    try {
      const response = await api.delete(
        `/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}/dishes/${dishId}`
      );
      console.log("✅ Món ăn đã được xóa:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi xóa món ăn:", error.response?.data || error.message);
      return { success: false, message: "Không thể xóa món ăn!" };
    }
  },
  // Status MealPlan Pause/Resume
  toggleMealPlanStatus: async (mealPlanId, isPause) => {
    try {
      console.log(`📤 ${isPause ? "Tạm dừng" : "Tiếp tục"} MealPlan ID: ${mealPlanId}`);

      const response = await api.patch(`/mealPlan/${mealPlanId}/toggle`, { isPause });

      console.log(`✅ MealPlan đã được ${isPause ? "tạm dừng" : "tiếp tục"}:`, response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(
        `❌ Lỗi khi ${isPause ? "tạm dừng" : "tiếp tục"} MealPlan:`,
        error.response?.data || error.message
      );
      return {
        success: false,
        message: `Không thể ${isPause ? "tạm dừng" : "tiếp tục"} MealPlan!`,
      };
    }
  },
  // 🔹 Xóa MealPlan
  deleteMealPlan: async (id) => {
    try {
      console.log(`🗑️ Xóa MealPlan ID: ${id}`);

      await api.delete(`/mealPlan/${id}`);

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Xóa MealPlan thất bại!" };
    }
  },
};

export default mealPlanService;
