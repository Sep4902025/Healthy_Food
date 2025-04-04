import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;
let socket = null;

const RemindService = {
  // Kết nối socket với userId
  connectSocket: async (userId) => {
    if (!userId) {
      console.error("❌ Không có userId để kết nối socket!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("🔍 Token trước khi gửi:", token);

      if (!socket) {
        socket = io(SOCKET_URL, {
          path: "/socket.io",
          transports: ["websocket", "polling"],
          secure: true,
          reconnection: true,
          rejectUnauthorized: false,
          autoConnect: false,
          auth: { token },
        });
      }

      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }

      socket.on("connect", () => {
        console.log("✅ Reminder socket connected for user:", userId);
        socket.emit("join", userId);
      });

      socket.on("connect_error", (error) => {
        console.error("⚠️ Lỗi kết nối socket:", error);
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy token:", error);
    }
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
      const token = await AsyncStorage.getItem("accessToken");
      console.log("TOKEN VALUE", token);
      const response = await fetch(`${SOCKET_URL}/reminders/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi lấy danh sách nhắc nhở");
      }
      return await response.json();
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
