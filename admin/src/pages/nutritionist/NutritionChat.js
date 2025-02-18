import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ChatService from "../../services/chat.service";
import ChatWindow from "../../components/Chat/ChatWindow";

// Component hiển thị item trong danh sách chat
const ConversationItem = ({ conversation, onAccept, onCheck, onClick }) => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div
      className="p-4 border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick(conversation)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{conversation.userId.email}</h3>
          <p className="text-sm text-gray-500">{conversation.topic}</p>
          <p className="text-xs text-gray-400">
            {new Date(conversation.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {conversation.status === "pending" && (
            <>
              {!conversation.checkedBy.includes(user._id) && (
                <button
                  onClick={() => onCheck(conversation._id)}
                  className="px-3 py-1 text-sm text-gray-600 border rounded-full hover:bg-gray-100"
                >
                  Đã xem
                </button>
              )}
              <button
                onClick={() => onAccept(conversation._id)}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded-full hover:bg-blue-600"
              >
                Tư vấn
              </button>
            </>
          )}
          {conversation.status === "checked" && (
            <span className="px-3 py-1 text-sm text-gray-500">Đã xem</span>
          )}
          {conversation.status === "active" && (
            <span className="px-3 py-1 text-sm text-green-500">Đang tư vấn</span>
          )}
        </div>
      </div>
    </div>
  );
};

const NutritionChat = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedConversation) {
      const updatedConversation = conversations.find(
        (conv) => conv._id === selectedConversation._id
      );
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }
    }
  }, [conversations]);

  useEffect(() => {
    loadConversations();
    // Tải lại danh sách cuộc trò chuyện sau 30 giây
    const interval = setInterval(() => {
      loadConversations();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [activeTab]);

  const loadConversations = async () => {
    try {
      if (loading || !user?._id) return;
      setLoading(true);

      let response;
      switch (activeTab) {
        case "pending":
          response = await ChatService.getPendingConversation();
          break;
        case "checked":
          response = await ChatService.getCheckedConversation(user._id);
          break;
        case "active":
          response = await ChatService.getActiveConversation(user._id);
          break;
        default:
          return;
      }

      if (response?.data?.data) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChat = async (conversationId) => {
    try {
      await ChatService.acceptConversation(conversationId, user._id);
      await loadConversations();
      setActiveTab("active");
    } catch (error) {
      console.error("Lỗi chấp nhận chat:", error);
    }
  };

  const handleMarkAsChecked = async (conversationId) => {
    try {
      await ChatService.markAsChecked(conversationId, user._id);
      await loadConversations();
    } catch (error) {
      console.error("Lỗi đánh dấu đã xem:", error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar danh sách chat */}
      <div className="w-80 border-r">
        <div className="flex border-b">
          <button
            className={`flex-1 p-4 ${activeTab === "pending" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Chờ tư vấn
          </button>
          <button
            className={`flex-1 p-4 ${activeTab === "checked" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("checked")}
          >
            Đã xem
          </button>
          <button
            className={`flex-1 p-4 ${activeTab === "messages" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Tin nhắn
          </button>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Không có cuộc trò chuyện</div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv._id}
                conversation={conv}
                onAccept={handleAcceptChat}
                onCheck={handleMarkAsChecked}
                onClick={handleSelectConversation}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionChat;
