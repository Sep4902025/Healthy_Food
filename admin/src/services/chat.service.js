import io from "socket.io-client";
import api from "./api";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
console.log("SOCKET_URL", SOCKET_URL);

// Lấy token từ localStorage
const token = localStorage.getItem("token");
console.log("🔍 Token trước khi gửi:", token);
// Cấu hình socket với options
const socket = io(SOCKET_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  secure: true,
  reconnection: true,
  rejectUnauthorized: false,
  // Thêm các options để tránh duplicate messages
  forceNew: true,
  multiplex: false,
  auth: {
    token: token, // 🛠 Truyền token vào auth
  },
});

// Thêm log để debug socket
const ChatService = {
  // Kết nối với socket khi người dùng vào chat
  connectSocket: (userId) => {
    if (socket.connected) {
      socket.disconnect();
    }

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("connect", () => {
      console.log("Socket connected with userId:", userId);
      socket.emit("join", { userId });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return socket;
  },
  // ⬇️ Thêm hàm disconnect
  disconnectSocket: () => {
    if (socket.connected) {
      console.log("🔌 Disconnecting socket...");
      socket.disconnect();
    }
  },
  // Lấy tin nhắn trong một cuộc trò chuyện
  getMessages: (conversationId) => {
    return api.get(`/conversations/${conversationId}/messages`);
  },

  // Gửi tin nhắn
  sendMessage: (conversationId, messageData) => {
    return api.post(`/conversations/${conversationId}/messages`, messageData);
  },

  // Lấy các cuộc trò chuyện đang hoạt động của nutritionist
  getUserConversations: (userId) => {
    return api.get(`/conversations/${userId}`);
  },

  // Lấy tất cả cuộc trò chuyện đang chờ tư vấn
  getPendingConversation: () => {
    return api.get(`/conversations/pending`);
  },

  // Lấy tất cả cuộc trò chuyện đã checked
  getCheckedConversation: (nutritionistId) => {
    return api.get(`/conversations/${nutritionistId}/checked`);
  },

  // Chấp nhận một cuộc trò chuyện
  getActiveConversation: (nutritionistId) => {
    return api.get(`/conversations/${nutritionistId}/active`);
  },

  // Tạo một cuộc trò chuyện mới
  createConversation: (data) => {
    return api.post(`/conversations`, data);
  },

  // Thêm các hàm còn thiếu
  acceptConversation: (conversationId, nutritionistId) => {
    return api.put(`/conversations/nutritionist/status/${conversationId}`, {
      status: "active",
      nutritionistId,
    });
  },

  markAsChecked: (conversationId, nutritionistId) => {
    return api.put(`/conversations/nutritionist/status/${conversationId}`, {
      status: "checked",
      nutritionistId,
    });
  },
};

export default ChatService;
