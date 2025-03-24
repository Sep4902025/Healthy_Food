import axiosInstance from "./axiosInstance";

export const getIngredient = async (ingredientId) => {
  try {
    const response = await axiosInstance.get(
      `/ingredients${ingredientId ? `/${ingredientId}` : ""}`
    );
    return response;
  } catch (error) {
    console.log("getIngredientId in service/ingredient error : ", error);
    return error;
  }
};

export const getIngredientByName = async (name) => {
  try {
    const response = await axiosInstance.get(`/ingredients/search`, {
      params: { name },
    });
    return response;
  } catch (error) {
    console.log("getIngredientByName in service/ingredient error : ", error);
    return error;
  }
};

export const getIngredientByType = async (type) => {
  try {
    const response = await axiosInstance.get(`/ingredients/filter`, {
      params: { type },
    });
    return response;
  } catch (error) {
    console.log("getIngredientByType in service/ingredient error : ", error);
    return error;
  }
};
