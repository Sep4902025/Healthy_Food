import io from "socket.io-client";
import api from "./api";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

let socket = null;

const RemindService = {
  connectSocket: (userId) => {
    if (!userId) {
      console.error("❌ Không có userId để kết nối socket!");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("🔍 Token trước khi gửi:", token);

    if (socket && socket.userId && socket.userId !== userId) {
      socket.disconnect();
      socket = null;
    }

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
      socket.userId = userId;
    }

    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Reminder socket connected for user:", userId);
      // Thêm lại logic để tham gia phòng
      socket.emit("join", userId);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Lỗi kết nối socket:", error);
    });
  },

  listenReminder: (callback) => {
    if (!socket) return;

    socket.off("mealReminder");
    socket.on("mealReminder", (data) => {
      console.log("🔔 Nhắc nhở nhận được:", data);
      callback(data);
    });
  },

  disconnect: () => {
    if (socket && socket.connected) {
      socket.disconnect();
      socket = null;
      console.log("🔌 Reminder socket disconnected manually");
    }
  },
};

export default RemindService;
