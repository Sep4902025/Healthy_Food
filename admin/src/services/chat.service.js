import io from "socket.io-client";
import api from "./api";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
console.log("SOCKET_URL", SOCKET_URL);

// Lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem("token");
  console.log("🔍 Token trước khi gửi:", token);
  return token;
};

// Khởi tạo socket
const createSocket = () => {
  const token = getToken();
  if (!token) {
    console.warn("No token found, socket connection skipped");
    return null;
  }

  return io(SOCKET_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    secure: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    rejectUnauthorized: false,
    withCredentials: true,
    auth: { token },
  });
};

let socket = createSocket();

const ChatService = {
  connectSocket: (userId, conversationId, callbacks = {}) => {
    if (!userId) {
      console.error("userId is required to connect socket");
      return null;
    }

    // Nếu socket không tồn tại hoặc đã ngắt, tạo mới
    if (!socket || socket.disconnected) {
      socket = createSocket();
    }

    const { onMessageReceived, onConversationUpdated, onUserStatus, onTypingStatus, onError } =
      callbacks;

    socket.on("connect", () => {
      console.log("Socket connected with userId:", userId);
      socket.emit("join", { userId });
      if (conversationId) {
        console.log("Joining room:", conversationId);
        socket.emit("join_room", { conversationId, userId });
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      if (onError) onError(error);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error.message);
      if (onError) onError(error);
    });

    socket.on("reconnect", () => {
      console.log("Socket reconnected");
      socket.emit("join", { userId });
      if (conversationId) {
        console.log("Rejoining room:", conversationId);
        socket.emit("join_room", { conversationId, userId });
      }
    });

    socket.on("receive_message", (message) => {
      console.log("Received message on web:", message);
      if (onMessageReceived) onMessageReceived(message);
    });

    socket.on("conversationUpdated", (updatedConversation) => {
      console.log("Conversation updated on web:", updatedConversation);
      if (onConversationUpdated) onConversationUpdated(updatedConversation);
    });

    socket.on("user_status", (status) => {
      console.log("User status updated on web:", status);
      if (onUserStatus) onUserStatus(status);
    });

    socket.on("typing_status", (typingData) => {
      console.log("Typing status on web:", typingData);
      if (onTypingStatus) onTypingStatus(typingData);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected on web");
    });

    return socket;
  },

  disconnectSocket: () => {
    if (socket && socket.connected) {
      console.log("🔌 Disconnecting socket...");
      socket.disconnect();
    }
  },

  sendMessageSocket: (messageData) => {
    if (socket && socket.connected) {
      socket.emit("send_message", messageData);
    } else {
      console.warn("Socket is not connected, cannot send message");
    }
  },

  sendTyping: (conversationId) => {
    if (socket && socket.connected) {
      socket.emit("typing", conversationId);
    }
  },

  stopTyping: (conversationId) => {
    if (socket && socket.connected) {
      socket.emit("stop_typing", conversationId);
    }
  },

  acceptConversationSocket: (conversationId) => {
    if (socket && socket.connected) {
      socket.emit("accept_conversation", conversationId);
    }
  },

  markAsCheckedSocket: (conversationId) => {
    if (socket && socket.connected) {
      socket.emit("check_conversation", conversationId);
    }
  },

  getMessages: (conversationId) => {
    return api.get(`/conversations/${conversationId}/messages`);
  },

  sendMessage: (conversationId, messageData) => {
    return api.post(`/conversations/${conversationId}/messages`, messageData);
  },

  getUserConversations: async (userId) => {
    try {
      return await api.get(`/conversations/${userId}`);
    } catch (error) {
      console.error("Get user conversations error:", error);
      throw error;
    }
  },

  getPendingConversation: () => {
    return api.get(`/conversations/pending`);
  },

  getCheckedConversation: (nutritionistId) => {
    return api.get(`/conversations/${nutritionistId}/checked`);
  },

  getActiveConversation: (nutritionistId) => {
    return api.get(`/conversations/${nutritionistId}/active`);
  },

  createConversation: async (userId, topic) => {
    try {
      const response = await api.post(`/conversations`, { userId, topic });
      return response.data; // Return { status, data } as is
    } catch (error) {
      console.error("Create conversation error:", error);
      throw error.response?.data || { message: error.message, status: 500 }; // Standardize error format
    }
  },

  acceptConversation: (conversationId, nutritionistId) => {
    return api.put(`/conversations/status/${conversationId}`, {
      status: "active",
      nutritionistId,
    });
  },

  markAsChecked: (conversationId, nutritionistId) => {
    return api.put(`/conversations/status/${conversationId}`, {
      status: "checked",
      nutritionistId,
    });
  },
};

export default ChatService;
