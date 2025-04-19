import axiosInstance from "./axiosInstance";

export const getUserPreference = async (userId) => {
  try {
    const response = await axiosInstance.get(`/userPreference/${userId}`);
    return response;
  } catch (error) {
    console.log("getUserPreference error: ", error);
    return error;
  }
};

export const deleteUserPreference = async (userPreferenceId) => {
  try {
    const response = await axiosInstance.delete(`/userpreference/${userPreferenceId}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "User preference has been permanently deleted",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to delete user preference",
      };
    }
  } catch (error) {
    console.error("deleteUserPreference error:", error);
    const message =
      error.response?.data?.message || "An error occurred while deleting user preference";
    return {
      success: false,
      message,
      status: error.response?.status, // Include status for session error handling
    };
  }
};

export const createUserPreference = async (data) => {
  try {
    const response = await axiosInstance.post(`/userPreference`, data);
    return response;
  } catch (error) {
    console.log("createUserPreference error: ", error);
    return error;
  }
};

export const updateUserPreference = async (data) => {
  try {
    const response = await axiosInstance.put(`/userpreference/${data?._id}`, data);
    return response;
  } catch (error) {
    console.log("updateUserPreference error: ", error);
    return error;
  }
};
