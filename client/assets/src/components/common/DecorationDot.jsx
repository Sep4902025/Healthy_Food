import React from "react"; // Import thư viện React
import { View } from "react-native"; // Import View từ react-native

// Component DecorationDot nhận vào các props để tuỳ chỉnh chấm trang trí
function DecorationDot({
  size = 20, // Kích thước mặc định của chấm là 20
  backgroundColor = "#000000", // Màu nền mặc định là đen
  opacity = 1, // Độ mờ mặc định là 1 (không trong suốt)
  zIndex = 1, // zIndex mặc định là 1 (ưu tiên hiển thị)
  top, // Khoảng cách từ phía trên (nếu có)
  bottom, // Khoảng cách từ phía dưới (nếu có)
  left, // Khoảng cách từ bên trái (nếu có)
  right, // Khoảng cách từ bên phải (nếu có)
  transform, // Biến đổi hình học (xoay, dịch chuyển, thu phóng,...)
}) {
  return (
    // Trả về một View có style tuỳ chỉnh dựa trên các props truyền vào
    <View
      style={{
        width: size, // Đặt chiều rộng bằng size
        height: size, // Đặt chiều cao bằng size
        backgroundColor, // Màu nền của chấm
        opacity, // Độ trong suốt của chấm
        zIndex, // Mức độ hiển thị chồng lên các thành phần khác
        position: "absolute", // Định vị tuyệt đối trong layout
        top, // Đặt vị trí top nếu có
        bottom, // Đặt vị trí bottom nếu có
        left, // Đặt vị trí left nếu có
        right, // Đặt vị trí right nếu có
        borderRadius: 500, // Làm tròn tối đa để tạo hình tròn
        transform: transform ? transform : [], // Áp dụng các phép biến đổi nếu có
      }}
    />
  );
}

export default DecorationDot; // Xuất component để sử dụng ở nơi khác
