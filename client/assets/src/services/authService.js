import axios from "axios";
import axiosInstance from "./axiosInstance";

const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_URL;
const cloudinaryPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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

export const signup = async ({ email, password, passwordConfirm, username }) => {
  try {
    const data = { email, password, passwordConfirm, username };
    const response = await axiosInstance.post("/users/signup", data);
    return response;
  } catch (error) {
    return error;
  }
};

export const resendOTP = async () => {
  try {
    const response = await axiosInstance.post("/users/resend-otp");
    return response;
  } catch (error) {
    console.log("resendOTP error: ", error);
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

export const verifyOtp = async ({ email, otp }) => {
  try {
    const data = { email, otp };
    const response = await axiosInstance.post("/users/verify", data);
    return response;
  } catch (error) {
    console.log("resetPassword error: ", error);
    return error;
  }
};

export const changePassword = async ({ email, password, passwordConfirm }) => {
  try {
    const data = { email, password, passwordConfirm };

    const response = await axiosInstance.post("/users/reset-password", data);
    return response;
  } catch (error) {
    console.log("changePassword error: ", error);
    return error;
  }
};

export const updateUser = async (user) => {
  try {
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

export const uploadToCloudinary = async (uri) => {
  // Create form data
  const formData = new FormData();
  formData.append('file', {
    uri: uri,
    type: 'image/jpeg', // or the actual mime type
    name: 'upload.jpg',
  });
  formData.append('upload_preset', cloudinaryPreset); // Replace with your Cloudinary upload preset

  try {
    // Upload to Cloudinary

    const response = await axios.post(
      cloudinaryUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Get the secure URL from Cloudinary response
    const imageUrl = response?.data?.secure_url;

    return imageUrl
  } catch (error) {
    console.error('Upload error:', error);
    return error
  }
};