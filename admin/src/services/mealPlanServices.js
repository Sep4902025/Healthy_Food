import axios from "axios";
import api from "./api";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const mealPlanService = {
  // Lấy danh sách meal plans với phân trang
  getAllMealPlans: async (page, limit) => {
    try {
      const response = await api.get(`/mealPlan`, {
        params: {
          page,
          limit,
          sort: "createdAt", // Sắp xếp theo thời gian tạo
          order: "desc", // Giảm dần (mới nhất trước)
        },
      });

      const data = response.data.data;
      console.log("Meal Plans for page", page, ":", data);

      return {
        success: true,
        data: data.mealPlans || [],
        total: data.totalItems || 0,
        totalPages: data.totalPages || 1,
      };
    } catch (error) {
      console.error("Error fetching meal plans:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Unable to fetch meal plans",
      };
    }
  },

  // Các hàm khác giữ nguyên...
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

  getUnpaidMealPlanForUser: async (userId) => {
    try {
      const response = await api.get(`/mealPlan/user/${userId}/unpaid`);
      console.log("🔍 MealPlan cần thanh toán:", response.data);
      return {
        success: response.data.status === "success",
        data: response.data.status === "success" ? response.data.data : null,
        message:
          response.data.status !== "success"
            ? response.data.message || "No unpaid meal plan found"
            : undefined,
      };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealPlan cần thanh toán:", error.response?.data || error.message);
      return { success: false, message: "Không tìm thấy MealPlan cần thanh toán!" };
    }
  },

  getMealPlanDetails: async (mealPlanId) => {
    try {
      const response = await api.get(`/mealPlan/details/${mealPlanId}`);
      console.log("🔍 Chi tiết MealPlan (bao gồm ngày và món ăn):", response.data);
      return {
        success: response.data.status === "success",
        data: response.data.status === "success" ? response.data.data : null,
        message:
          response.data.status !== "success"
            ? response.data.message || "Cannot fetch meal plan details"
            : undefined,
      };
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy chi tiết MealPlan!" };
    }
  },

  getMealPlanHistory: async (userId) => {
    try {
      const response = await api.get(`/mealPlan/history/${userId}`);
      const historyData = response.data.data || [];
      console.log(`History for user ${userId}:`, historyData);
      return { success: true, data: historyData };
    } catch (error) {
      console.error("❌ Lỗi khi lấy lịch sử Meal Plan:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy lịch sử Meal Plan!" };
    }
  },

  getPaymentHistory: async (userId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/payment/history/${userId}?page=${page}&limit=${limit}`);
      console.log("🔍 Lịch sử giao dịch:", response.data);
      return {
        success: response.data.status === "success",
        data: response.data.status === "success" ? response.data.data : null,
        pagination:
          response.data.status === "success"
            ? response.data.pagination || {
                currentPage: page,
                totalPages: 1,
                totalItems: response.data.data.length,
              }
            : undefined,
        message:
          response.data.status !== "success"
            ? response.data.message || "No payment history found"
            : undefined,
      };
    } catch (error) {
      console.error("❌ Lỗi khi lấy lịch sử giao dịch:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy lịch sử giao dịch!" };
    }
  },

  createMealPlanPayment: async (userId, mealPlanId, amount) => {
    try {
      const response = await api.post(`/payment/vnpay/pay`, {
        userId,
        mealPlanId,
        amount,
      });
      console.log("🔍 URL thanh toán:", response.data);
      return {
        success: response.data.status === "success",
        paymentUrl: response.data.status === "success" ? response.data.paymentUrl : undefined,
        paymentId: response.data.status === "success" ? response.data.paymentId : undefined,
        message:
          response.data.status !== "success"
            ? response.data.message || "Failed to create payment URL"
            : undefined,
      };
    } catch (error) {
      console.error("❌ Lỗi khi tạo URL thanh toán:", error.response?.data || error.message);
      return { success: false, message: "Không thể tạo URL thanh toán!" };
    }
  },

  checkPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payment/status/${paymentId}`);
      console.log(`Response for payment ${paymentId}:`, response.data);
      if (response.data.status === "success") {
        const paymentData = response.data.data;
        console.log("🔍 Trạng thái thanh toán:", paymentData);
        if (!paymentData.status || !paymentData.paymentDate || !paymentData.amount) {
          console.warn("⚠️ Payment data thiếu trường cần thiết:", paymentData);
        }
        return { success: true, data: paymentData };
      } else {
        return {
          success: false,
          message: response.data.message || "Cannot check payment status",
        };
      }
    } catch (error) {
      console.error(
        "❌ Lỗi khi kiểm tra trạng thái thanh toán:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: "Không thể kiểm tra trạng thái thanh toán!",
      };
    }
  },

  getUserMealPlan: async (userId) => {
    try {
      const response = await api.get(`/mealPlan/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy meal plan của user:", error);
      throw error;
    }
  },

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

  getMealDayById: async (mealPlanId, mealDayId) => {
    try {
      const response = await api.get(`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`);
      return { success: true, data: response.data.data || {} };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDay:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDay" };
    }
  },

  getMealsByMealDay: async (mealPlanId, mealDayId) => {
    try {
      const response = await api.get(`/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal`);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy Meals:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy Meals" };
    }
  },

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

  addDishToMeal: async (mealPlanId, mealDayId, mealId, dish, userId) => {
    try {
      console.log("cos USERID", userId);
      const mealsResponse = await api.get(
        `/mealPlan/${mealPlanId}/mealDay/${mealDayId}/meal/${mealId}`
      );
      const existingDishes = mealsResponse.data.data?.dishes || [];
      const isAlreadyAdded = existingDishes.some(
        (existingDish) => existingDish.dishId === dish.dishId
      );
      if (isAlreadyAdded) {
        console.warn("⚠️ Món ăn đã tồn tại trong bữa ăn!");
        return {
          success: false,
          message: "Món ăn này đã được thêm vào bữa ăn!",
        };
      }
      const dishData = {
        userId: userId,
        dishes: [dish],
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

  getAllDishes: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`${API_URL}/dishes`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        params: {
          page,
          limit,
          search,
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

  toggleMealPlanStatus: async (mealPlanId, isPause) => {
    try {
      console.log(`📤 ${isPause ? "Pausing" : "Resuming"} MealPlan ID: ${mealPlanId}`);
      const response = await api.patch(`/mealPlan/${mealPlanId}/toggle`, {
        isPause,
      });
      console.log(`✅ MealPlan has been ${isPause ? "paused" : "resumed"}:`, response.data);
      if (response.data.success) {
        if (response.data.message?.includes("failed to update reminders")) {
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

  getPaymentHistoryForNutritionist: async () => {
    try {
      const response = await api.get(`/payment/history/nutritionist`);
      console.log("🔍 Raw response from /payment/history/nutritionist:", response.data);
      if (response.data.success) {
        const payments = response.data.data || [];
        console.log("🔍 All Payments fetched in service:", payments);
        return { success: true, data: payments };
      } else {
        console.log("⚠️ API returned non-success status:", response.data);
        return {
          success: false,
          message: response.data.message || "No payment history found",
        };
      }
    } catch (error) {
      console.error("❌ Error fetching payment history:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Cannot fetch payment history!",
        error: error.response?.status
      };
    }
  },

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

  calculateSalary: async (nutriId) => {
    try {
      const response = await api.get(`/payment/calculate-salary/${nutriId}`);
      return {
        success: response.data.status === "success",
        data: response.data.data,
        message: response.data.message || "Tính lương thành công",
      };
    } catch (error) {
      console.error("❌ Lỗi khi tính lương:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể tính lương",
      };
    }
  },

  sendSalaryEmail: async (nutriId) => {
    try {
      const response = await api.post("/payment/send-salary-email", {
        nutriId,
      });
      return {
        success: response.data.status === "success",
        message: response.data.message || "Email gửi thành công",
      };
    } catch (error) {
      console.error("❌ Lỗi khi gửi email lương:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể gửi email lương",
      };
    }
  },
};

export default mealPlanService;
