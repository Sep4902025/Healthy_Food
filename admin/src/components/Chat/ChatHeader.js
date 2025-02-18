import React from "react";

const ChatHeader = ({ participant }) => {
  return (
    <div className="border-b p-4 bg-white rounded-t-lg">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={participant?.avatar || "https://via.placeholder.com/40"}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              participant?.isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800">
            {participant?.name || "Chuyên gia dinh dưỡng"}
          </div>
          <div className="text-sm text-gray-500">
            {participant?.isOnline ? "Đang hoạt động" : "Không hoạt động"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
