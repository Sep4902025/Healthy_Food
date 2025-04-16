// Import thư viện axios để thực hiện các HTTP request
import axios from "axios";

// Lấy URL Cloudinary từ biến môi trường Expo
const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_URL;
// Lấy preset upload của Cloudinary từ biến môi trường Expo
const cloudinaryPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Hàm upload nhiều ảnh lên Cloudinary
export const uploadImages = async (imageFiles) => {
  try {
    // Tạo mảng các promise cho việc upload nhiều ảnh song song
    const uploadPromises = imageFiles.map(async (file) => {
      // Tạo form data cho từng ảnh để gửi lên server
      const formData = new FormData();
      // Thêm file ảnh vào form data với thông tin uri, type và name
      formData.append("file", {
        uri: file.uri,                        // Đường dẫn đến file ảnh
        type: file.type || "image/jpeg",      // Loại file, mặc định là "image/jpeg" nếu không có
        name: file.name || "upload.jpg",      // Tên file, mặc định là "upload.jpg" nếu không có
      });
      // Thêm upload_preset vào form data để xác định cấu hình upload trên Cloudinary
      formData.append("upload_preset", cloudinaryPreset);
      // In ra giá trị của cloudinaryPreset để debug
      console.log(cloudinaryPreset);

      // Gửi request POST đến Cloudinary để upload ảnh
      const response = await axios.post(cloudinaryUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Đặt Content-Type để server hiểu đúng định dạng dữ liệu
        },
      });

      // Trả về thông tin ảnh đã upload được trích xuất từ response
      return {
        url: response?.data?.secure_url,      // URL https của ảnh đã upload
        public_id: response?.data?.public_id, // ID công khai của ảnh trên Cloudinary
        width: response?.data?.width,         // Chiều rộng của ảnh
        height: response?.data?.height,       // Chiều cao của ảnh
      };
    });

    // Chờ tất cả các ảnh được upload xong bằng Promise.all
    const uploadedImages = await Promise.all(uploadPromises);

    // Trả về mảng các thông tin ảnh đã upload thành công
    return uploadedImages;
  } catch (error) {
    // Ghi log lỗi chi tiết nếu xảy ra exception
    console.error("Upload images error:", error?.response);
    throw error; // Ném lỗi để component gọi hàm có thể bắt và xử lý
  }
};

// Hàm hỗ trợ upload một ảnh duy nhất (giữ lại phiên bản cũ để tương thích với code cũ)
export const uploadToCloudinary = async (uri) => {
  try {
    // Gọi hàm uploadImages với một mảng chỉ có một phần tử
    const images = await uploadImages([
      {
        uri: uri,                // Đường dẫn đến file ảnh
        type: "image/jpeg",      // Loại file là JPEG
        name: "upload.jpg",      // Tên file là upload.jpg
      },
    ]);

    // Trả về URL của ảnh đầu tiên (và duy nhất) trong mảng kết quả
    return images[0]?.url;
  } catch (error) {
    // Ghi log lỗi nếu xảy ra exception
    console.error("Upload error:", error);
    // Trả về đối tượng lỗi để xử lý ở component gọi hàm
    return error;
  }
};