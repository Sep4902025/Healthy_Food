import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ChatService from "../../services/chat.service";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import uploadFile from "../../helpers/uploadFile";

const ChatWindow = ({ conversation, setCurrentConversation }) => {
  const [messages, setMessages] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const socketRef = useRef();
  const isFirstLoad = useRef(true);
  const chatContainerRef = useRef(null);
  const cancelUploadRef = useRef(null);

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
    }, 10000);

    return () => clearInterval(interval);
  }, [conversation?._id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setInitialLoading(true);
      const response = await ChatService.getMessages(conversation._id);
      if (response?.data?.data) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setError("Failed to load messages. Please try again.");
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
      console.error("Error refreshing messages:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendMessage = async (text) => {
    try {
      if (!text.trim() && !selectedFile) return;

      if (selectedFile) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
          setError("File is too large! Maximum size is 10MB.");
          setTimeout(() => setError(null), 5000);
          return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const responseData = await uploadFile(
          selectedFile,
          (progress) => setUploadProgress(progress),
          (cancel) => (cancelUploadRef.current = cancel)
        );

        setUploadProgress(100);

        const messageData = {
          senderId: user._id,
          conversationId: conversation._id,
          type: selectedFile.type.startsWith("image") ? "image" : "video",
          ...(selectedFile.type.startsWith("image")
            ? { imageUrl: responseData.secure_url }
            : { videoUrl: responseData.secure_url }),
        };

        const response = await ChatService.sendMessage(conversation._id, messageData);
        if (response?.data?.data) {
          setMessages((prev) => [...prev, response.data.data]);
          socketRef.current.emit("send_message", {
            ...response.data.data,
            conversationId: conversation._id,
          });

          const updatedConversation = {
            ...conversation,
            messages: [...(conversation.messages || []), response.data.data],
          };
          setCurrentConversation(updatedConversation);
          localStorage.setItem("currentConversation", JSON.stringify(updatedConversation));
        }

        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }

      if (text.trim()) {
        const messageData = {
          senderId: user._id,
          text,
          conversationId: conversation._id,
          type: "text",
        };

        const response = await ChatService.sendMessage(conversation._id, messageData);
        if (response?.data?.data) {
          setMessages((prev) => [...prev, response.data.data]);
          socketRef.current.emit("send_message", {
            ...response.data.data,
            conversationId: conversation._id,
          });

          const updatedConversation = {
            ...conversation,
            messages: [...(conversation.messages || []), response.data.data],
          };
          setCurrentConversation(updatedConversation);
          localStorage.setItem("currentConversation", JSON.stringify(updatedConversation));
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message or upload file. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCancelUpload = () => {
    if (cancelUploadRef.current) {
      cancelUploadRef.current();
    }
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedFile(null);
  };

  const renderHeader = () => (
    <div className="p-3 border-b border-gray-200">
      <h2 className="font-medium text-sm">{conversation?.userId?.email}</h2>
      <p className="text-xs text-gray-500">{conversation?.topic}</p>
    </div>
  );

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading messages...</span>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Select a conversation to start
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {renderHeader()}
      {error && <div className="p-2 bg-red-100 text-red-700 text-sm text-center">{error}</div>}
      <div ref={chatContainerRef} className="flex h-[310px] overflow-y-auto overflow-x-hidden p-3">
        <MessageList messages={messages} currentUserId={user._id} />
      </div>
      <div className="border-t border-gray-200">
        <ChatInput
          onSendMessage={handleSendMessage}
          conversation={conversation}
          setCurrentConversation={setCurrentConversation}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          uploadProgress={uploadProgress}
          setUploadProgress={setUploadProgress}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          user={user}
          onCancelUpload={handleCancelUpload}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
