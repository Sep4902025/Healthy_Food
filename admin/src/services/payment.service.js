import axios from "axios";
import api from "./api";

const API_URL = process.env.REACT_APP_API_URL;

// Hàm lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const paymentService = {
  // Lấy lịch sử lương
  getSalaryHistoryByMonthYear: async (month, year, page = 1, limit = 10) => {
    try {
      const response = await api.get("/payment/salary-history-by-month-year", {
        params: { month, year, page, limit },
      });
      const data = response.data;

      if (data.status === "success") {
        return {
          success: true,
          data: data.data || [],
          pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
        };
      } else {
        return {
          success: false,
          message: data.message || "Không thể lấy lịch sử lương",
        };
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử lương:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể lấy lịch sử lương",
      };
    }
  },

  // Xác nhận lương và tạo URL thanh toán
  acceptSalary: async (userId, amount, month, year) => {
    try {
      const response = await api.post("/payment/accept-salary", {
        userId,
        amount,
        month,
        year,
      });
      const data = response.data;

      if (data.status === "success") {
        return {
          success: true,
          data: data.data || {},
        };
      } else {
        return {
          success: false,
          message: data.message || "Không thể xử lý thanh toán",
        };
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi server: Không thể xử lý thanh toán",
      };
    }
  },
};

export default paymentService;
