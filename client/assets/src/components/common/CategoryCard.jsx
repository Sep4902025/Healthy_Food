// Import các thư viện cần thiết từ React
import React from "react";
// Import các component và API từ React Native
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from "react-native";
// Import hook useTheme từ context ThemeContext
import { useTheme } from "../../contexts/ThemeContext";

// Lấy kích thước màn hình thiết bị
const window = Dimensions.get("window");
// Tạo tỉ lệ tỷ lệ để căn chỉnh kích thước theo màn hình, sử dụng chiều rộng cơ sở là 375
const scale = window.width / 375; // Using 375 as base width for scaling

// Hàm để chuẩn hóa kích thước cho các màn hình có kích thước khác nhau
const normalize = (size) => {
  // Tính toán kích thước mới dựa trên tỷ lệ màn hình
  const newSize = size * scale;
  // Làm tròn và sử dụng PixelRatio để tính toán pixel chính xác
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Component CategoryCard nhận vào category, hàm xử lý sự kiện onPress và style
const CategoryCard = ({ category, onPress, style }) => {
  // Sử dụng theme từ ThemeContext
  const { theme } = useTheme();
  
  // Tính toán kích thước động dựa trên chiều rộng màn hình
  const cardWidth = normalize(150);
  const imageSize = normalize(80);
  const cardHeight = normalize(120);

  // Render component
  return (
    // TouchableOpacity để tạo hiệu ứng khi nhấn vào card
    <TouchableOpacity
      key={category.id}
      style={[
        // Áp dụng style cơ bản từ StyleSheet
        styles.categoryCard,
        {
          // Áp dụng kích thước động đã tính toán
          width: cardWidth,
          height: cardHeight,
          // Sử dụng màu nền từ theme
          backgroundColor: theme.cardBackgroundColor,
        },
        // Cho phép tùy chỉnh style từ bên ngoài
        style,
      ]}
      // Gọi hàm onPress khi người dùng nhấn vào card
      onPress={onPress}
    >
      {/* Container chứa hình ảnh danh mục */}
      <View style={[styles.categoryImageContainer, { width: imageSize, height: imageSize }]}>
        {/* Hiển thị hình ảnh từ URL */}
        <Image
          source={{ uri: category.image_url }}
          style={styles.categoryImage}
        />
      </View>
      {/* Hiển thị tên danh mục */}
      <Text
        style={[
          styles.categoryTitle,
          { color: theme.textColor }
        ]}
        // Giới hạn hiển thị tên danh mục trong 1 dòng
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    position: "relative",
    borderRadius: 10,
    marginBottom: normalize(12),
    marginHorizontal: normalize(4),
    alignItems: "center",
    justifyContent: "flex-end",
    padding: normalize(12),
    shadowColor: "#343C41",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryImageContainer: {
    position: "absolute",
    borderRadius: 150,
    overflow: "hidden",
    top: normalize(-10),
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryTitle: {
    fontSize: normalize(14),
    fontWeight: "bold",
    textAlign: "center",
  },
});

// Export component để sử dụng ở nơi khác
export default CategoryCard;