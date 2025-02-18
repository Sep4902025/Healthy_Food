import React, { useRef, useEffect } from "react";

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {Array.isArray(messages) &&
        messages.map((message) => (
          <div
            key={message._id}
            className={`mb-4 ${message.senderId === currentUserId ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.senderId === currentUserId ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {message.text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
