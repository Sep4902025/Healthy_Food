import React, { useState, useEffect } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";

const ChatInput = ({
  onSendMessage,
  selectedFile,
  setSelectedFile,
  uploadProgress,
  isUploading,
  onCancelUpload,
}) => {
  const [text, setText] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null); // State for the preview URL

  // Generate a preview URL when a file is selected
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // Cleanup the URL when the component unmounts or the file changes
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
  }, [selectedFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || selectedFile) {
      onSendMessage(text);
      setText("");
      setSelectedFile(null); // Clear the file after sending
      setPreviewUrl(null); // Clear the preview
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="h-full w-full p-2">
      {isUploading && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <button onClick={onCancelUpload} className="text-xs text-red-500 hover:underline">
            Cancel
          </button>
        </div>
      )}
      {selectedFile && !isUploading && (
        <div className="mb-2">
          {/* Display preview for image or video */}
          {previewUrl && (
            <div className="relative w-32 h-32 mb-2">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : selectedFile.type.startsWith("video/") ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <p className="text-sm text-gray-500">
                  File: {selectedFile.name} (Preview not available)
                </p>
              )}
              {/* Remove button overlay */}
              <button
                onClick={handleRemoveFile}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
          {!previewUrl && (
            <div className="text-sm text-gray-500">
              File: {selectedFile.name}
              <button onClick={handleRemoveFile} className="ml-2 text-red-500 hover:underline">
                Remove
              </button>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <label className="cursor-pointer">
          <FiPaperclip size={20} className="text-gray-500" />
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            accept="image/*,video/*" // Restrict to images and videos
          />
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUploading}
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={isUploading}
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
