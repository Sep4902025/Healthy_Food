import React, { useEffect, useState } from "react";
import uploadFile from "../helpers/uploadFile";


const UploadComponent = ({ onUploadSuccess, reset }) => {
  const [imagePreview, setImagePreview] = useState("");
  const [inputKey, setInputKey] = useState(Date.now()); // Reset input file
  const [loading, setLoading] = useState(false); // Trạng thái loading khi upload

  useEffect(() => {
    if (reset) {
      setImagePreview(""); // Reset ảnh khi form reset
      setInputKey(Date.now()); // Thay đổi key để reset input file
    }
  }, [reset]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const uploadedImage = await uploadFile(file); // Upload lên Cloudinary
      if (uploadedImage.secure_url) {
        setImagePreview(uploadedImage.secure_url); // Hiển thị ảnh preview
        onUploadSuccess(uploadedImage.secure_url); // Trả URL ảnh về parent component
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setLoading(false);
  };

  const handleClearImage = () => {
    setImagePreview(""); // Xóa ảnh
    setInputKey(Date.now()); // Reset input file
    onUploadSuccess(""); // Trả về giá trị rỗng
  };

  return (
    <div className="flex flex-col items-center">
      <input key={inputKey} type="file" accept="image/*" onChange={handleUpload} />
      
      {loading && <p>Uploading...</p>} {/* Hiển thị loading khi upload */}
      
      {imagePreview && (
        <div className="mt-2 relative">
          <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded border" />
          <button 
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            onClick={handleClearImage}
          >
            ✖
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
