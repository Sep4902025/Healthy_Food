import axios from "axios";

const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_URL;
const cloudinaryPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImages = async (imageFiles) => {
    try {
        
        const uploadPromises = imageFiles.map(async (file) => {
          
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                type: file.type || 'image/jpeg',
                name: file.name || 'upload.jpg',
            });
            formData.append('upload_preset', cloudinaryPreset);
            console.log(cloudinaryPreset);


            
            const response = await axios.post(
                cloudinaryUrl,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return {
                url: response?.data?.secure_url,
                public_id: response?.data?.public_id,
                width: response?.data?.width,
                height: response?.data?.height
            };
        });

        
        const uploadedImages = await Promise.all(uploadPromises);

     
        return uploadedImages;

    } catch (error) {
        console.error('Upload images error:', error?.response);
        throw error; 
    }
};


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