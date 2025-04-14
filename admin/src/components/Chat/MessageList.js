import React, { useRef, useEffect, useState } from "react";

// Component to display message content
const MessageContent = ({ message }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  switch (message.type) {
    case "image":
      return (
        <div className="relative">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-500 text-xs">Loading...</span>
            </div>
          )}
          {error ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 text-sm">
              Failed to load image
            </div>
          ) : (
            <img
              src={message.imageUrl || message.text}
              alt="Uploaded content"
              className={`max-w-[200px] max-h-[200px] object-contain rounded-lg ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
        </div>
      );
    case "video":
      return (
        <div className="relative">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-500 text-xs">Loading...</span>
            </div>
          )}
          {error ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 text-sm">
              Failed to load video
            </div>
          ) : (
            <video
              src={message.videoUrl || message.text}
              className={`max-w-[200px] max-h-[200px] object-contain rounded-lg ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              controls
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
        </div>
      );
    case "text":
    default:
      return <span className="break-words whitespace-pre-wrap">{message.text}</span>;
  }
};

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full h-full">
      {Array.isArray(messages) &&
        messages.map((message) => (
          <div
            key={message._id}
            className={`mb-3 max-w-[80%] ${
              message.senderId === currentUserId ? "ml-auto text-right" : "mr-auto text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg break-words ${
                message.senderId === currentUserId ? "bg-blue-500 text-white" : "bg-gray-200"
              } ${message.type !== "text" ? "p-0" : ""}`}
            >
              <MessageContent message={message} />
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
