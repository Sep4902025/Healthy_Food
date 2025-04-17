import React, { useState, useEffect } from "react";
import UserService from "../../services/user.service";

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
  const [userAvatars, setUserAvatars] = useState({});

  useEffect(() => {
    const fetchUserAvatars = async () => {
      const uniqueSenderIds = [...new Set(messages.map((message) => message.senderId))].filter(
        (senderId) => senderId !== currentUserId
      );

      const avatarData = {};
      for (const senderId of uniqueSenderIds) {
        try {
          console.log("Fetching avatar for senderId:", senderId);
          const response = await UserService.getUserById(senderId);
          console.log("API response for senderId:", senderId, response);

          if (response.success && response.user) {
            const user = response.user;
            console.log("User data for senderId:", senderId, user);

            avatarData[senderId] = {
              avatarUrl:
                user.role === "nutritionist"
                  ? "https://res.cloudinary.com/dds8jiclc/image/upload/v1744009146/uzxsw0ecl0psvmg4jyri.png"
                  : user.avatarUrl || "/default-avatar.png",
              role: user.role || "user",
            };
          } else {
            console.error(`Failed to fetch user ${senderId}:`, response.message || "No user data");
            avatarData[senderId] = {
              avatarUrl: "/default-avatar.png",
              role: "user",
            };
          }
        } catch (error) {
          console.error(`Error fetching user ${senderId}:`, error);
          avatarData[senderId] = {
            avatarUrl: "/default-avatar.png",
            role: "user",
          };
        }
      }
      console.log("Updated userAvatars:", avatarData);
      setUserAvatars(avatarData);
    };

    if (messages && messages.length > 0) {
      fetchUserAvatars();
    }
  }, [messages, currentUserId]);

  // Hàm kiểm tra xem tin nhắn có cần hiển thị thời gian phân cách ngày không
  const shouldShowDateSeparator = (currentMessage, prevMessage) => {
    if (!prevMessage) return true;
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const prevDate = new Date(prevMessage.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  // Hàm kiểm tra xem tin nhắn có nên hiển thị avatar không
  const shouldShowAvatar = (currentMessage, prevMessage) => {
    if (currentMessage.senderId === currentUserId) return false;
    if (!prevMessage) return true;

    const currentTime = new Date(currentMessage.createdAt).getTime();
    const prevTime = new Date(prevMessage.createdAt).getTime();
    const timeDiff = (currentTime - prevTime) / (1000 * 60);

    return prevMessage.senderId !== currentMessage.senderId || timeDiff > 1;
  };

  // Hàm kiểm tra xem tin nhắn có nên hiển thị thời gian không
  const shouldShowTime = (currentMessage, nextMessage) => {
    if (!nextMessage) return true;
    if (nextMessage.senderId !== currentMessage.senderId) return true;

    const currentTime = new Date(currentMessage.createdAt).getTime();
    const nextTime = new Date(nextMessage.createdAt).getTime();
    const timeDiff = (nextTime - currentTime) / (1000 * 60);

    return timeDiff > 1;
  };

  // Hàm định dạng thời gian phân cách ngày
  const formatDateSeparator = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const isToday = today.toDateString() === messageDate.toDateString();
    const isYesterday =
      new Date(today.setDate(today.getDate() - 1)).toDateString() === messageDate.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return messageDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full h-full">
      {Array.isArray(messages) &&
        messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUserId;
          const userData = userAvatars[message.senderId] || {
            avatarUrl: "/default-avatar.png",
            role: "user",
          };
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
          const showAvatar = shouldShowAvatar(message, prevMessage);
          const showTime = shouldShowTime(message, nextMessage);

          return (
            <div key={message._id}>
              {showDateSeparator && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {formatDateSeparator(message.createdAt)}{" "}
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              <div
                className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} mb-1`}
              >
                {showAvatar && !isCurrentUser && (
                  <img
                    src={userData.avatarUrl}
                    alt="User avatar"
                    className={`w-8 h-8 rounded-full mr-2 mb-1 ${
                      userData.role === "nutritionist"
                        ? "bg-white border-[0.5px] border-custom-green"
                        : ""
                    }`}
                    onError={(e) =>
                      (e.target.src =
                        "https://res.cloudinary.com/dds8jiclc/image/upload/v1744009158/rdne2cjr6csa9yizxreu.jpg")
                    }
                  />
                )}

                {!showAvatar && !isCurrentUser && <div className="w-8 h-8 mr-2 mb-1" />}

                <div className={`max-w-[80%] ${isCurrentUser ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-2 rounded-lg break-words ${
                      isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200"
                    } ${message.type !== "text" ? "p-0" : ""}`}
                  >
                    <MessageContent message={message} />
                    {showTime && (
                      <div className="text-xs text-gray-700 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MessageList;
