// Import thư viện React để tạo component
import React from "react";

// Import các component cơ bản từ React Native
import {
  View,                // Khối chứa giao diện (tương đương <div>)
  Text,                // Thành phần hiển thị văn bản
  Image,              // Thành phần hiển thị hình ảnh
  TouchableOpacity,   // Nút có thể nhấn được, dùng cho tương tác người dùng
  StyleSheet,         // Công cụ tạo styles cho component
  ActivityIndicator,  // Hiển thị vòng xoay khi đang tải
  Dimensions,         // Dùng để lấy kích thước màn hình thiết bị
  PixelRatio,         // Dùng để chuẩn hóa kích thước phù hợp với nhiều màn hình
} from "react-native";

// Import icon từ thư viện Expo (MaterialCommunityIcons và Ionicons)
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

// Import component CategoryTag hiển thị loại món ăn (ví dụ: "chay", "ăn kiêng", v.v.)
import CategoryTag from "./CategoryTag";

// Import hằng số định nghĩa tên các màn hình để điều hướng
import { ScreensName } from "../../constants/ScreensName";

// Hook điều hướng từ thư viện React Navigation
import { useNavigation } from "@react-navigation/native";

// Import Redux hooks: useDispatch để gửi action, useSelector để truy cập state
import { useDispatch, useSelector } from "react-redux";

// Selector để lấy danh sách món ăn yêu thích từ Redux store
import { favorSelector } from "../../redux/selectors/selector";

// Action Thunk: xử lý thêm/xóa món ăn khỏi danh sách yêu thích
import { toggleFavorite } from "../../redux/actions/favoriteThunk";

// Hàm tiện ích trả về màu sắc tương ứng với từng mùa (đông, hè, thu...)
import { getSeasonColor } from "../../utils/common";

// Hook để lấy thông tin theme (màu nền, chữ,...) từ context toàn app
import { useTheme } from "../../contexts/ThemeContext";

// Lấy kích thước màn hình hiện tại
const window = Dimensions.get("window");

// Scale để điều chỉnh giao diện phù hợp với kích thước màn hình
const scale = window.width / 375;

