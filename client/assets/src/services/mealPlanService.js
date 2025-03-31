import axiosInstance from "./axiosInstance";

const mealPlanService = {
  // Lấy danh sách meal plans với phân trang
  getAllMealPlans: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/mealPlan?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data.data.mealPlans,
        total: response.data.results,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      console.error("Error fetching meal plans:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Unable to fetch meal plans",
      };
    }
  },

  // 🔹 Lấy chi tiết một MealPlan theo ID
  getMealPlanById: async (id) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/${id}`);
<<<<<<< HEAD
      console.log("🔍 Chi tiết MealPlan:", response.data);
=======
>>>>>>> 168395b (App v3)
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Không tìm thấy MealPlan!" };
    }
  },
  // 🔹 Lấy meal plan cần thanh toán của user
  getUnpaidMealPlanForUser: async (userId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/user/${userId}/unpaid`);
      if (response.data.status === "success") {
        console.log("🔍 MealPlan cần thanh toán:", response.data.data);
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message || "No unpaid meal plan found" };
      }
    } catch (error) {
      console.error(
        "❌ Lỗi khi lấy MealPlan cần thanh toán:",
        error.response?.data || error.message
      );
      return { success: false, message: "Không tìm thấy MealPlan cần thanh toán!" };
    }
  },

  // 🔹 Xem chi tiết meal plan (bao gồm các ngày và món ăn)
  getMealPlanDetails: async (mealPlanId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/details/${mealPlanId}`);
      if (response.data.status === "success") {
        console.log("🔍 Chi tiết MealPlan (bao gồm ngày và món ăn):", response.data.data);
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          message: response.data.message || "Cannot fetch meal plan details",
        };
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy chi tiết MealPlan!" };
    }
  },

  // 🔹 Lấy lịch sử giao dịch của user
  getPaymentHistory: async (userId, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(
        `/payment/history/${userId}?page=${page}&limit=${limit}`
      );
      if (response.data.status === "success") {
        console.log("🔍 Lịch sử giao dịch:", response.data.data);
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: response.data.data.length,
          },
        };
      } else {
        return { success: false, message: response.data.message || "No payment history found" };
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy lịch sử giao dịch:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy lịch sử giao dịch!" };
    }
  },

  // 🔹 Tạo yêu cầu thanh toán cho meal plan
  createMealPlanPayment: async (userId, mealPlanId, amount) => {
    try {
      const response = await axiosInstance.post(`/payment/vnpay/pay`, {
        userId,
        mealPlanId,
        amount,
      });
      if (response.data.status === "success") {
        console.log("🔍 URL thanh toán:", response.data.paymentUrl);
        return {
          success: true,
          paymentUrl: response.data.paymentUrl,
          paymentId: response.data.paymentId,
        };
      } else {
        return { success: false, message: response.data.message || "Failed to create payment URL" };
      }
    } catch (error) {
      console.error("❌ Lỗi khi tạo URL thanh toán:", error.response?.data || error.message);
      return { success: false, message: "Không thể tạo URL thanh toán!" };
    }
  },

  // 🔹 Kiểm tra trạng thái thanh toán của meal plan
  checkPaymentStatus: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payment/status/${paymentId}`);
      if (response.data.status === "success") {
        console.log("🔍 Trạng thái thanh toán:", response.data.data);
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message || "Cannot check payment status" };
      }
    } catch (error) {
      console.error(
        "❌ Lỗi khi kiểm tra trạng thái thanh toán:",
        error.response?.data || error.message
      );
      return { success: false, message: "Không thể kiểm tra trạng thái thanh toán!" };
    }
  },

  // Lấy MealPlan hiện tại của user
  getUserMealPlan: async (userId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy meal plan của user:", error);
      throw error;
    }
  },

  // 🔹 Lấy danh sách MealDays theo MealPlan ID
  getMealDaysByMealPlan: async (mealPlanId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/${mealPlanId}/mealDay`);
<<<<<<< HEAD
      console.log("🔍 Danh sách MealDays:", response.data);
=======
>>>>>>> 168395b (App v3)
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDays:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDays" };
    }
  },
  // In your mealPlanService, add this function:
  getMealDayById: async (mealPlanId, mealDayId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`);
      return { success: true, data: response.data.data || {} };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDay:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDay" };
    }
  },
  // 🔹 Lấy danh sách Meals theo MealDay ID
  getMealsByMealDay: async (mealPlanId, mealDayId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy Meals:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy Meals" };
    }
  },
  // Lấy chi tiết một bữa ăn cụ thể
  getMealByMealId: async (mealPlanId, mealDayId, mealId) => {
    try {
      const response = await axiosInstance.get(
        `/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}`
      );
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
      const response = await axiosInstance.post(`/mealPlan`, requestData);
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

      const response = await axiosInstance.post(
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

      const response = await axiosInstance.delete(
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
      const mealsResponse = await axiosInstance.get(
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

      const response = await axiosInstance.post(
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

  // 🔹 Lấy tất cả món ăn với phân trang
  getAllDishes: async (page, limit, search = "") => {
    try {
      const response = await axiosInstance.get("/dishes", {
        params: {
          page,
          limit,
          search, // Thêm tham số tìm kiếm
        },
      });
      console.log("🔍 Danh sách món ăn từ API:", response.data);
      return {
        success: true,
        data: {
          items: response.data.data.items || [],
          total: response.data.data.total || 0,
          currentPage: response.data.data.currentPage || page,
          totalPages: response.data.data.totalPages || 1,
        },
      };
    } catch (error) {
      console.error("❌ Lỗi khi lấy món ăn:", error.response?.data || error.message);
      return { success: false, message: "Lỗi khi tải danh sách món ăn" };
    }
  },

  deleteDishFromMeal: async (mealPlanId, mealDayId, mealId, dishId) => {
    try {
      const response = await axiosInstance.delete(
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
      console.log(`📤 ${isPause ? "Pausing" : "Resuming"} MealPlan ID: ${mealPlanId}`);

      const response = await axiosInstance.patch(`/mealPlan/${mealPlanId}/toggle`, { isPause });

      console.log(`✅ MealPlan has been ${isPause ? "paused" : "resumed"}:`, response.data);

      // Check if the response indicates success, even if reminders failed
      if (response.data.success) {
        if (response.data.message.includes("failed to update reminders")) {
          console.warn("⚠️ Reminders could not be updated:", response.data.message);
        }
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          message: response.data.message || `Could not ${isPause ? "pause" : "resume"} MealPlan!`,
        };
      }
    } catch (error) {
      console.error(
        `❌ Error while ${isPause ? "pausing" : "resuming"} MealPlan:`,
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || `Could not ${isPause ? "pause" : "resume"} MealPlan!`,
      };
    }
  },
  // 🔹 Xóa MealPlan
  deleteMealPlan: async (id) => {
    try {
      console.log(`🗑️ Xóa MealPlan ID: ${id}`);

      await axiosInstance.delete(`/mealPlan/${id}`);

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi khi xóa MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Xóa MealPlan thất bại!" };
    }
  },
};

<<<<<<< HEAD
export default mealPlanService;
=======
export default mealPlanService;
>>>>>>> 168395b (App v3)
