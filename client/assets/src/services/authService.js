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
