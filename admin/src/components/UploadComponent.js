import React, { useEffect, useState } from "react";
import uploadFile from "../helpers/uploadFile";

const UploadComponent = ({ onUploadSuccess, reset }) => {
  const [imagePreview, setImagePreview] = useState("");
  const [inputKey, setInputKey] = useState(Date.now()); // Reset input file
  const [loading, setLoading] = useState(false); // Loading state during upload
  const [progress, setProgress] = useState(0); // Progress percentage
  const [cancelUpload, setCancelUpload] = useState(null); // Function to cancel upload

  useEffect(() => {
    if (reset) {
      setImagePreview(""); // Reset image when form resets
      setInputKey(Date.now()); // Change key to reset file input
      setProgress(0); // Reset progress
      setLoading(false); // Reset loading state
    }
  }, [reset]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(0); // Reset progress at the start

    try {
      const uploadedImage = await uploadFile(
        file,
        (percentComplete) => {
          setProgress(percentComplete); // Update progress as upload proceeds
        },
        (cancelFn) => {
          setCancelUpload(() => cancelFn); // Store the cancel function
        }
      );

      if (uploadedImage.secure_url) {
        setImagePreview(uploadedImage.secure_url); // Display preview image
        onUploadSuccess(uploadedImage.secure_url); // Pass URL to parent component
      }
    } catch (error) {
      console.error("Upload failed:", error);
      onUploadSuccess(""); // Pass empty string on failure
    } finally {
      setLoading(false);
      setProgress(0); // Reset progress after upload completes or fails
      setCancelUpload(null); // Clear cancel function
    }
  };

  const handleCancelUpload = () => {
    if (cancelUpload) {
      cancelUpload(); // Trigger the cancel function
      setLoading(false);
      setProgress(0);
      setImagePreview(""); // Clear preview on cancel
      onUploadSuccess(""); // Notify parent of cancellation
    }
  };

  const handleClearImage = () => {
    setImagePreview(""); // Clear image
    setInputKey(Date.now()); // Reset file input
    onUploadSuccess(""); // Pass empty value to parent
    setProgress(0); // Reset progress
  };

  return (
    <div className="flex flex-col items-center">
      <input
        key={inputKey}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading} // Disable input during upload
      />

      {loading && (
        <div className="mt-2">
          <p>Uploading... {progress}%</p>
          <div className="w-32 bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <button
            className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
            onClick={handleCancelUpload}
          >
            Cancel
          </button>
        </div>
      )}

      {imagePreview && !loading && (
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
