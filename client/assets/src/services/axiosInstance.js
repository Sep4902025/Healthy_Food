// Import thư viện axios để thực hiện các request HTTP
import axios from "axios";

// Import AsyncStorage để lưu trữ dữ liệu cục bộ trên thiết bị
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import hàm hiển thị thông báo toast tùy chỉnh
import ShowToast from "../components/common/CustomToast";
// Import hook useNavigation từ thư viện navigation để điều hướng màn hình
import { useNavigation } from "@react-navigation/native";
// Import danh sách tên các màn hình trong ứng dụng
import { ScreensName } from "../constants/ScreensName";
// Import hàm navigate từ service điều hướng để chuyển màn hình từ bên ngoài component
import { navigate } from "../utils/NavigationService";

// Lấy URL API từ biến môi trường
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// Tạo một instance mới của axios với các cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: apiUrl, // URL cơ sở cho tất cả các request
  headers: {
    "Content-Type": "application/json", // Thiết lập header mặc định là JSON
  },
  responseType: "json", // Kiểu dữ liệu phản hồi mong đợi
  timeout: 30000, // Thời gian chờ tối đa cho request (30 giây)
  validateStatus: (status) => status >= 200 && status < 300, // Hàm kiểm tra status hợp lệ (2xx)
});
// In URL API ra console để kiểm tra
console.log(process.env.EXPO_PUBLIC_API_URL);


// Thiết lập interceptor cho request (chặn và xử lý trước khi gửi request)
axiosInstance.interceptors.request.use(
  async (config) => {
    // Lấy token xác thực từ AsyncStorage
    const accessToken = await AsyncStorage.getItem("accessToken");

    // Nếu có token, thêm vào header Authorization
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config; // Trả về cấu hình đã được chỉnh sửa
  },

  // Xử lý lỗi nếu có vấn đề khi chuẩn bị request
  (error) => {
    return Promise.reject(error); // Từ chối promise với lỗi
  }
);

// Thiết lập interceptor cho response (chặn và xử lý sau khi nhận response)
axiosInstance.interceptors.response.use(
  // Xử lý response thành công
  (response) => {
    return response; // Trả về response không thay đổi
  },

  // Xử lý response lỗi
  async (error) => {
    // Lấy mã trạng thái HTTP từ response lỗi
    const status = error?.response?.status;

    if (status === 401) {
      // Nếu mã lỗi là 401 (Unauthorized), phiên đăng nhập đã hết hạn
      ShowToast("error", "Session expired. Please log in again."); // Hiển thị thông báo lỗi
      await AsyncStorage.removeItem("accessToken"); // Xóa token khỏi bộ nhớ cục bộ

      // Điều hướng người dùng về màn hình đăng nhập
      navigate(ScreensName.signin);
    } else {
      // Hiển thị thông báo lỗi khác từ server hoặc thông báo mặc định
      ShowToast("error", error?.response?.data?.message || "Something went wrong.");
    }

    // Từ chối promise với lỗi để các hàm gọi API có thể bắt và xử lý lỗi
    return Promise.reject(error);
  }
);

// Export instance axios đã được cấu hình để sử dụng trong toàn bộ ứng dụng
export default axiosInstance;