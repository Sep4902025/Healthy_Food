// Import thư viện React để sử dụng JSX và các tính năng của React
import React from "react";
// Import các component và hàm tiện ích từ React Native
import { View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";

// Lấy chiều cao của cửa sổ thiết bị để sử dụng trong component
const HEIGHT = Dimensions.get("window").height;

// Khai báo component SpinnerLoading - hiển thị một loader khi ứng dụng đang xử lý dữ liệu
const SpinnerLoading = () => {
  return (
    // View phủ toàn màn hình làm nền mờ
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    </View>
  );
};

// Định nghĩa các style sử dụng trong component
const styles = StyleSheet.create({
  overlay: {
    position: "absolute", // Vị trí tuyệt đối để phủ lên toàn bộ màn hình
    top: 0, // Căn trên cùng
    right: 0, // Căn phải
    left: 0, // Căn trái
    bottom: 0, // Căn dưới cùng
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Màu nền đen mờ với độ trong suốt 10%
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
    zIndex: 999, // Đặt lớp hiển thị cao hơn các phần tử khác
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Màu nền trắng mờ với độ trong suốt 20%
    padding: 20, // Đệm xung quanh 20 đơn vị
    borderRadius: 10, // Bo góc 10 đơn vị
  },
});

// Xuất component để có thể import trong các file khác
export default SpinnerLoading;