import axiosInstance from "./axiosInstance";

export const getFavoriteList = async (userId) => {
  try {
    const response = await axiosInstance.get(`api/v1/favoriteDishes/${userId}`);
    return response;
  } catch (error) {
    console.log("getFavoriteList in service/dishes error : ", error);
    return error;
  }
};

export const addDishFavorite = async (userId, dishId) => {
  try {
    const data = {
      userId,
      dishId,
    };

    const response = await axiosInstance.post(`api/v1/favoriteDishes`, data);
    return response;
  } catch (error) {
    console.log("getFavoriteList in service/dishes error : ", error);
    return error;
  }
};

export const removeDishFavorite = async (userId, dishId) => {
  try {
    const data = {
      userId,
      dishId,
    };
    console.log(data);

    const response = await axiosInstance.delete(`api/v1/favoriteDishes`, {
      data,
    });
    return response;
  } catch (error) {
    console.log("removeDishFavorite in service/dishes error : ", error);
    return error;
  }
};
