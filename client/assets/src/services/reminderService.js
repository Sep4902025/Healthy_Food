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

      // Kiểm tra nếu socket đã tồn tại và userId không khớp
      if (socket && socket.userId && socket.userId !== userId) {
        console.log("🔄 UserId thay đổi, ngắt kết nối socket cũ...");
        socket.off("connect"); // Gỡ listener cũ
        socket.off("connect_error"); // Gỡ listener cũ
        socket.disconnect();
        socket = null;
      }

      // Khởi tạo socket mới nếu chưa có
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
        socket.userId = userId; // Lưu userId vào socket để so sánh sau này
      }

      socket.auth = { token };

      // Chỉ kết nối nếu socket chưa kết nối
      if (!socket.connected) {
        // Gỡ các listener cũ trước khi thêm listener mới
        socket.off("connect");
        socket.off("connect_error");

        socket.on("connect", () => {
          console.log("✅ Reminder socket connected for user:", userId);
          socket.emit("join", userId); // Tham gia phòng cho userId
        });

        socket.on("connect_error", (error) => {
          console.error("⚠️ Lỗi kết nối socket:", error);
        });

        socket.connect();
      } else {
        console.log("🔗 Socket đã kết nối, không cần kết nối lại.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy token:", error);
    }
  },

  listenReminder: (callback) => {
    if (!socket) return;

    // Gỡ sự kiện cũ và lắng nghe sự kiện mealReminder (đồng bộ với web)
    socket.off("mealReminder");
    socket.on("mealReminder", (data) => {
      console.log("🔔 Nhắc nhở nhận được:", data);
      callback(data);
    });
  },

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

  disconnect: () => {
    if (socket && socket.connected) {
      socket.off("connect"); // Gỡ listener
      socket.off("connect_error"); // Gỡ listener
      socket.off("mealReminder"); // Gỡ listener
      socket.disconnect();
      socket = null; // Làm sạch socket
      console.log("🔌 Reminder socket disconnected manually");
    }
  },
};

export default RemindService;
