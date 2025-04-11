import React, { useEffect, useState } from "react";

const UploadComponent = ({ onFileSelect, reset }) => {
  const [inputKey, setInputKey] = useState(Date.now()); // Reset input file

  useEffect(() => {
    if (reset) {
      setInputKey(Date.now()); // Reset file input
    }
  }, [reset]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Pass the file to the parent component
    onFileSelect(file);
  };

  const handleClearFile = () => {
    setInputKey(Date.now()); // Reset file input
    onFileSelect(null); // Notify parent to clear the file
  };

  return (
    <div className="flex flex-col items-center">
      <input
        key={inputKey}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button
        className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
        onClick={handleClearFile}
      >
        Clear File
      </button>
    </div>
  );
};

export default UploadComponent;