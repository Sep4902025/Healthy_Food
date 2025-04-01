import axios from "axios";
import axiosInstance from "./axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const quizService = {
  submitQuizData: async (finalData) => {
    try {
      console.log("GOO");
      if (!finalData) {
        return {
          success: false,
          message: "No quiz data provided.",
        };
      }

      const response = await axiosInstance.post(`${API_URL}/userpreference`, finalData);
      await AsyncStorage.removeItem("quizData"); // Thay sessionStorage bằng AsyncStorage nếu dùng React Native

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Submit quiz error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Failed to submit quiz data.",
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
      console.log("🚀 Đang lấy sở thích người dùng với userPreferenceId:", userPreferenceId);
      const response = await axiosInstance.get(`${API_URL}/userpreference/${userPreferenceId}`);
      console.log("🚀 Phản hồi từ /userPreference:", response.data);

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
      const response = await axios.put(`${API_URL}/userPreference/${userId}`, updatedData);
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
