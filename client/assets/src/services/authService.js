import axiosInstance from "./axiosInstance"; 

export const login = async ({ email, password }) => {
  
  try {
    
    const data = {
      email: email,
      password: password,
    };
    const response = await axiosInstance.post(`api/v1/users/login`, data); 
   
    return response;
  } catch (error) {
    
    console.log("login in service/auth error : ", error); 
    return error;
  }
};


export const signup = async ({
  email,
  password,
  passwordConfirm,
  username,
}) => {
  try {
    const data = { email, password, passwordConfirm, username };
    const response = await axiosInstance.post("api/v1/users/signup", data);
    return response;
  } catch (error) {
   
    return error;
  }
};


export const resendOTP = async () => {
  try {
    const response = await axiosInstance.post("api/v1/users/resend-otp");
    return response;
  } catch (error) {
    console.log("resendOTP error: ", error);
    return error;
  }
};


export const logout = async () => {
  try {
    const response = await axiosInstance.post("api/v1/users/logout");
    return response;
  } catch (error) {
    console.log("logout error: ", error);
    return error;
  }
};


export const forgetPassword = async ({ email }) => {
  try {
    const data = { email };
    const response = await axiosInstance.post(
      "api/v1/users/forget-password",
      data
    );
    return response;
  } catch (error) {
    console.log("forgetPassword error: ", error);
    return error;
  }
};

export const verifyOtp = async ({ email, otp }) => {
  try {
    const data = { email, otp };
    const response = await axiosInstance.post("api/v1/users/verify", data);
    return response;
  } catch (error) {
    console.log("resetPassword error: ", error);
    return error;
  }
};

export const changePassword = async ({ email, password, passwordConfirm }) => {
  try {
    const data = { email, password, passwordConfirm };

    const response = await axiosInstance.post(
      "api/v1/users/reset-password",
      data
    );
    return response;
  } catch (error) {
    console.log("changePassword error: ", error);
    return error;
  }
};
