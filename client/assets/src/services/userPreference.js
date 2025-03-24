import axiosInstance from "./axiosInstance"; 

export const getUserPreference = async (userId) => {
  try {
    const response = await axiosInstance.get(`api/v1/userPreference/${userId}`);
    return response;
  } catch (error) {
    console.log("getUserPreference error: ", error);
    return error;
  }
};

export const createUserPreference = async (data) => {
  try {
    const response = await axiosInstance.post(`api/v1/userPreference`, data);
    return response;
  } catch (error) {
    console.log("createUserPreference error: ", error);
    return error;
  }
};

export const updateUserPreference = async (data) => {
  try {
    const response = await axiosInstance.put(
      `api/v1/userPreference/${data?._id}`,
      data
    );
    return response;
  } catch (error) {
    console.log("updateUserPreference error: ", error);
    return error;
  }
};
