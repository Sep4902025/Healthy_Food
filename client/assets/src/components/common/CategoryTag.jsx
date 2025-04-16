// Import thư viện React để sử dụng các tính năng của React
import React from "react";
// Import các components cần thiết từ React Native
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
// Import hook useTheme từ context để sử dụng theme trong ứng dụng
import { useTheme } from "../../contexts/ThemeContext";

// Định nghĩa component CategoryTag với hai props: name và color
// Giá trị mặc định của name là chuỗi rỗng, color mặc định là màu cam "#FF6B00"
const CategoryTag = ({ name = "", color = "#FF6B00" }) => {
  // Sử dụng hook useTheme để lấy theme hiện tại từ context
  const { theme } = useTheme();

  // Trả về cấu trúc JSX của component
  return (
    // Container chính của CategoryTag
    <View
      style={{
        // Kế thừa style từ styles.categoryTag
        ...styles.categoryTag,
        // Thiết lập màu viền từ prop color được truyền vào
        borderColor: color,
        // Lấy màu nền từ theme hiện tại
        backgroundColor: theme.categoryTagBackgroundColor,
      }}
    >
      {/* Hiển thị tên danh mục trong tag */}
      <Text style={{ ...styles.categoryTagText, color: color }}>{name}</Text>
    </View>
  );
};

// Định nghĩa các styles cho component sử dụng StyleSheet
const styles = StyleSheet.create({
  categoryTag: {
    backgroundColor: "#E2F8F8", // Màu nền mặc định
    paddingHorizontal: 8, // Khoảng cách lề trái phải
    paddingVertical: 2, // Khoảng cách lề trên dưới
    borderRadius: 12, // Bo tròn góc
    alignSelf: "flex-start", // Căn chỉnh tag theo nội dung bên trong

    borderWidth: 1, // Độ dày của viền
    marginBottom: 4, // Khoảng cách dưới tag
  },
  categoryTagText: {
    color: "black", // Màu chữ mặc định
    fontSize: 8, // Kích thước chữ
  },
});

// Export component để có thể sử dụng ở các file khác
export default CategoryTag;
