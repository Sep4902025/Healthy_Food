import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "./axiosInstance";

export const login = async ({ email, password }) => {
  try {
    const data = {
      email: email,
      password: password,
    };
    const response = await axiosInstance.post(`/users/login`, data);
    return response;
  } catch (error) {
    console.log("login in service/auth error : ", error);
    return error;
  }
};

export const loginGoogle = async ({ idToken }) => {
  try {
    const data = {
      idToken: idToken,
    };
    const response = await axiosInstance.post(`/users/login-google`, data);
    return response;
  } catch (error) {
    console.log("login in service/auth error : ", error);
    return error;
  }
};

export const signup = async ({ email, password, passwordConfirm, username }) => {
  try {
    const data = { email, password, passwordConfirm, username };
    const response = await axiosInstance.post("/users/signup", data);
    return response;
  } catch (error) {
    return error;
  }
};

// Request OTP (replaces requestEmailVerification)
export const resendOTP = async ({ email }) => {
  try {
    const response = await axiosInstance.post("/users/resend-otp", { email });
    console.log("RSO", response);

    return response.data; // Backend returns { success, status, message } or { success, error }
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const verifyOtp = async ({ email, otp }) => {
  try {
    const data = { email, otp };
    const response = await axiosInstance.post("/users/verify-otp", data);
    return response;
  } catch (error) {
    console.log("verifyOtp error: ", error);
    return error;
  }
};

export const requestOtp = async ({ email }) => {
  try {
    const data = { email };
    const response = await axiosInstance.post("/users/request-otp", data);
    return response;
  } catch (error) {
    console.log("requestOtp error: ", error);
    return error;
  }
};
export const logout = async () => {
  try {
    const response = await axiosInstance.post("/users/logout");
    return response;
  } catch (error) {
    console.log("logout error: ", error);
    return error;
  }
};

export const forgetPassword = async ({ email }) => {
  try {
    const data = { email };
    const response = await axiosInstance.post("/users/forget-password", data);
    return response;
  } catch (error) {
    console.log("forgetPassword error: ", error);
    return error;
  }
};

export const verifyAccount = async ({ email, otp }) => {
  try {
    const data = { email, otp };
    const response = await axiosInstance.post("/users/verify", data);
    return response;
  } catch (error) {
    console.log("verifyOtp error: ", error);
    return error;
  }
};

export const resetPassword = async ({ email, password, passwordConfirm }) => {
  try {
    const data = { email, password, passwordConfirm };

    const response = await axiosInstance.post("/users/reset-password", data);
    return response;
  } catch (error) {
    console.log("resetPassword error: ", error);
    return error;
  }
};

export const changePassword = async ({ currentPassword, newPassword, newPasswordConfirm }) => {
  try {
    const data = { currentPassword, newPassword, newPasswordConfirm };

    const response = await axiosInstance.post("/users/change-password", data);
    return response;
  } catch (error) {
    console.log("changePassword error: ", error);
    return error;
  }
};

export const updateUser = async (user) => {
  try {
    console.log(user);

    const response = await axiosInstance.put(`/users/${user?._id}`, user);
    return response;
  } catch (error) {
    console.log("updateUser error: ", error);
    return error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response;
  } catch (error) {
    console.log("deleteUser error: ", error);
    return error;
  }
};
export const requestDeleteAccount = async (email) => {
  try {
    if (!email) {
      return {
        success: false,
        message: "Email is required!",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Invalid email format!",
      };
    }

    const response = await axiosInstance.post("/users/request-delete-account", { email });

    const { success, message } = response.data;

    if (success) {
      console.log("requestDeleteAccount Response:", { message });

      return {
        success: true,
        message: message || "OTP has been sent to your email to confirm account deletion",
      };
    } else {
      return {
        success: false,
        message: message || "Unable to send account deletion request",
      };
    }
  } catch (error) {
    console.error("Error sending account deletion request:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error sending account deletion request",
      error: error.response?.status || 500,
    };
  }
};
export const confirmDeleteAccount = async (email, otp) => {
  try {
    // Validate inputs
    if (!email || !otp) {
      return {
        success: false,
        message: "Email and OTP are required!",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Invalid email format!",
      };
    }

    // Validate OTP format (4-digit number)
    const otpRegex = /^\d{4}$/;
    if (!otpRegex.test(otp)) {
      return {
        success: false,
        message: "Invalid OTP (must be 4 digits)!",
      };
    }

    // Send request to confirm account deletion
    const response = await axiosInstance.post("/users/confirm-delete-account", { email, otp });

    const { success, message } = response.data;

    if (success) {
      console.log("confirmDeleteAccount Response:", { message });

      // Remove token from AsyncStorage
      try {
        await AsyncStorage.removeItem("accessToken");
      } catch (storageError) {
        console.error("Error removing token from AsyncStorage:", storageError);
      }

      return {
        success: true,
        message: message || "Account has been successfully deleted",
      };
    } else {
      return {
        success: false,
        message: message || "Unable to delete account",
      };
    }
  } catch (error) {
    console.error("Error confirming account deletion:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error confirming account deletion",
      error: error.response?.status || 500,
    };
  }
};
