import axiosInstance from "./axiosInstance"; // Import axiosInstance

const mealPlanService = {
  // Service: Lấy tất cả MealPlan cho admin
  getAllMealPlanAdmin: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get("/mealPlan/admin", {
        params: {
          page,
          limit,
          sort: "createdAt",
          order: "desc",
        },
      });
      const data = response.data;

      if (data.status === "success") {
        const mealPlans = data.data.mealPlans || [];
        const total = data.results || 0;
        const totalPages = data.totalPages || 1;

        const summary = data.data.summary || {
          totalMealPlans: total,
          unpaidMealPlans: 0,
          activeMealPlans: 0,
        };

        console.log("Summary from API (Admin):", summary);

        return {
          success: true,
          data: {
            mealPlans,
            summary,
          },
          total,
          totalPages,
        };
      } else {
        return {
          success: false,
          message: data.message || "Không thể lấy danh sách MealPlan",
        };
      }
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách MealPlan cho admin:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy danh sách MealPlan",
      };
    }
  },

  // Lấy danh sách tất cả nutritionist và meal plan của họ
  getAllNutritionistsWithMealPlans: async (page = 1, limit = 10, month, year) => {
    try {
      const response = await axiosInstance.get("/mealPlan/nutritionists", {
        params: {
          page,
          limit,
          sort: "username",
          order: "asc",
          month,
          year,
        },
      });
      const data = response.data;

      if (data.status === "success") {
        const nutritionists = data.data.nutritionists || [];
        const total = data.results || 0;
        const totalPages = data.totalPages || 1;

        return {
          success: true,
          data: {
            nutritionists,
          },
          total,
          totalPages,
        };
      } else {
        console.warn("API returned non-success status:", data);
        return {
          success: false,
          message: data.message || "Không thể lấy danh sách nutritionist",
        };
      }
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách nutritionist và meal plan:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Lỗi server: Không thể lấy danh sách nutritionist",
      };
    }
  },

  // Service: Lấy MealPlan do nutritionist tạo
  getAllMealPlanNutritionistCreatedBy: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get("/mealPlan/nutritionist/created", {
        params: {
          page,
          limit,
          sort: "createdAt",
          order: "desc",
        },
      });
      const data = response.data;

      if (data.status === "success") {
        const mealPlans = data.data.mealPlans || [];
        const total = data.results || 0;
        const totalPages = data.totalPages || 1;

        const summary = data.data.summary || {
          totalMealPlans: total,
          unpaidMealPlans: 0,
          activeMealPlans: 0,
        };

        console.log("Summary from API (Nutritionist):", summary);

        return {
          success: true,
          data: {
            mealPlans,
            summary,
          },
          total,
          totalPages,
        };
      } else {
        return {
          success: false,
          message: data.message || "Không thể lấy danh sách MealPlan",
        };
      }
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách MealPlan cho nutritionist:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy danh sách MealPlan",
      };
    }
  },

  // Lấy chi tiết một MealPlan theo ID
  getMealPlanById: async (id) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/${id}`);
      console.log("🔍 Chi tiết MealPlan:", response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealPlan:", error.response?.data || error.message);
      return { success: false, message: "Không tìm thấy MealPlan!" };
    }
  },

  // Lấy meal plan cần thanh toán của user
  getUnpaidMealPlanForUser: async (userId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/users/${userId}/unpaid`);
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
      console.error(
        "❌ Lỗi khi lấy MealPlan cần thanh toán:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: "Không tìm thấy MealPlan cần thanh toán!",
      };
    }
  },

  // Xem chi tiết meal plan (bao gồm các ngày và món ăn)
  getMealPlanDetails: async (mealPlanId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/${mealPlanId}/details`);
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
      const response = await axiosInstance.get(`/mealPlan/users/${userId}/history`);
      const historyData = response.data.data || [];
      console.log(`History for user ${userId}:`, historyData);
      return { success: true, data: historyData };
    } catch (error) {
      console.error("❌ Lỗi khi lấy lịch sử Meal Plan:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy lịch sử Meal Plan!" };
    }
  },

  // Lấy lịch sử giao dịch của user
  getPaymentHistory: async (userId, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/payment/history/${userId}`, {
        params: { page, limit },
      });
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

  // Tạo yêu cầu thanh toán cho meal plan
  createMealPlanPayment: async (userId, mealPlanId, amount) => {
    try {
      const response = await axiosInstance.post(`/payment/vnpay/app/pay`, {
        userId,
        mealPlanId,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error("Error in createMealPlanPayment:", error.response?.data || error.message);
      return { success: false, message: error.message };
    }
  },

  // Kiểm tra trạng thái thanh toán của meal plan
  checkPaymentStatus: async (paymentId) => {
    try {
      console.log(`Fetching payment status for paymentId: ${paymentId}`);
      const response = await axiosInstance.get(`/payment/status/${paymentId}`);
      console.log(`Response for payment ${paymentId}:`, response.data);

      if (response.data.status === "success") {
        const paymentData = response.data.data;
        console.log("🔍 Trạng thái thanh toán:", paymentData);

        // Kiểm tra các trường bắt buộc
        if (!paymentData.status || !paymentData.amount) {
          console.warn("⚠️ Payment data thiếu trường cần thiết:", paymentData);
          return {
            success: false,
            message: "Dữ liệu thanh toán không hợp lệ",
          };
        }

        return {
          success: true,
          data: paymentData,
        };
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
  // Hàm mới: Gọi vnp_ReturnUrl_App để lấy kết quả thanh toán
  checkPaymentReturnUrl: async (returnUrl) => {
    try {
      const response = await axiosInstance.get(returnUrl, {
        responseType: "text", // Vì backend trả về HTML
      });
      console.log(`Response from vnp_ReturnUrl_App:`, response.data);
      // Kiểm tra HTML trả về để xác định trạng thái
      const isSuccess = response.data.includes("Thành công");
      return {
        success: isSuccess,
        message: isSuccess
          ? "Thanh toán hoàn tất. Đang quay lại..."
          : "Thanh toán không thành công.",
      };
    } catch (error) {
      console.error("❌ Lỗi khi gọi vnp_ReturnUrl_App:", error.response?.data || error.message);
      return {
        success: false,
        message: "Không thể kiểm tra kết quả thanh toán.",
      };
    }
  },

  // Lấy MealPlan hiện tại của user
  getUserMealPlan: async (userId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy meal plan của user:", error);
      throw error;
    }
  },

  // Lấy danh sách MealDays theo MealPlan ID
  getMealDaysByMealPlan: async (mealPlanId) => {
    try {
      const response = await axiosInstance.get(`/mealPlan/${mealPlanId}/mealdays`);
      console.log("🔍 Danh sách MealDays:", response.data);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDays:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDays" };
    }
  },

  getMealDayById: async (mealPlanId, mealDayId) => {
    try {
      const response = await axiosInstance.get(
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals`
      );
      return { success: true, data: response.data.data || {} };
    } catch (error) {
      console.error("❌ Lỗi khi lấy MealDay:", error.response?.data || error.message);
      return { success: false, message: "Không thể lấy MealDay" };
    }
  },

  // Lấy danh sách Meals theo MealDay ID
  getMealsByMealDay: async (mealPlanId, mealDayId) => {
    try {
      const response = await axiosInstance.get(
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals`
      );
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
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals/${mealId}`
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

  // Thêm bữa ăn vào ngày
  addMealToDay: async (mealPlanId, mealDayId, mealData) => {
    try {
      console.log("📤 Gửi request POST để thêm bữa ăn:", mealData);
      const response = await axiosInstance.post(
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals`,
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
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals/${mealId}`
      );
      console.log("✅ Bữa ăn đã được xóa:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Lỗi khi xóa bữa ăn:", error.response?.data || error.message);
      return { success: false, message: "Không thể xóa bữa ăn!" };
    }
  },

  // Add dish to Meal
  addDishToMeal: async (mealPlanId, mealDayId, mealId, dish) => {
    try {
      const mealsResponse = await axiosInstance.get(
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals/${mealId}`
      );
      const existingDishes = mealsResponse.data.data?.dishes || [];
      const isAlreadyAdded = existingDishes.some(
        (existingDish) => existingDish.dishId === dish.dishId
      );
      if (isAlreadyAdded) {
        console.warn("⚠️ Dish already exists in the meal!");
        return {
          success: false,
          message: "This dish has already been added to the meal!",
        };
      }
      const dishData = {
        dishes: [dish],
      };
      console.log(`📤 Sending POST request with data:`, dishData);
      const response = await axiosInstance.post(
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals/${mealId}/dishes`,
        dishData
      );
      console.log("✅ Dish added successfully:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ Error adding dish to Meal:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Failed to add dish!";
      return { success: false, message: errorMessage };
    }
  },

  getAllDishes: async (page, limit, search = "") => {
    try {
      const response = await axiosInstance.get("/dishes", {
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
      const response = await axiosInstance.delete(
        `/mealPlan/${mealPlanId}/mealdays/${mealDayId}/meals/${mealId}/dishes/${dishId}`
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
      const response = await axiosInstance.patch(`/mealPlan/${mealPlanId}/toggle`, {
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

  // Cập nhật hàm getPaymentHistoryForNutritionist
  getPaymentHistoryForNutritionist: async () => {
    try {
      const response = await axiosInstance.get(`/payment/history/nutritionist`);
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
        error: error.response?.status,
      };
    }
  },

  // Xóa MealPlan
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

  calculateSalary: async (nutriId) => {
    try {
      const response = await axiosInstance.get(`/payment/calculate-salary/${nutriId}`);
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
      const response = await axiosInstance.post("/payment/send-salary-email", {
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
