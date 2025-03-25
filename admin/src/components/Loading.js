import React from "react";

const Loading = ({ isLoading, children }) => {
  return (
    <div className="relative">
      {/* Overlay with spinner when loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <div className="w-6 h-6 border-2 border-t-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      )}
      {/* Render children (the content) */}
      <div className={isLoading ? "opacity-50" : "opacity-100"}>{children}</div>
    </div>
  );
};

export default Loading;
