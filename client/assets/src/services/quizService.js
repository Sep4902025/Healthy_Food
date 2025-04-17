import axios from "axios";
import axiosInstance from "./axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const quizService = {
  submitQuizData: async (finalData) => {
    try {
      console.log("GOO");
      console.log("final", finalData);

      if (!finalData) {
        return {
          success: false,
          message: "No quiz data provided.",
        };
      }

      const response = await axiosInstance.post(`/userpreference`, finalData);
      console.log("REU", response.data);

      // await AsyncStorage.removeItem("quizData"); // Thay sessionStorage bằng AsyncStorage nếu dùng React Native

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Submit quiz error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Failed to submit quiz data.",
      };
    }
  },
  // Lấy danh sách món ăn đề xuất cho người dùng dựa trên userId với phân trang
  getForyou: async (userId, page = 1, limit = 10) => {
    try {
      if (!userId) {
        return {
          success: false,
          message: "userId là bắt buộc!",
        };
      }

      // Gửi request với query parameters page và limit
      const response = await axiosInstance.get(`/foryou/${userId}`, {
        params: {
          page,
          limit,
        },
      });

      const { success, message, data } = response.data;

      if (success) {
        return {
          success: true,
          message: message || "Danh sách món ăn được lấy thành công",
          dishes: data.items, // Danh sách món ăn trong trang hiện tại
          pagination: {
            // Thông tin phân trang
            totalItems: data.totalItems,
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            itemsPerPage: data.itemsPerPage,
          },
        };
      } else {
        return {
          success: false,
          message: message || "Không thể lấy danh sách món ăn",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi lấy danh sách món ăn",
      };
    }
  },
  getUserPreferenceByUserPreferenceId: async (userPreferenceId) => {
    if (!userPreferenceId) {
      return {
        success: false,
        message: "userPreferenceId là bắt buộc để lấy sở thích người dùng",
      };
    }

    try {
      const response = await axiosInstance.get(`${API_URL}/userpreference/${userPreferenceId}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy sở thích người dùng",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Lỗi trong getUserPreferenceByUserPreferenceId:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy sở thích người dùng",
      };
    }
  },

  updateUserPreference: async (userId, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/userpreference/${userId}`, updatedData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to update user preference.",
      };
    }
  },

  deleteUserPreference: async (userPreferenceId) => {
    console.log("preferenceId", userPreferenceId);
    try {
      const response = await axios.delete(`${API_URL}/userpreference/${userPreferenceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete user preference.",
      };
    }
  },
};

export default quizService;
