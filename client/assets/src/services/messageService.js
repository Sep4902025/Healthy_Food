import io from "socket.io-client";
import axiosInstance from "./axiosInstance";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

// Thêm log để debug socket
const MessageService = {
  // Kết nối với socket khi người dùng vào chat
  connectSocket: (userId, callbacks = {}) => {
    if (socket.connected) {
      socket.disconnect();
    }

    const { onMessageReceived, onConversationUpdated, onUserStatus, onTypingStatus, onError } =
      callbacks;

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      if (onError) onError(error);
    });

    socket.on("connect", () => {
      console.log("Socket connected with userId:", userId);
      socket.emit("join", { userId });
    });

    socket.on("receive_message", (message) => {
      console.log("Received message:", message);
      if (onMessageReceived) onMessageReceived(message);
    });

    socket.on("conversationUpdated", (updatedConversation) => {
      console.log("Conversation updated:", updatedConversation);
      if (onConversationUpdated) onConversationUpdated(updatedConversation);
    });

    socket.on("user_status", (status) => {
      console.log("User status updated:", status);
      if (onUserStatus) onUserStatus(status);
    });

    socket.on("typing_status", (typingData) => {
      console.log("Typing status:", typingData);
      if (onTypingStatus) onTypingStatus(typingData);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error.message);
      if (onError) onError(error);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return socket;
  },

  // Ngắt kết nối socket
  disconnectSocket: () => {
    if (socket.connected) {
      console.log("🔌 Disconnecting socket...");
      socket.disconnect();
    }
  },

  // Gửi tin nhắn qua socket
  sendMessageSocket: (messageData) => {
    socket.emit("send_message", messageData);
  },

  // Đánh dấu đang nhập
  sendTyping: (conversationId) => {
    socket.emit("typing", conversationId);
  },

  // Dừng đánh dấu đang nhập
  stopTyping: (conversationId) => {
    socket.emit("stop_typing", conversationId);
  },

  // Chấp nhận cuộc trò chuyện qua socket
  acceptConversationSocket: (conversationId) => {
    socket.emit("accept_conversation", conversationId);
  },

  // Đánh dấu đã xem qua socket
  markAsCheckedSocket: (conversationId) => {
    socket.emit("check_conversation", conversationId);
  },

  // Lấy tin nhắn trong một cuộc trò chuyện
  getMessages: (conversationId) => {
    return axiosInstance.get(`/conversations/${conversationId}/messages`);
  },

  // Gửi tin nhắn qua API
  sendMessage: (conversationId, messageData) => {
    return axiosInstance.post(`/conversations/${conversationId}/messages`, messageData);
  },

  // Lấy các cuộc trò chuyện của user
  getUserConversations: (userId) => {
    return axiosInstance.get(`/conversations/${userId}`);
  },

  // Lấy tất cả cuộc trò chuyện đang chờ tư vấn
  getPendingConversation: () => {
    return axiosInstance.get(`/conversations/pending`);
  },

  // Lấy tất cả cuộc trò chuyện đã checked
  getCheckedConversation: (nutritionistId) => {
    return axiosInstance.get(`/conversations/${nutritionistId}/checked`);
  },

  // Lấy các cuộc trò chuyện đang hoạt động của nutritionist
  getActiveConversation: (nutritionistId) => {
    return axiosInstance.get(`/conversations/${nutritionistId}/active`);
  },

  // Tạo một cuộc trò chuyện mới
  createConversation: (data) => {
    return axiosInstance.post(`/conversations`, data);
  },

  // Chấp nhận một cuộc trò chuyện qua API
  acceptConversation: (conversationId, nutritionistId) => {
    return axiosInstance.put(`/conversations/status/${conversationId}`, {
      status: "active",
      nutritionistId,
    });
  },

  // Đánh dấu cuộc trò chuyện là đã xem qua API
  markAsChecked: (conversationId, nutritionistId) => {
    return axiosInstance.put(`/conversations/status/${conversationId}`, {
      status: "checked",
      nutritionistId,
    });
  },
};

export default MessageService;