// Hàm chuẩn hóa kích thước cho các thành phần giao diện
const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Component chính DishedV1 nhận vào dish (món ăn), onSavePress, onArrowPress, disabledDefaultNavigate
const DishedV1 = ({
  dish,                    // Dữ liệu món ăn được truyền vào từ props
  onSavePress,             // Callback khi nhấn nút "yêu thích"
  onArrowPress,            // Callback khi nhấn nút điều hướng
  disabledDefaultNavigate, // Nếu true thì không thực hiện điều hướng mặc định
}) => {
  const navigation = useNavigation(); // Hook điều hướng
  const dispatch = useDispatch();     // Hook gửi action Redux
  const favorite = useSelector(favorSelector); // Lấy state favorite từ Redux store
  const { theme } = useTheme(); // Lấy theme hiện tại (màu nền, chữ, v.v.)

  // Hàm kiểm tra món ăn có trong danh sách yêu thích hay không
  const isFavorite = (id) => {
    return favorite.favoriteList?.includes(id);
  };

  // Hàm xử lý khi nhấn vào mũi tên điều hướng
  const handleOnArrowPress = () => {
    // Nếu không bị disable điều hướng mặc định thì chuyển đến màn hình "favorAndSuggest"
    !disabledDefaultNavigate &&
      navigation.navigate(ScreensName.favorAndSuggest, { dish: dish });

    // Nếu có hàm onArrowPress được truyền từ ngoài thì gọi nó
    onArrowPress && onArrowPress();
  };

  // Hàm xử lý khi nhấn vào nút yêu thích (trái tim)
  const handleOnSavePress = (dish) => {
    // Gửi action toggleFavorite lên Redux store
    dispatch(toggleFavorite({ id: dish._id }));

    // Gọi callback từ props nếu có
    onSavePress && onSavePress();
  };

  return (
    <TouchableOpacity
      key={dish._id} // Khóa duy nhất cho mỗi dish
      style={[
        styles.dishCard,
        { backgroundColor: theme.cardBackgroundColor }, // Dùng màu nền từ theme
      ]}
      onPress={handleOnArrowPress} // Nhấn toàn khối sẽ điều hướng
    >
      {/* Hiển thị ảnh món ăn */}
      <Image source={{ uri: dish.imageUrl }} style={styles.dishImage} />

      {/* Khối chứa thông tin món ăn */}
      <View style={styles.dishInfo}>
        {/* Tên món ăn */}
        <Text
          style={[styles.dishTitle, { color: theme.textColor }]} // Dùng màu chữ theo theme
          numberOfLines={1} // Chỉ hiển thị 1 dòng, dư sẽ cắt
        >
          {dish.name}
        </Text>

        {/* Tag loại món ăn */}
        <CategoryTag name={dish.type} />

        {/* Mô tả món ăn */}
        <Text style={styles.dishDescription} numberOfLines={2}>
          {dish.description}
        </Text>
      </View>

      {/* Nút lưu/yêu thích */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => handleOnSavePress(dish)}
      >
        {favorite.isLoading ? (
          // Hiển thị loading nếu đang xử lý thêm/xóa
          <ActivityIndicator size={normalize(24)} color="#FC8019" />
        ) : isFavorite(dish._id) ? (
          // Nếu món ăn đã yêu thích: hiện icon trái tim đôi
          <MaterialCommunityIcons
            name="heart-multiple"
            size={normalize(24)}
            color="#FC8019"
          />
        ) : (
          // Nếu chưa yêu thích: hiện icon thêm vào yêu thích
          <MaterialCommunityIcons
            name="heart-plus-outline"
            size={normalize(24)}
            color="#FC8019"
          />
        )}
      </TouchableOpacity>

      {/* Nút điều hướng (mũi tên tiến) */}
      <TouchableOpacity
        style={[
          styles.arrowButton,
          { backgroundColor: theme.nextButtonColor }, // Dùng màu từ theme
        ]}
        onPress={handleOnArrowPress}
      >
        <Ionicons name="arrow-forward" size={normalize(18)} color="white" />
      </TouchableOpacity>

      {/* Hiển thị mùa của món ăn */}
      <View
        style={[
          styles.seasonTag,
          { borderColor: getSeasonColor(dish.season) }, // Màu viền theo mùa
        ]}
      >
        <Text
          style={{
            color: getSeasonColor(dish.season), // Màu chữ theo mùa
            fontSize: normalize(6),
          }}
        >
          {dish?.season}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// StyleSheet chứa các style dùng cho component
const styles = StyleSheet.create({
  // Thẻ món ăn (card chính)
  dishCard: {
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: "white",
    marginBottom: normalize(16),
    flexDirection: "row", // Hiển thị ngang
    padding: normalize(12),
    minHeight: normalize(104),
    shadowColor: "#000", // Bóng đổ
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // Cho Android
  },
  // Hình ảnh món ăn
  dishImage: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(10),
    marginRight: normalize(12),
  },
  // Khối chứa thông tin (tên, mô tả, tag)
  dishInfo: {
    flex: 1,
    justifyContent: "center",
    paddingRight: normalize(32), // Chừa chỗ cho nút
  },
  // Tên món ăn
  dishTitle: {
    fontSize: normalize(14),
    fontWeight: "bold",
    marginBottom: normalize(4),
    width: "90%",
  },
  // Mô tả món ăn
  dishDescription: {
    fontSize: normalize(12),
    color: "#888",
    width: "90%",
    marginTop: normalize(4),
  },
  // Vị trí nút yêu thích (góc trên bên phải)
  saveButton: {
    position: "absolute",
    top: normalize(12),
    right: normalize(12),
  },
  // Nút điều hướng (mũi tên)
  arrowButton: {
    padding: normalize(4),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(8),
    position: "absolute",
    bottom: normalize(12),
    right: normalize(12),
  },
  // Tag mùa (góc trên bên trái)
  seasonTag: {
    position: "absolute",
    top: 0,
    left: 0,
    padding: normalize(4),
    paddingHorizontal: normalize(8),
    borderBottomRightRadius: normalize(8),
    borderTopLeftRadius: normalize(8),
    backgroundColor: "rgba(256,256,256,0.9)", // Màu nền trắng mờ
    borderWidth: 1,
  },
});

// Export component này để sử dụng ở nơi khác
export default DishedV1;
