const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

function initializeChatSocket(io) {
  // Middleware xác thực socket với JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Authentication error: No token provided");

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded.id; // Thêm userId vào socket
      console.log("✅ SOCKET.USERID:", socket.userId);
      next();
    } catch (err) {
      console.error("❌ Authentication error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.userId);

    socket.on("join", async ({ userId }) => {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("user_status", { userId, isOnline: true });
        socket.join(userId); // Tham gia room của userId để nhận tin nhắn
      } catch (err) {
        console.error("❌ Error updating user status:", err);
      }
    });

    socket.on("send_message", async (messageData) => {
      try {
        const { conversationId, senderId, text, imageUrl, videoUrl } = messageData;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Kiểm tra quyền gửi tin nhắn
        const isUser = senderId === conversation.userId.toString();
        const isNutritionist =
          conversation.nutritionistId && senderId === conversation.nutritionistId.toString();
        if (!isUser && !isNutritionist) throw new Error("Not authorized");

        const newMessage = new Message({
          conversationId,
          senderId,
          text,
          imageUrl,
          videoUrl,
        });
        await newMessage.save();

        conversation.messages.push(newMessage._id);
        conversation.lastMessage = text || imageUrl || videoUrl || "New message";
        conversation.updatedAt = Date.now();
        await conversation.save();

        // Gửi tin nhắn đến cả user và nutritionist
        io.to(conversation.userId.toString()).emit("receive_message", newMessage);
        if (conversation.nutritionistId) {
          io.to(conversation.nutritionistId.toString()).emit("receive_message", newMessage);
        }
      } catch (err) {
        console.error("❌ Error sending message:", err);
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("typing", (conversationId) => {
      socket.broadcast.emit("typing_status", {
        conversationId,
        isTyping: true,
        userId: socket.userId,
      });
    });

    socket.on("stop_typing", (conversationId) => {
      socket.broadcast.emit("typing_status", {
        conversationId,
        isTyping: false,
        userId: socket.userId,
      });
    });

    socket.on("accept_conversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");
        if (conversation.nutritionistId) throw new Error("Conversation already assigned");

        conversation.nutritionistId = socket.userId;
        conversation.status = "active";
        await conversation.save();

        // Phát sự kiện cập nhật cho cả user và nutritionist
        io.to(conversation.userId.toString()).emit("conversationUpdated", conversation);
        io.to(socket.userId).emit("conversationUpdated", conversation);
      } catch (err) {
        console.error("❌ Error accepting conversation:", err);
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("check_conversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");
        if (conversation.nutritionistId) throw new Error("Conversation already assigned");

        if (!conversation.checkedBy.includes(socket.userId)) {
          conversation.checkedBy.push(socket.userId);
        }
        conversation.status = "checked";
        await conversation.save();

        // Phát sự kiện cập nhật cho cả user và nutritionist
        io.to(conversation.userId.toString()).emit("conversationUpdated", conversation);
        io.to(socket.userId).emit("conversationUpdated", conversation);
      } catch (err) {
        console.error("❌ Error checking conversation:", err);
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("disconnect", async () => {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastActive: new Date(),
        });
        io.emit("user_status", { userId: socket.userId, isOnline: false });
        console.log("🔴 User disconnected:", socket.userId);
      } catch (err) {
        console.error("❌ Error updating user status on disconnect:", err);
      }
    });
  });
}

module.exports = initializeChatSocket;
