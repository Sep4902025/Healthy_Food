import axiosInstance from "./axiosInstance";

export const getRatingsByRecipeId = async (recipeId) => {
    try {
        const response = await axiosInstance.get(`/comment/rate/${recipeId}`);
        return response;
    } catch (error) {
        console.log("getRatingsByRecipeId in service/commentService error : ", error);
        return error;
    }
};

export const rateRecipe = async (recipeId, userId, star) => {
    try {
        const response = await axiosInstance.post(`/comment/rate`, { recipeId, userId, star });
        return response;
    } catch (error) {
        console.log("rateRecipe in service/commentService error : ", error);
        return error;
    }
};