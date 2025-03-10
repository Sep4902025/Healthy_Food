const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDIANRY_CLOUD_NAME}/auto/upload`;

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "healthy-food-file");

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const responseData = await response.json();
  return responseData; // Trả về URL ảnh
};

export default uploadFile;


