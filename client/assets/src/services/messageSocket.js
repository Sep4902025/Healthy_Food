import { io } from "socket.io-client";
import axiosInstance from "./axiosInstance";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;
console.log("SOCKET_URL", SOCKET_URL);

class MessageSocket {
  socket = null;
  connectionData = null;

  init = (data) => {
    if (!data?.token || !data?.userId) {
      console.error("Missing token or userId for socket initialization");
      return;
    }

    // Ngắt kết nối socket cũ nếu tồn tại
    if (this.socket) {
      this.disconnect();
    }

    console.log("Initializing socket with URL:", SOCKET_URL);
    console.log("Connection data:", data);

    this.connectionData = data;
    this.socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      withCredentials: true,
      auth: {
        token: data.token,
      },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected with userId:", data.userId);
      this.socket.emit("join", { userId: data.userId });
      if (data.conversationId) {
        this.joinRoom(data.conversationId);
      }
    });

    this.socket.on("reconnect", () => {
      console.log("Socket reconnected");
      if (this.connectionData) {
        this.socket.emit("join", { userId: this.connectionData.userId });
        if (this.connectionData.conversationId) {
          this.joinRoom(this.connectionData.conversationId);
        }
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected on app");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error on app:", error.message);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error on app:", error.message);
    });

    // Loại bỏ listener mặc định cho receive_message
    // Listener sẽ được đăng ký trong Message.jsx
  };

  disconnect = () => {
    if (this.socket) {
      console.log("Disconnecting socket on app");
      this.socket.disconnect();
      this.socket = null;
      this.connectionData = null;
    }
  };

  isConnected = () => {
    return this.socket && this.socket.connected;
  };

  emit = (event, data, callback) => {
    if (!this.socket) {
      console.warn("Socket not initialized");
      return;
    }
    if (!this.isConnected()) {
      console.warn("Socket not connected, retrying...");
      this.socket.connect();
      setTimeout(() => {
        if (this.isConnected()) {
          console.log(`Emitting event ${event} with data:`, data);
          this.socket.emit(event, data, callback);
        } else {
          console.error("Failed to reconnect socket");
        }
      }, 1000);
      return;
    }
    console.log(`Emitting event ${event} with data:`, data);
    this.socket.emit(event, data, callback);
  };

  on = (event, callback) => {
    if (this.socket) {
      console.log(`Registering listener for event: ${event}`);
      this.socket.on(event, callback);
    } else {
      console.warn("Socket not initialized");
    }
  };

  off = (event, callback) => {
    if (this.socket) {
      console.log(`Removing listener for event: ${event}`);
      this.socket.off(event, callback);
    }
  };

  joinRoom = (roomId) => {
    if (this.socket && roomId) {
      console.log("Joining room:", roomId);
      this.socket.emit("join_room", {
        conversationId: roomId,
        userId: this.connectionData?.userId,
      });
    }
  };

  leaveRoom = (roomId) => {
    if (this.socket && roomId) {
      console.log("Leaving room:", roomId);
      this.socket.emit("leave_room", { conversationId: roomId });
    }
  };

  sendTyping = (conversationId) => {
    this.emit("typing", conversationId);
  };

  stopTyping = (conversationId) => {
    this.emit("stop_typing", conversationId);
  };

  acceptConversationSocket = (conversationId) => {
    this.emit("accept_conversation", conversationId);
  };

  markAsCheckedSocket = (conversationId) => {
    this.emit("check_conversation", conversationId);
  };

  getMessages = async (conversationId) => {
    try {
      return await axiosInstance.get(`/conversations/${conversationId}/messages`);
    } catch (error) {
      console.error("Get messages error:", error);
      throw error;
    }
  };

  sendMessage = async (conversationId, messageData) => {
    try {
      const response = await axiosInstance.post(
        `/conversations/${conversationId}/messages`,
        messageData
      );
      return response;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  };

  getUserConversations = async (userId) => {
    try {
      return await axiosInstance.get(`/conversations/${userId}`);
    } catch (error) {
      console.error("Get user conversations error:", error);
      throw error;
    }
  };

  getPendingConversation = async () => {
    try {
      return await axiosInstance.get(`/conversations/pending`);
    } catch (error) {
      console.error("Get pending conversation error:", error);
      throw error;
    }
  };

  getCheckedConversation = async (nutritionistId) => {
    try {
      return await axiosInstance.get(`/conversations/${nutritionistId}/checked`);
    } catch (error) {
      console.error("Get checked conversation error:", error);
      throw error;
    }
  };

  getActiveConversation = async (nutritionistId) => {
    try {
      return await axiosInstance.get(`/conversations/${nutritionistId}/active`);
    } catch (error) {
      console.error("Get active conversation error:", error);
      throw error;
    }
  };

  createConversation = async (userId, topic) => {
    try {
      return await axiosInstance.post(`/conversations`, { userId, topic });
    } catch (error) {
      console.error("Create conversation error:", error);
      throw error;
    }
  };

  acceptConversation = async (conversationId, nutritionistId) => {
    try {
      const response = await axiosInstance.put(`/conversations/status/${conversationId}`, {
        status: "active",
        nutritionistId,
      });
      this.emit("accept_conversation", conversationId);
      return response;
    } catch (error) {
      console.error("Accept conversation error:", error);
      throw error;
    }
  };

  markAsChecked = async (conversationId, nutritionistId) => {
    try {
      const response = await axiosInstance.put(`/conversations/status/${conversationId}`, {
        status: "checked",
        nutritionistId,
      });
      this.emit("check_conversation", conversationId);
      return response;
    } catch (error) {
      console.error("Mark as checked error:", error);
      throw error;
    }
  };
}

export default new MessageSocket();
