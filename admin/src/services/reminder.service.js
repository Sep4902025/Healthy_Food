import io from "socket.io-client";
import api from "./api";

// Lấy URL từ env
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

// Khởi tạo socket với autoConnect = false
let socket = null;

const RemindService = {
  // Kết nối socket với userId
  connectSocket: (userId) => {
    if (!userId) {
      console.error("❌ Không có userId để kết nối socket!");
      return;
    }

    // Lấy token mới nhất từ localStorage
    const token = localStorage.getItem("token");
    console.log("🔍 Token trước khi gửi:", token);

    // Khởi tạo socket nếu chưa có hoặc token thay đổi
    if (!socket) {
      socket = io(SOCKET_URL, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        secure: true,
        reconnection: true,
        rejectUnauthorized: false,
        autoConnect: false,
        auth: {
          token: token,
        },
      });
    }

    // Đảm bảo token đang sử dụng là token mới nhất
    socket.auth = { token };

    // Kết nối nếu chưa kết nối
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Reminder socket connected for user:", userId);

      // Tự động join vào room của user
      socket.emit("join", userId);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Lỗi kết nối socket:", error);
    });
  },

  // Lắng nghe thông báo nhắc nhở từ server
  listenReminder: (callback) => {
    if (!socket) return;

    socket.off("receive_reminder"); // Đảm bảo không đăng ký nhiều lần
    socket.on("receive_reminder", (data) => {
      console.log("🔔 Nhắc nhở nhận được:", data);
      callback(data);
    });
  },

  // Lấy danh sách nhắc nhở từ API
  getReminders: async (userId) => {
    try {
      const response = await api.get(`/reminders/${userId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách nhắc nhở:", error);
      throw error;
    }
  },

  // Ngắt kết nối socket
  disconnect: () => {
    if (socket && socket.connected) {
      socket.disconnect();
      console.log("🔌 Reminder socket disconnected manually");
    }
  },
};

export default RemindService;
