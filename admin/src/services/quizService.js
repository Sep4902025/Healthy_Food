import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const quizService = {
  submitQuizData: async () => {
    const finalData = JSON.parse(sessionStorage.getItem("finalData"));
    if (!finalData) {
      console.error("🚨 finalData not found in sessionStorage");
      return {
        success: false,
        message: "Quiz data not found in sessionStorage",
      };
    }

    if (!finalData.userId || !finalData.email || !finalData.name) {
      console.error("🚨 finalData missing required fields:", finalData);
      return {
        success: false,
        message: "Submitted data missing required fields: userId, email, name",
      };
    }

    try {
      console.log("🚀 Submitting quiz data:", finalData);
      const response = await axios.post(
        `${API_URL}/userpreference`,
        finalData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Response from /userpreference:", response.data);

      if (!response.data.success) {
        console.error("🚨 API returned success: false:", response.data);
        return {
          success: false,
          message: response.data.message || "Unable to submit quiz data",
        };
      }

      if (!response.data.data || !response.data.data.user) {
        console.error("🚨 No user data in response:", response.data);
        return {
          success: false,
          message: "No user data returned from API",
        };
      }

      sessionStorage.removeItem("finalData");
      sessionStorage.removeItem("quizData");

      return {
        success: true,
        message: response.data.message || "Quiz submitted successfully",
        user: response.data.data.user,
        userPreference: response.data.data.userPreference, // Added userPreference for potential use
      };
    } catch (error) {
      console.error("🚨 Error in submitQuizData:", error.message);
      console.error("🚨 Error details:", error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || "Unable to submit quiz data",
      };
    }
  },

  getUserPreferenceByUserPreferenceId: async (userPreferenceId) => {
    if (!userPreferenceId) {
      return {
        success: false,
        message: "userPreferenceId is required to fetch user preferences",
      };
    }

    try {
      console.log(
        "🚀 Fetching user preferences with userPreferenceId:",
        userPreferenceId
      );
      const response = await axios.get(
        `${API_URL}/userpreference/${userPreferenceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Response from /userPreference:", response.data);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Unable to fetch user preferences",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Error in getUserPreferenceByUserPreferenceId:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Unable to fetch user preferences",
      };
    }
  },

  deleteUserPreference: async (userPreferenceId) => {
    if (!userPreferenceId) {
      return {
        success: false,
        message: "userPreferenceId is required to delete user preferences",
      };
    }

    try {
      console.log(
        "🚀 Deleting user preferences with userPreferenceId:",
        userPreferenceId
      );
      const response = await axios.delete(
        `${API_URL}/userpreference/${userPreferenceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Response from /userPreference delete:", response.data);

      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message || "User preferences deleted successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Unable to delete user preferences",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Error in deleteUserPreference:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Unable to delete user preferences",
      };
    }
  },

  updateUserPreference: async (userPreferenceId, updatedData) => {
    console.log("UPI", userPreferenceId);
    if (!userPreferenceId) {
      return {
        success: false,
        message: "userPreferenceId is required to update user preferences",
      };
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return {
        success: false,
        message: "Update data cannot be empty",
      };
    }

    // Filter out undefined fields to avoid sending invalid data
    const filteredData = Object.fromEntries(
      Object.entries(updatedData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredData).length === 0) {
      return {
        success: false,
        message: "No valid data to update",
      };
    }

    try {
      console.log(
        "🚀 Updating user preferences with userPreferenceId:",
        userPreferenceId
      );
      console.log("🚀 Update data (after filtering):", filteredData);

      const response = await axios.put(
        `${API_URL}/userpreference/${userPreferenceId}`,
        filteredData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("🚀 Response from /userpreference update:", response.data);

      // Synchronize response format with how UserProfileUpdate handles it
      return {
        success: response.data.success || true, // Use API success if available; otherwise, default to true
        message:
          response.data.message || "User preferences updated successfully",
      };
    } catch (error) {
      console.error(
        "🚨 Error in updateUserPreference:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Unable to update user preferences",
      };
    }
  },

  deleteUserByUserId: async (userId, password) => {
    if (!userId) {
      return {
        success: false,
        message: "userId is required to delete user",
      };
    }

    try {
      console.log("🚀 Deleting user with userId:", userId);
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { password }, // Gửi mật khẩu trong body
      });
      console.log("🚀 Response from /user delete:", response.data);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || "User deleted successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Unable to delete user",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Error in deleteUserByUserId:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Unable to delete user",
      };
    }
  },

  updateUserById: async (userId, updatedData) => {
    if (!userId) {
      return {
        success: false,
        message: "userId is required to update user information",
      };
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return {
        success: false,
        message: "Update data cannot be empty",
      };
    }

    try {
      console.log("🚀 Updating user information with userId:", userId);
      console.log("🚀 Update data:", updatedData);

      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚀 Response from /users update:", response.data);

      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message || "User information updated successfully",
          data: response.data.data, // Return updated user data if available
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Unable to update user information",
        };
      }
    } catch (error) {
      console.error(
        "🚨 Error in updateUserById:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Unable to update user information",
      };
    }
  },
};

export default quizService;
