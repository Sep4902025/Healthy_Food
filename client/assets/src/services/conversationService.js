import axiosInstance from "./axiosInstance";

export const getUserConversations = async (userId) => {
  try {
    const response = await axiosInstance.get(`/conversations/${userId}`);
    return response;
  } catch (error) {
    console.log("getUserConversations in service/conversations error : ", error);
    return error;
  }
};

export const createConversation = async (userId, topic) => {
  try {
    const data = {
      userId: userId,
      topic: topic,
    };
    const response = await axiosInstance.get(`/conversations`, data);
    return response;
  } catch (error) {
    console.log("createConversation in service/conversations error : ", error);
    return error;
  }
};

export const getConversationMessage = async (conversationId) => {
  try {
    const response = await axiosInstance.get(`/conversations/${conversationId}/messages`);
    return response;
  } catch (error) {
    console.log("getConversationMessage in service/conversations error : ", error);
    return error;
  }
};
