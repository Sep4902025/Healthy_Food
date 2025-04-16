// Import LinearGradient từ thư viện expo để tạo hiệu ứng nền chuyển màu
import { LinearGradient } from "expo-linear-gradient";

// Import các component và API từ react-native để dựng UI
import { Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";

// Import icon từ file VectorIcons/Ionicons (có thể là wrapper custom)
import Ionicons from "./VectorIcons/Ionicons";

// Import hook useTheme để lấy theme và themeMode từ context
import { useTheme } from "../../contexts/ThemeContext";

// Lấy chiều rộng và chiều cao của màn hình
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

// Component Header cho Edit Modal
export const EditModalHeader = ({ onCancel }) => {
  // Lấy theme hiện tại và chế độ sáng/tối từ context
  const { theme, themeMode } = useTheme();

  return (
    // Nền LinearGradient chuyển màu theo cấu hình theme
    <LinearGradient
      colors={theme.editModalHeaderBackgroundColor} // Mảng màu được định nghĩa trong theme
      style={styles.container} // Áp dụng style cho container
      start={{ x: 0, y: 0 }} // Bắt đầu gradient từ góc trên trái
      end={{ x: 0, y: 1 }} // Kết thúc gradient ở góc dưới trái
    >
      {/* Ảnh decor hiển thị theo chế độ sáng/tối */}
      <Image
        source={
          themeMode === "light"
            ? require("../../../assets/image/EditModalHeaderDecor.png") // ảnh cho chế độ sáng
            : require("../../../assets/image/EditModalHeaderDecorDark.png") // ảnh cho chế độ tối
        }
        style={styles.headerDecor} // style cho hình ảnh
        resizeMode="contain" // giữ tỉ lệ hình ảnh gốc
      />

      {/* Nút quay lại, gọi hàm onCancel khi nhấn */}
      <TouchableOpacity style={styles.backButton} onPress={onCancel}>
        <Ionicons name="chevron-back" size={24} color="white" /> {/* Icon mũi tên */}
      </TouchableOpacity>
    </LinearGradient>
  );
};

// Định nghĩa style cho các phần tử
const styles = StyleSheet.create({
  // style cho container gradient
  container: {
    position: "relative", // cần thiết cho positioning bên trong
    height: HEIGHT * 0.2, // cao 20% chiều cao màn hình
    width: WIDTH, // full chiều rộng
    justifyContent: "center", // căn giữa nội dung theo chiều dọc
  },

  // style cho nút back
  backButton: {
    position: "absolute", // đặt tuyệt đối
    left: "8%", // cách trái 8% chiều rộng màn hình
    padding: 8, // padding đều
    paddingHorizontal: 2, // padding ngang là 2 (có thể chỉnh lên cho dễ bấm)
    zIndex: 999, // đảm bảo hiển thị trên cùng
    backgroundColor: "rgba(0,0,0,0.3)", // nền mờ đen
    borderRadius: 8, // bo tròn nút
  },

  // style cho hình ảnh trang trí
  headerDecor: {
    position: "absolute", // đặt tuyệt đối
    height: "100%", // cao bằng container
    right: "-15%", // đẩy hình sang phải ngoài màn hình 1 chút để tạo hiệu ứng
  },
});
