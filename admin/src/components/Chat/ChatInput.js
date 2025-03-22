import React from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";

const ChatInput = ({
  onSendMessage,
  selectedFile,
  setSelectedFile,
  uploadProgress,
  isUploading,
  onCancelUpload,
}) => {
  const [text, setText] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || selectedFile) {
      onSendMessage(text);
      setText("");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
        <div className="mb-2 text-sm text-gray-500">
          File: {selectedFile.name}
          <button
            onClick={() => setSelectedFile(null)}
            className="ml-2 text-red-500 hover:underline"
          >
            Remove
          </button>
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
