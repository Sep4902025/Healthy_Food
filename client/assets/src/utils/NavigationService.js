// Import hàm createNavigationContainerRef từ thư viện @react-navigation/native
// Hàm này cho phép tạo một tham chiếu đến Navigation Container để điều khiển từ bên ngoài
import { createNavigationContainerRef } from '@react-navigation/native';

// Tạo một tham chiếu toàn cục tới Navigation Container
// Biến này sẽ được sử dụng để truy cập Navigation Container từ bất kỳ đâu trong ứng dụng
export const navigationRef = createNavigationContainerRef();

// Định nghĩa hàm navigate để điều hướng giữa các màn hình
// name: tên của màn hình muốn chuyển đến
// params: các tham số cần truyền vào màn hình đó (tùy chọn)
export function navigate(name, params) {
    // Kiểm tra xem Navigation Container đã sẵn sàng chưa trước khi điều hướng
    // Điều này tránh lỗi khi cố gắng điều hướng trước khi component được khởi tạo hoàn toàn
    if (navigationRef.isReady()) {
        // Thực hiện việc điều hướng đến màn hình được chỉ định với các tham số tương ứng
        navigationRef.navigate(name, params);
    }
}