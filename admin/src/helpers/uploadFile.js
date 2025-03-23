const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDIANRY_CLOUD_NAME}/auto/upload`;

const uploadFile = (file, onProgress, onCancel) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "healthy-food-file");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const responseData = JSON.parse(xhr.responseText);
        resolve(responseData);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed due to network error"));

    xhr.open("POST", url, true);
    xhr.send(formData);

    if (onCancel) {
      onCancel(() => xhr.abort()); // Truyền hàm hủy cho caller
    }
  });
};

export default uploadFile;
