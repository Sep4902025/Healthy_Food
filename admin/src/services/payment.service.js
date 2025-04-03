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
  getSalaryHistory: async () => {
    try {
      const response = await api.get("/payment/salary-history/all", {
        headers: getAuthHeaders(),
      });
      const data = response.data;

      if (data.status === "success") {
        return {
          success: true,
          data: data.data, // Danh sách lịch sử lương
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch salary history",
        };
      }
    } catch (error) {
      console.error(
        "Error fetching salary history:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Error fetching salary history",
      };
    }
  },

  // Xác nhận lương và tạo URL thanh toán
  acceptSalary: async (nutriId, amount) => {
    try {
      const response = await api.post(
        "/payment/vnpay/salary",
        {
          nutriId,
          amount,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );
      const data = response.data;

      if (data.status === "success") {
        return {
          success: true,
          data: {
            paymentUrl: data.paymentUrl, // URL thanh toán
          },
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to generate payment URL",
        };
      }
    } catch (error) {
      console.error(
        "Error processing salary:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Error processing salary",
      };
    }
  },
};

export default paymentService;
