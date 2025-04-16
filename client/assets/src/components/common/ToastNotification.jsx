// Import thư viện React để sử dụng JSX và các tính năng của React
import React from "react";
// Import các component và hàm tiện ích từ React Native
import { View, Text, StyleSheet, Dimensions, Modal } from "react-native";
// Import hook useToast từ thư viện react-native-toast-notifications
import { useToast } from "react-native-toast-notifications";

// Lấy chiều rộng của cửa sổ thiết bị
const WIDTH = Dimensions.get("window").width;
// Lấy chiều cao của cửa sổ thiết bị
const HEIGHT = Dimensions.get("window").height;

// Component CustomToast - hiển thị thông báo với các kiểu khác nhau
const CustomToast = ({ title, message, type }) => {
  // Khởi tạo màu nền mặc định là màu xanh lá
  let backgroundColor = "green";

  // Xác định màu nền dựa trên loại thông báo
  if (type === "error") {
    backgroundColor = "red"; // Màu đỏ cho thông báo lỗi
  } else if (type === "warning") {
    backgroundColor = "#FF8C00"; // Màu cam cho thông báo cảnh báo
  }

  return (
    // Container chính của thông báo
    <View style={styles.container}>
      <View style={[styles.Line, { backgroundColor }]}></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

// Định nghĩa các style sử dụng trong component
const styles = StyleSheet.create({
  container: {
    width: WIDTH * 0.85, // Chiều rộng bằng 85% chiều rộng màn hình
    position: "relative", // Vị trí tương đối để có thể định vị phần tử con
    paddingVertical: 10, // Đệm trên dưới 10 đơn vị
    paddingHorizontal: 25, // Đệm trái phải 25 đơn vị
    borderColor: "rgba(0, 0, 0, 0.1)", // Màu viền đen mờ
    borderWidth: 1, // Độ dày viền 1 đơn vị
    
    backgroundColor: "white", // Màu nền trắng
    
    zIndex: 9999, // Đặt lớp hiển thị cao hơn các phần tử khác
    borderRadius: 12, // Bo góc 12 đơn vị
    overflow: "hidden", // Ẩn phần tử con nếu vượt quá kích thước container
  },
  Line: {
    position: "absolute", // Vị trí tuyệt đối trong container cha
    top: 0, // Căn trên cùng
    bottom: 0, // Căn dưới cùng
    left: 0, // Căn trái
    width: 10, // Chiều rộng 10 đơn vị
  },
  title: {
    fontSize: 16, // Kích thước chữ 16
    marginBottom: 5, // Khoảng cách dưới 5 đơn vị
    fontWeight: "bold", // Chữ đậm
    
  },
  message: {
    fontSize: 14, // Kích thước chữ 14
    opacity: 0.5, // Độ mờ 50%
    
  },
});

// Custom hook để sử dụng toast trong ứng dụng
const useCustomToast = () => {
  // Sử dụng hook useToast từ thư viện
  const toast = useToast();

  // Hàm hiển thị toast với các tùy chọn
  const showToast = ({ title, message, type, position }) => {
    toast.show(<CustomToast title={title} message={message} type={type} />, {
      type: type, // Loại toast (error, warning, success)
      placement: position || "top", // Vị trí hiển thị, mặc định là "top"
      duration: 3000, // Thời gian hiển thị 3000ms (3 giây)
      animationType: "slide-in", // Kiểu hiệu ứng khi hiển thị
      style: {
        backgroundColor: "", // Không đặt màu nền (sử dụng màu nền của CustomToast)
        zIndex: 9999, // Đặt lớp hiển thị cao hơn các phần tử khác
      },
    });
  };

  // Trả về hàm showToast để sử dụng trong component khác
  return showToast;
};

// Xuất custom hook để có thể import trong các file khác
export default useCustomToast;