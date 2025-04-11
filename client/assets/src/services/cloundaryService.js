import axios from "axios";

const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_URL;
const cloudinaryPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImages = async (imageFiles) => {
    try {
        // Tạo mảng các promise cho việc upload nhiều ảnh
        const uploadPromises = imageFiles.map(async (file) => {
            // Tạo form data cho từng ảnh
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                type: file.type || 'image/jpeg',
                name: file.name || 'upload.jpg',
            });
            formData.append('upload_preset', cloudinaryPreset);
            console.log(cloudinaryPreset);


            // Upload ảnh lên Cloudinary
            const response = await axios.post(
                cloudinaryUrl,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Trả về thông tin ảnh đã upload
            return {
                url: response?.data?.secure_url,
                public_id: response?.data?.public_id,
                width: response?.data?.width,
                height: response?.data?.height
            };
        });

        // Chờ tất cả các ảnh được upload xong
        const uploadedImages = await Promise.all(uploadPromises);

        // Trả về mảng các thông tin ảnh đã upload
        return uploadedImages;

    } catch (error) {
        console.error('Upload images error:', error?.response);
        throw error; // Ném lỗi để xử lý ở hàm gọi
    }
};

// Hàm hỗ trợ upload một ảnh duy nhất (giữ lại phiên bản cũ để tương thích)
export const uploadToCloudinary = async (uri) => {
    try {
        const images = await uploadImages([{
            uri: uri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        }]);

        return images[0]?.url;
    } catch (error) {
        console.error('Upload error:', error);
        return error;
    }
};