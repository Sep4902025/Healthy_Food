import axiosInstance from "./axiosInstance";
import messageSocket from "./messageSocket";

const MessageService = {
  sendTyping: (conversationId) => {
    messageSocket.emit("typing", conversationId);
  },

  stopTyping: (conversationId) => {
    messageSocket.emit("stop_typing", conversationId);
  },

  acceptConversationSocket: (conversationId) => {
    messageSocket.emit("accept_conversation", conversationId);
  },

  markAsCheckedSocket: (conversationId) => {
    messageSocket.emit("check_conversation", conversationId);
  },

  getMessages: (conversationId) => {
    return axiosInstance.get(`/conversations/${conversationId}/messages`);
  },

  sendMessage: (conversationId, messageData) => {
    return axiosInstance.post(`/conversations/${conversationId}/messages`, messageData);
  },

  getUserConversations: (userId) => {
    return axiosInstance.get(`/conversations/${userId}`);
  },

  getPendingConversation: () => {
    return axiosInstance.get(`/conversations/pending`);
  },

  getCheckedConversation: (nutritionistId) => {
    return axiosInstance.get(`/conversations/${nutritionistId}/checked`);
  },

  getActiveConversation: (nutritionistId) => {
    return axiosInstance.get(`/conversations/${nutritionistId}/active`);
  },

  createConversation: (userId, topic) => {
    return axiosInstance.post(`/conversations`, { userId, topic });
  },

  acceptConversation: (conversationId, nutritionistId) => {
    return axiosInstance.put(`/conversations/status/${conversationId}`, {
      status: "active",
      nutritionistId,
    });
  },

  markAsChecked: (conversationId, nutritionistId) => {
    return axiosInstance.put(`/conversations/status/${conversationId}`, {
      status: "checked",
      nutritionistId,
    });
  },
};

export default MessageService;
