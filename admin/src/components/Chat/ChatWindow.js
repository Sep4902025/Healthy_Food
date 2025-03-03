import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ChatService from "../../services/chat.service";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const socketRef = useRef();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!conversation?._id || !user?._id) return;

    setMessages([]);
    isFirstLoad.current = true;
    loadMessages();

    const socket = ChatService.connectSocket(user._id);
    socketRef.current = socket;

    socket.emit("join_room", {
      conversationId: conversation._id,
      userId: user._id,
    });

    const handleNewMessage = (message) => {
      console.log("New message received:", message);
      if (message.conversationId === conversation._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket?.off("receive_message", handleNewMessage);
      socket?.disconnect();
    };
  }, [conversation?._id, user?._id]);

  useEffect(() => {
    if (!conversation?._id) return;

    const interval = setInterval(() => {
      refreshMessages();
    }, 10000); // đổi time reset ở đây

    return () => clearInterval(interval);
  }, [conversation?._id]);

  const loadMessages = async () => {
    try {
      setInitialLoading(true);
      const response = await ChatService.getMessages(conversation._id);
      if (response?.data?.data) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi load tin nhắn:", error);
    } finally {
      setInitialLoading(false);
      isFirstLoad.current = false;
    }
  };

  const refreshMessages = async () => {
    try {
      setRefreshing(true);
      const response = await ChatService.getMessages(conversation._id);
      if (response?.data?.data) {
        setMessages((prev) => {
          const newMessages = response.data.data;
          if (prev.length === newMessages.length) return prev;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Lỗi refresh tin nhắn:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendMessage = async (text) => {
    try {
      const messageData = {
        senderId: user._id,
        text,
        conversationId: conversation._id,
      };

      const response = await ChatService.sendMessage(conversation._id, messageData);
      if (response?.data?.data) {
        setMessages((prev) => [...prev, response.data.data]);
        socketRef.current.emit("send_message", {
          ...response.data.data,
          conversationId: conversation._id,
        });
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  const renderHeader = () => (
    <div className="p-4 border-b">
      <h2 className="font-medium">{conversation?.userId?.email}</h2>
      <p className="text-sm text-gray-500">{conversation?.topic}</p>
    </div>
  );

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span>Đang tải tin nhắn...</span>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Chọn một cuộc trò chuyện để bắt đầu
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {renderHeader()}
      <MessageList messages={messages} currentUserId={user._id} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
