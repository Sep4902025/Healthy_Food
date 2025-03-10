import React, { useEffect, useState } from "react";

const UploadComponent = ({ onUploadSuccess, reset }) => {
  const [imagePreview, setImagePreview] = useState("");
  const [inputKey, setInputKey] = useState(Date.now()); // Key để reset input file

  useEffect(() => {
    if (reset) {
      setImagePreview(""); // Reset ảnh khi form reset
      setInputKey(Date.now()); // Thay đổi key để reset input file
    }
  }, [reset]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      onUploadSuccess(imageUrl);
    }
  };

  return (
    <div>
      {/* Reset input file khi key thay đổi */}
      <input key={inputKey} type="file" accept="image/*" onChange={handleUpload} />
      {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 mt-2 rounded border" />}
    </div>
  );
};

export default UploadComponent;
