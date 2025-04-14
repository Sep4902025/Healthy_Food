import { io } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;
class MessageSocket {
  socket = null;

  init = (data) => {
    if (this.socket) {
      console.log("Socket already initialized");
      return;
    }

    if (!data?.token || !data?.userId) {
      console.error("Missing token or userId for socket initialization");
      return;
    }

    this.socket = io(SOCKET_URL, {
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
      console.log("Connected to server:", data.userId);
      this.socket.emit("join", data.userId);
      // Thêm join conversationId nếu có
      if (data.conversationId) {
        this.socket.emit("join_room", {
          conversationId: data.conversationId,
          userId: data.userId,
        });
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
  };

  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  };

  isConnected = () => {
    return this.socket && this.socket.connected;
  };

  emit = (event, data) => {
    if (!this.socket) {
      console.warn("Socket not initialized");
      return;
    }
    if (!this.isConnected()) {
      console.warn("Socket not connected, retrying...");
      this.socket.connect();
      setTimeout(() => {
        if (this.isConnected()) {
          this.socket.emit(event, data);
        } else {
          console.error("Failed to reconnect socket");
        }
      }, 1000);
      return;
    }
    console.log(`Emitting event ${event} with data:`, data);
    this.socket.emit(event, data);
  };

  on = (event, callback) => {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn("Socket not initialized");
    }
  };

  off = (event) => {
    if (this.socket) {
      this.socket.off(event);
    }
  };

  joinRoom = (roomId) => {
    if (this.socket) {
      this.socket.emit("join_room", roomId);
    }
  };

  leaveRoom = (roomId) => {
    if (this.socket) {
      this.socket.emit("leave_room", roomId);
    }
  };
}

export default new MessageSocket();
