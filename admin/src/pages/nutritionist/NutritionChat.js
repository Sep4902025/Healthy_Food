import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ChatService from "../../services/chat.service";
import ChatWindow from "../../components/Chat/ChatWindow";

const ConversationItem = ({ conversation, onAccept, onCheck, onClick }) => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div
      className="p-3 border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick(conversation)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-sm truncate w-20">{conversation.userId.email}</h3>
          <p className="text-xs text-gray-500">{conversation.topic}</p>
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
                  className="px-2 py-1 text-xs text-gray-600 border rounded-full hover:bg-gray-100"
                >
                  Mark as Seen
                </button>
              )}
              <button
                onClick={() => onAccept(conversation._id)}
                className="px-2 py-1 text-xs text-white bg-[#40B491] rounded-full hover:bg-[#359c7a]"
              >
                Consult
              </button>
            </>
          )}
          {conversation.status === "checked" && (
            <span className="px-2 py-1 text-xs text-gray-500">Seen</span>
          )}
          {conversation.status === "active" && (
            <span className="px-2 py-1 text-xs text-[#40B491]">Consulting</span>
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
  const [error, setError] = useState(null);
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
    const interval = setInterval(() => {
      loadConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, user?._id]);

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

      setConversations(response?.data?.data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError("Failed to load conversations. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChat = async (conversationId) => {
    try {
      await ChatService.acceptConversation(conversationId, user._id);
      await loadConversations();
      setActiveTab("active");
      const updatedConversation = conversations.find((conv) => conv._id === conversationId);
      if (updatedConversation) {
        setSelectedConversation({ ...updatedConversation, status: "active" });
      }
    } catch (error) {
      console.error("Error accepting chat:", error);
      setError("Failed to accept conversation. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleMarkAsChecked = async (conversationId) => {
    try {
      await ChatService.markAsChecked(conversationId, user._id);
      await loadConversations();
    } catch (error) {
      console.error("Error marking as seen:", error);
      setError("Failed to mark as seen. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleUpdateConversation = (updatedConversation) => {
    setSelectedConversation(updatedConversation);
    setConversations((prev) =>
      prev.map((conv) => (conv._id === updatedConversation._id ? updatedConversation : conv))
    );
  };

  return (
    <div className="flex h-[calc(100vh-60px)]">
      <div className="flex flex-1">
        <div className="w-64 border-r flex flex-col h-[calc(100vh-60px)]">
          <div className="flex border-b">
            <button
              className={`flex-1 p-2 text-sm ${
                activeTab === "pending"
                  ? "border-b-2 border-[#40B491] text-[#40B491]"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`flex-1 p-2 text-sm ${
                activeTab === "checked"
                  ? "border-b-2 border-[#40B491] text-[#40B491]"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("checked")}
            >
              Seen
            </button>
            <button
              className={`flex-1 p-2 text-sm ${
                activeTab === "active"
                  ? "border-b-2 border-[#40B491] text-[#40B491]"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Messages
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">No conversations</div>
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

        <div className="flex-1 flex flex-col bg-white h-[calc(100vh-105px)]">
          {error && <div className="p-2 bg-red-100 text-red-700 text-sm text-center">{error}</div>}
          <div className="flex-1 overflow-hidden">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                setCurrentConversation={handleUpdateConversation}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Select a conversation to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionChat;
