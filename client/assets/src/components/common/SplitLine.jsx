// Import thư viện React để sử dụng JSX và các tính năng của React
import React from "react";
// Import các component cần thiết từ React Native
import { View, Text, StyleSheet } from "react-native";

// Khai báo component SplitLine - hiển thị một dòng chia với văn bản ở giữa
// Nhận vào các props: text (nội dung hiển thị), textStyle (style cho văn bản), lineStyle (style cho đường kẻ)
const SplitLine = ({ text, textStyle, lineStyle }) => {
  return (
    // Container chính, sắp xếp các phần tử theo chiều ngang
    <View style={styles.container}>
      <View style={[styles.line, lineStyle]} />
      <Text style={[styles.text, textStyle]}>{text}</Text>
      <View style={[styles.line, lineStyle]} />
    </View>
  );
};

// Định nghĩa các style sử dụng trong component
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Sắp xếp các phần tử theo chiều ngang
    alignItems: "center", // Căn giữa các phần tử theo chiều dọc
    marginVertical: 16, // Thêm khoảng cách 16 đơn vị ở trên và dưới
  },
  line: {
    height: 1, // Chiều cao của đường kẻ là 1 đơn vị
    backgroundColor: "#D6D6D6", // Màu xám nhạt cho đường kẻ
    borderRadius: 1, // Bo góc nhẹ cho đường kẻ
  },
  text: {
    marginHorizontal: 8, // Khoảng cách 8 đơn vị ở hai bên của văn bản
    fontSize: 16, // Kích thước chữ 16
    color: "#D6D6D6", // Màu chữ xám nhạt
    fontFamily: "Aleo_400Regular", // Sử dụng font Aleo với độ dày 400 (Regular)
  },
});

// Xuất component để có thể import trong các file khác
export default SplitLine;