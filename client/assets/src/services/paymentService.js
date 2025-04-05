import axiosInstance from "./axiosInstance";

export const createPayment = async (userId, mealPlanId, amount) => {
    try {
        const data = {
            userId: userId,
            mealPlanId: mealPlanId,
            amount: amount
        }
        const response = await axiosInstance.post(`/payment/vnpay/pay`, data);
        return response;
    } catch (error) {
        console.log("createPayment in service/dishes error : ", error);
        return error;
    }
};