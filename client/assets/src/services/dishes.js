import axiosInstance from "./axiosInstance";

export const getDishes = async (dishid) => {
  try {
    const response = await axiosInstance.get(
      `api/v1/dishes${dishid ? `/${dishid}` : ""}`
    );
    return response;
  } catch (error) {
    console.log("getDishes in service/dishes error : ", error);
    return error;
  }
};

export const createDishes = async (dishid) => {
  try {
    const response = await axiosInstance.get(
      `api/v1/dishes${dishid ? `/${dishid}` : ""}`
    );
    return response;
  } catch (error) {
    console.log("getDishes in service/dishes error : ", error);
    return error;
  }
};

export const getRecipesById = async (dishId, recipeId) => {
  try {
    const response = await axiosInstance.get(
      `api/v1/dishes${dishId ? `/${dishId}` : ""}/recipes${
        recipeId ? `/${recipeId}` : ""
      }`
    );
    return response;
  } catch (error) {
    console.log("getRecipesById in service/dishes error : ", error);
    return error;
  }
};
