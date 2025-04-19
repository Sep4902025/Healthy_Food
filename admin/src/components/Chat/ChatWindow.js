import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ChatService from "../../services/chat.service";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import uploadFile from "../../helpers/uploadFile";

const ChatWindow = ({ conversation, setCurrentConversation }) => {
  const [messages, setMessages] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const socketRef = useRef();
  const chatContainerRef = useRef(null);
  const cancelUploadRef = useRef(null);

  useEffect(() => {
    if (!conversation?._id || !user?._id) {
      console.warn("Missing conversation or user ID, skipping initialization");
      return;
    }

    setMessages([]);
    setInitialLoading(true);
    loadMessages();

    const socket = ChatService.connectSocket(user._id, conversation._id, {
      onMessageReceived: handleNewMessage,
      onError: (err) => {
        console.error("Socket error:", err);
        setError("Failed to connect to chat server. Please try again.");
        setTimeout(() => setError(null), 5000);
      },
    });
    socketRef.current = socket;

    return () => {
      socket?.disconnect();
    };
  }, [conversation?._id, user?._id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await ChatService.getMessages(conversation._id);
      if (response?.data?.data) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setError("Failed to load messages. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.conversationId === conversation._id) {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    }
  };

  const handleSendMessage = async (text) => {
    try {
      if (!text.trim() && !selectedFile) return;

      let messageData = {
        senderId: user._id,
        conversationId: conversation._id,
        type: "text",
      };

      // Xử lý file (ảnh hoặc video) nếu có
      if (selectedFile) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
          setError("File is too large! Maximum size is 10MB.");
          setTimeout(() => setError(null), 5000);
          return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        console.log("Uploading file:", selectedFile);
        const responseData = await uploadFile(
          selectedFile,
          (progress) => setUploadProgress(progress),
          (cancel) => (cancelUploadRef.current = cancel)
        );

        console.log("Upload response:", responseData);

        if (!responseData?.secure_url) {
          throw new Error("Failed to upload file: No secure_url returned");
        }

        messageData = {
          ...messageData,
          type: selectedFile.type.startsWith("image") ? "image" : "video",
          ...(selectedFile.type.startsWith("image")
            ? { imageUrl: responseData.secure_url }
            : { videoUrl: responseData.secure_url }),
        };

        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }

      // Thêm text nếu có
      if (text.trim()) {
        messageData.text = text;
      }

      console.log("Sending messageData:", messageData);
      const response = await ChatService.sendMessage(conversation._id, messageData);
      console.log("Send message response:", response);

      if (response?.data?.data) {
        const newMessage = response.data.data;
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        const updatedConversation = {
          ...conversation,
          messages: [...(conversation.messages || []), newMessage],
          lastMessage:
            newMessage.text || newMessage.imageUrl || newMessage.videoUrl || "New message",
          updatedAt: newMessage.updatedAt,
        };
        setCurrentConversation(updatedConversation);
        localStorage.setItem("currentConversation", JSON.stringify(updatedConversation));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", error.response?.data || error.message);
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

  if (!conversation || !user) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Select a conversation to start
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {renderHeader()}
      {error && <div className="p-2 bg-red-100 text-red-700 text-sm text-center">{error}</div>}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-[200px] overflow-y-auto overflow-x-hidden px-3"
      >
        <MessageList messages={messages} currentUserId={user._id} />
      </div>
      <div className="border-t border-gray-200 mt-1">
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
