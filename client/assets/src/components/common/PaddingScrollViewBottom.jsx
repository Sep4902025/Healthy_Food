// Import React và các component cần thiết từ React Native
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

// Lấy chiều cao màn hình thiết bị
const HEIGHT = Dimensions.get("window").height;

// Component đơn giản dùng để tạo khoảng trống ở đáy ScrollView
const PaddingScrollViewBottom = () => {
  return <View style={styles.container}></View>; // View rỗng với chiều cao được định nghĩa bên dưới
};

// Định nghĩa style cho component
const styles = StyleSheet.create({
  container: {
    width: "100%",          // Chiều rộng full theo màn hình
    height: HEIGHT * 0.1,   // Chiều cao bằng 10% chiều cao màn hình
  },
});

// Export component để sử dụng ở nơi khác
export default PaddingScrollViewBottom;
