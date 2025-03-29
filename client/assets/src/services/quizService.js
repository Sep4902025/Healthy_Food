import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const quizService = {
  submitQuizData: async () => {
    try {
      // Lấy dữ liệu từ sessionStorage
      const finalData = JSON.parse(sessionStorage.getItem("finalData"));
      console.log("FINALDATA", finalData);
      if (!finalData) {
        return {
          success: false,
          message: "No quiz data found in sessionStorage.",
        };
      }

      // Gửi dữ liệu lên BE
      const response = await axios.post(`${API_URL}/userPreference`, finalData);

      // Xoá dữ liệu sau khi gửi thành công
      sessionStorage.removeItem("quizData");
      sessionStorage.removeItem("finalData");

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to submit quiz data.",
      };
    }
  },

  getUserPreference: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/userPreference/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch user preference.",
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
