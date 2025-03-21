// Import các thư viện cần thiết từ React và React Native
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Component SplitLine: Tạo một đường kẻ ngang với text ở giữa
const SplitLine = ({ text, textStyle, lineStyle }) => {
  return (
    // Container chính với flexDirection row để các phần tử con nằm ngang
    <View style={styles.container}>
      {/* Đường kẻ bên trái */}
      <View style={[styles.line, lineStyle]} />

      {/* Text ở giữa */}
      <Text style={[styles.text, textStyle]}>{text}</Text>

      {/* Đường kẻ bên phải */}
      <View style={[styles.line, lineStyle]} />
    </View>
  );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Sắp xếp các phần tử con theo hàng ngang
    alignItems: "center", // Căn giữa các phần tử con theo chiều dọc
    marginVertical: 16, // Tạo khoảng cách trên dưới 16 đơn vị
  },
  line: {
    height: 1, // Chiều cao của đường kẻ
    backgroundColor: "#D6D6D6", // Màu mặc định của đường kẻ (màu xám nhạt)
    borderRadius: 1, // Bo tròn nhẹ cho đường kẻ
  },
  text: {
    marginHorizontal: 8, // Tạo khoảng cách trái phải cho text
    fontSize: 16, // Kích thước chữ
    color: "#D6D6D6", // Màu mặc định của text (màu xám nhạt)
    fontFamily: "Aleo_400Regular",
  },
});

// Export component để sử dụng ở nơi khác
export default SplitLine;
