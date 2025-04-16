import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AntDesignIcon from "./VectorIcons/AntDesignIcon"; // Icon từ AntDesign (không dùng trong file này)
import { useDispatch, useSelector } from "react-redux"; // Dùng để dispatch action và lấy state từ Redux store
import { favorSelector } from "../../redux/selectors/selector"; // (Không dùng trong file này)
import { toggleFavorite } from "../../redux/actions/favoriteThunk"; // Action để bật/tắt yêu thích
import MaterialCommunityIcons from "./VectorIcons/MaterialCommunityIcons"; // Icon trái tim yêu thích
import { useTheme } from "../../contexts/ThemeContext"; // Hook lấy theme từ context
import { ScreensName } from "../../constants/ScreensName"; // Tên màn hình điều hướng
const HEIGHT = Dimensions.get("window").height; // Lấy chiều cao của màn hình thiết bị

// Component hiển thị món ăn yêu thích (item), có thể nhấn vào để chuyển màn hình hoặc bỏ yêu thích
const DishedFavor = ({ item, navigation }) => {
  const dispatch = useDispatch(); // Lấy dispatch để gửi action Redux
  const { theme } = useTheme(); // Lấy theme hiện tại

  // Xử lý khi nhấn icon trái tim để bỏ/thêm yêu thích
  const handleOnChangeFavorite = () => {
    dispatch(toggleFavorite({ id: item._id }));
  };

  return (
    // Khi nhấn toàn bộ component sẽ chuyển qua màn hình chi tiết món ăn
    <TouchableOpacity
      style={{
        ...styles.dishedFavorContainer,
        backgroundColor: theme.cardBackgroundColor, // Dùng màu theo theme
      }}
      onPress={() => {
        navigation.navigate(ScreensName.favorAndSuggest, { dish: item });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl } // Nếu có ảnh thì dùng ảnh từ URL
              : require("../../../assets/image/blueberry-egg.png") // Nếu không có thì dùng ảnh mặc định
          }
          style={styles.dishImage}
          resizeMode="cover"
        />
        {/* Icon trái tim nằm trên ảnh, cho phép xoá khỏi danh sách yêu thích */}
        <TouchableOpacity
          style={styles.videoIndicator}
          activeOpacity={0.9}
          onPress={handleOnChangeFavorite}
        >
          <MaterialCommunityIcons
            name="heart-multiple" // Icon trái tim
            size={24}
            color="#40B491" // Màu xanh lá
          />
        </TouchableOpacity>
      </View>

      {/* Tên món ăn */}
      <Text style={{ ...styles.dishTitle, color: theme.textColor }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

// StyleSheet chứa style cho component
const styles = StyleSheet.create({
  dishedFavorContainer: {
    minHeight: HEIGHT * 0.2, // Chiều cao tối thiểu là 20% màn hình
    backgroundColor: "white", // Màu nền mặc định (có thể bị ghi đè bởi theme)
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "white",
    position: "relative",
    padding: 8,
    shadowColor: "#000", // Đổ bóng (chỉ hoạt động trên Android nếu có elevation)
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 3, // Đổ bóng trên Android
  },
  imageContainer: {
    position: "relative", // Để icon trái tim có thể đặt tuyệt đối bên trong
  },
  dishImage: {
    width: "100%",
    height: HEIGHT * 0.12, // 12% chiều cao màn hình
    borderRadius: 8,
  },
  videoIndicator: {
    position: "absolute", // Đặt icon trái tim nằm trên ảnh
    top: 8,
    right: 8,
    backgroundColor: "white",
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  videoIcon: {
    fontSize: 12, // (Không sử dụng trong file này)
  },
  dishTitle: {
    fontSize: 14,
    fontWeight: "bold",
    padding: 8,
  },
  deleteButton: {
    // (Chưa dùng) Có thể dùng để thêm nút xoá bên dưới sau này
    bottom: 8,
    alignSelf: "center",
  },
  deleteIcon: {
    color: "#FF0000",
    fontSize: 16,
  },
});

export default DishedFavor; // Xuất component để sử dụng ở nơi khác
