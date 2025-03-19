// Import các thư viện cần thiết
import React from "react";
import { View } from "react-native";

// Component DecorationDot - Tạo chấm tròn trang trí với vị trí tùy chỉnh
function DecorationDot({
  size = 20, // Kích thước của chấm (default: 20)
  backgroundColor = "#000000", // Màu nền (default: đen)
  opacity = 1, // Độ trong suốt (default: 1 - không trong suốt)
  zIndex = 1, // Thứ tự hiển thị layer (default: 1)
  top, // Vị trí từ top
  bottom, // Vị trí từ bottom
  left, // Vị trí từ left
  right, // Vị trí từ right
  transform, // Mảng transform (scale, rotate,...)
}) {
  return (
    // Render chấm tròn với style được truyền vào
    <View
      style={{
        width: size, // Chiều rộng của chấm
        height: size, // Chiều cao của chấm
        backgroundColor, // Màu nền
        opacity, // Độ trong suốt
        // zIndex, // Layer index
        position: "absolute", // Vị trí tuyệt đối
        top, // Cách top
        bottom, // Cách bottom
        left, // Cách left
        right, // Cách right
        borderRadius: 500, // Bo tròn để tạo hình tròn
        transform: transform ? transform : [], // Áp dụng transform nếu có
      }}
    />
  );
}

export default DecorationDot;
