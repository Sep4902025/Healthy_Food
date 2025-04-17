import axios from "axios";

const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_URL;
const cloudinaryPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImages = async (imageFiles, onProgress) => {
  try {
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of imageFiles) {
      // Kiểm tra kích thước file (giả định file.uri có thể truy cập kích thước qua API khác nếu cần)
      // Note: Expo không cung cấp cách trực tiếp để lấy kích thước file từ URI, cần thêm logic nếu muốn kiểm tra
      console.log(`Uploading file: ${file.name || file.uri}`);
    }

    const uploadPromises = imageFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: file.type || "image/jpeg",
        name: file.name || "upload.jpg",
      });
      formData.append("upload_preset", cloudinaryPreset);

      const response = await axios.post(cloudinaryUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          if (onProgress) onProgress(progress);
        },
      });

      return {
        url: response?.data?.secure_url,
        public_id: response?.data?.public_id,
        width: response?.data?.width,
        height: response?.data?.height,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages;
  } catch (error) {
    console.error("Upload images error:", error?.response || error.message);
    throw error;
  }
};

export const uploadToCloudinary = async (uri, onProgress) => {
  try {
    const images = await uploadImages(
      [
        {
          uri: uri,
          type: "image/jpeg",
          name: "upload.jpg",
        },
      ],
      onProgress
    );

    return images[0]?.url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
