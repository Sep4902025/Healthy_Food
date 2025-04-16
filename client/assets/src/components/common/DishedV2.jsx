// Import thư viện React để tạo component
import React from "react";

// Import các component cần thiết từ React Native
import {
  View,                // Thẻ chứa tương tự như <div>
  Text,                // Hiển thị văn bản
  Image,               // Hiển thị hình ảnh
  TouchableOpacity,    // Button cảm ứng
  StyleSheet,          // Tạo style
  Dimensions,          // Dùng để lấy kích thước màn hình
  ActivityIndicator,   // Hiển thị loading indicator
} from "react-native";

// Import icon từ thư viện Expo vector icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import CategoryTag - một component hiển thị loại món ăn
import CategoryTag from "./CategoryTag";

// Import hook từ Redux để truy cập state và dispatch action
import { useDispatch, useSelector } from "react-redux";

// Import selector để lấy danh sách món yêu thích từ Redux state
import { favorSelector } from "../../redux/selectors/selector";

// Import action để toggle (bật/tắt) trạng thái yêu thích
import { toggleFavorite } from "../../redux/actions/favoriteThunk";

// Import context theme để lấy màu sắc hiện tại
import { useTheme } from "../../contexts/ThemeContext";

// Lấy chiều rộng màn hình để dùng trong style
const WIDTH = Dimensions.get("window").width;

// Component chính nhận props: item (món ăn), onPress, onFavoritePress
const DishedV2 = ({ item, onPress, onFavoritePress }) => {
  const dispatch = useDispatch();                     // Gửi action Redux
  const favorite = useSelector(favorSelector);       // Lấy danh sách yêu thích từ store
  const { theme } = useTheme();                      // Lấy theme từ context

  // Kiểm tra xem món này có trong danh sách yêu thích không
  const isFavorite = (id) => {
    return favorite.favoriteList?.includes(id);
  };

  // Xử lý khi nhấn vào nút lưu (yêu thích)
  const handleOnSavePress = (dish) => {
    dispatch(toggleFavorite({ id: dish._id }));       // Gửi action toggle yêu thích
    onFavoritePress && onFavoritePress();             // Gọi callback nếu có
  };

  // Component trả về phần giao diện
  return (
    <TouchableOpacity
      key={item._id}                                  // key để React nhận diện item
      style={[
        styles.resultCard,                            // Style chính cho thẻ
        { backgroundColor: item.bgColor ?? theme.cardBackgroundColor }, // Màu nền tùy theo dữ liệu hoặc theme
      ]}
      onPress={onPress}                               // Gọi hàm khi nhấn vào món ăn
    >
      <View style={styles.resultInfo}>
        <View style={styles.resultTitleContainer}>
          <Text style={{ ...styles.resultTitle, color: theme.textColor }}>
            {item.name}                              
          </Text>
          <CategoryTag name={item.type} color="#FF6B00" /> 
        </View>

        <Text style={styles.resultDescription}>
          {item.description}                         
        </Text>
      </View>

      {/* Hình ảnh món ăn */}
      <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />

      {/* Nút yêu thích */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleOnSavePress(item)}
      >
        {/* Nếu đang loading thì hiển thị ActivityIndicator */}
        {favorite.isLoading ? (
          <ActivityIndicator size={22} color="#FC8019" />
        ) : (
          <MaterialCommunityIcons
            name={
              isFavorite(item._id)
                ? "heart-multiple"                   // Icon khi đã yêu thích
                : "heart-plus-outline"               // Icon khi chưa yêu thích
            }
            size={22}
            color="#FF9500"
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Style cho các thành phần
const styles = StyleSheet.create({
  resultCard: {
    flexDirection: "row",             // Hiển thị theo hàng ngang
    borderRadius: 12,                 // Bo góc
    padding: 16,
    marginBottom: 16,
    marginTop: 30,
    position: "relative",
    shadowColor: "#000",              // Màu bóng đổ
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,                    // Bóng đổ Android
  },
  resultInfo: {
    width: "65%",                     // Chiếm 65% chiều ngang
    justifyContent: "center",        // Căn giữa theo chiều dọc
  },
  resultTitleContainer: {
    flexDirection: "row",            // Hiển thị tiêu đề và tag theo hàng ngang
    flexWrap: "wrap",                // Cho phép xuống dòng nếu quá dài
    // alignItems: "center",         // Đã bị comment, dùng để căn giữa dọc
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,                  // Khoảng cách với tag
  },
  resultDescription: {
    width: "100%",
    fontSize: 12,
    color: "#999",                   // Màu xám nhạt
  },
  resultImage: {
    position: "absolute",            // Đặt hình ảnh ở góc phải
    width: WIDTH * 0.23,
    height: WIDTH * 0.23,
    right: 0,
    borderRadius: 150,              // Làm tròn hình ảnh
    marginRight: 36,
    transform: [{ translateY: -WIDTH * 0.1 }], // Đẩy hình lên trên
  },
  favoriteButton: {
    position: "absolute",
    bottom: 16,
    right: 16,                      // Nút nằm ở góc dưới bên phải
  },
});

// Export component ra ngoài để sử dụng
export default DishedV2;
