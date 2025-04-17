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

export const resetUserPreference = async (userPreferenceId) => {
  try {
    const response = await axiosInstance.put(`/userPreference/reset/${userPreferenceId}`);
    console.log("LOIXO", response);

    return { success: true, data: response.data };
  } catch (error) {
    console.log("resetUserPreference error: ", error);
    return { success: false, error };
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
