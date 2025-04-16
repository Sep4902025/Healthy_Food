// Import các thư viện và components cần thiết
import React, { useEffect, useState } from "react"; // Import React và các hooks
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Import các components cơ bản từ React Native
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"; // Import các icon từ Expo
import { useNavigation } from "@react-navigation/native"; // Import hook điều hướng
import { useDispatch, useSelector } from "react-redux"; // Import hooks để tương tác với Redux store
import { userSelector } from "../../redux/selectors/selector"; // Import selector để lấy thông tin user từ Redux
import { ScreensName } from "../../constants/ScreensName"; // Import các tên màn hình để điều hướng
import { useTheme } from "../../contexts/ThemeContext"; // Import hook lấy theme từ context
import MaterialIcons from "../common/VectorIcons/MaterialIcons"; // Import component icon tùy chỉnh
import { toggleVisible } from "../../redux/reducers/drawerReducer"; // Import action để điều khiển drawer
import ReminderNotification from "../../screens/MealPlan/ReminderNotification"; // Import component thông báo nhắc nhở
import RemindService from "../../services/reminderService"; // Import service xử lý nhắc nhở

import Cart from "../../screens/MealPlan/Cart"; // Import component giỏ hàng
import mealPlanService from "../../services/mealPlanService"; // Import service xử lý meal plan

// Định nghĩa component Header
function Header() {
  // Lấy đối tượng navigation để điều hướng giữa các màn hình
  const navigation = useNavigation();
  // Lấy thông tin user từ Redux store
  const user = useSelector(userSelector);
  // Lấy dispatch để gửi actions đến Redux store
  const dispatch = useDispatch();
  // Lấy theme từ context
  const { theme } = useTheme();
  // State lưu trạng thái hiển thị của giỏ hàng
  const [cartVisible, setCartVisible] = useState(false);
  // State lưu số lượng meal plan chưa thanh toán
  const [mealPlanCount, setMealPlanCount] = useState(0);

  // Lấy token xác thực từ thông tin user
  const token = user?.accessToken;

  // Effect thực thi khi component mount hoặc user/token thay đổi
  useEffect(() => {
    // Kiểm tra nếu có user ID và token
    if (user?._id && token) {
      // Kết nối socket cho service nhắc nhở
      RemindService.connectSocket(user._id);
      // Hàm lấy danh sách meal plan chưa thanh toán
      const fetchUnpaidMealPlans = async () => {
        try {
          // Gọi API để lấy danh sách meal plan chưa thanh toán
          const response = await mealPlanService.getUnpaidMealPlanForUser(
            user._id
          );
          // Nếu thành công, cập nhật số lượng
          if (response.success) {
            setMealPlanCount(response.data.length);
          } else {
            // Nếu không thành công, đặt số lượng về 0
            setMealPlanCount(0);
          }
        } catch (error) {
          // Nếu có lỗi, đặt số lượng về 0
          setMealPlanCount(0);
        }
      };
      // Gọi hàm để fetch dữ liệu
      fetchUnpaidMealPlans();
    }

    // Hàm cleanup khi component unmount
    return () => {
      // Ngắt kết nối socket
      RemindService.disconnect();
    };
  }, [user, token]); // Chạy lại khi user hoặc token thay đổi

  // Hàm kiểm tra xác thực và điều hướng
  const checkAuth = () => {
    // Nếu đã đăng nhập, chuyển tới màn hình profile
    if (user) {
      navigation.navigate(ScreensName.profile);
    } else {
      // Nếu chưa đăng nhập, chuyển tới màn hình signin
      navigation.navigate(ScreensName.signin);
    }
  };

  // Hàm xử lý khi nhấn vào biểu tượng drawer
  const onDrawerPress = () => {
    // Gửi action để mở/đóng drawer
    dispatch(toggleVisible());
  };

  // Hàm xử lý hiển thị/ẩn giỏ hàng
  const toggleCart = () => {
    // Nếu đã đăng nhập, chuyển đổi trạng thái hiển thị giỏ hàng
    if (user) {
      setCartVisible(!cartVisible);
    } else {
      // Nếu chưa đăng nhập, chuyển tới màn hình signin
      navigation.navigate(ScreensName.signin);
    }
  };

  return (
    // Container chính của header
    <View
      style={{
        ...styles.container, // Style mặc định
        backgroundColor: theme.headerBackgroundColor, // Màu nền từ theme
      }}
    >
      {/* Nút mở drawer */}
      <TouchableOpacity style={styles.backIcon} onPress={onDrawerPress}>
        <Ionicons
          name="reorder-three" // Icon menu 3 gạch ngang
          size={32} // Kích thước icon
          color={theme.backButtonColor} // Màu icon từ theme
        />
      </TouchableOpacity>

      {/* Container phải chứa các nút thông báo, giỏ hàng và profile */}
      <View style={styles.rightContainer}>
        {/* Component thông báo nhắc nhở, chỉ hiển thị khi đã đăng nhập */}
        {user && <ReminderNotification userId={user?._id} />}

        {/* Đây là code bị comment lại, có thể là nút thông báo cũ */}
        {/* <TouchableOpacity
          onPress={() => navigation.navigate(ScreensName.signin)}
        >
          <Text style={{ fontSize: 32, color: theme.backButtonColor }}>🔔</Text>
        </TouchableOpacity> */}

        {/* Icon giỏ hàng, chỉ hiển thị khi đã đăng nhập */}
        {user && (
          <TouchableOpacity onPress={toggleCart} style={styles.cartContainer}>
            <Ionicons
              name="cart-outline" // Icon giỏ hàng
              size={32} // Kích thước icon
              color={theme.backButtonColor} // Màu icon từ theme
            />
            {/* Badge hiển thị số lượng item trong giỏ, chỉ hiển thị khi có ít nhất 1 item */}
            {mealPlanCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{mealPlanCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {/* Icon profile */}
        <TouchableOpacity onPress={checkAuth}>
          {/* Nếu user có avatar thì hiển thị avatar */}
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }} // URL của ảnh avatar
              resizeMode="cover" // Mode hiển thị ảnh
              style={[styles.profileImage, styles.avtImage]} // Style cho ảnh avatar
            />
          ) : (
            // Nếu không có avatar thì hiển thị icon user mặc định
            <MaterialIcons
              name="account-circle" // Icon user
              size={40} // Kích thước icon
              color={theme.backButtonColor} // Màu icon từ theme
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Component giỏ hàng dưới dạng modal */}
      <Cart
        visible={cartVisible} // Trạng thái hiển thị của modal
        onClose={() => setCartVisible(false)} // Hàm xử lý khi đóng modal
        mealPlanCount={mealPlanCount} // Số lượng meal plan chưa thanh toán
      />
    </View>
  );
}

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  container: {
    position: "relative", // Cho phép định vị các phần tử con
    flexDirection: "row", // Sắp xếp theo chiều ngang
    alignItems: "center", // Căn giữa theo chiều dọc
    justifyContent: "flex-end", // Đẩy các phần tử về phía bên phải
    padding: 20, // Padding cho container
    paddingVertical: 10, // Padding theo chiều dọc
    backgroundColor: "#fff", // Màu nền mặc định
  },
  backIcon: {
    position: "absolute", // Định vị tuyệt đối
    left: "5%", // Cách mép trái 5%
    zIndex: 999, // Đảm bảo hiển thị trên cùng
  },
  rightContainer: {
    flexDirection: "row", // Sắp xếp theo chiều ngang
    alignItems: "center", // Căn giữa theo chiều dọc
    gap: 12, // Khoảng cách giữa các phần tử
  },
  profileImage: {
    height: 40, // Chiều cao ảnh
    width: 40, // Chiều rộng ảnh
  },
  avtImage: {
    borderRadius: 100, // Bo tròn ảnh avatar
  },
  cartContainer: {
    position: "relative", // Cho phép định vị badge
  },
  badge: {
    position: "absolute", // Định vị tuyệt đối
    top: -5, // Vị trí từ trên xuống
    right: -5, // Vị trí từ phải qua
    backgroundColor: "red", // Màu nền badge
    borderRadius: 10, // Bo tròn badge
    minWidth: 20, // Chiều rộng tối thiểu
    height: 20, // Chiều cao
    justifyContent: "center", // Căn giữa nội dung theo chiều dọc
    alignItems: "center", // Căn giữa nội dung theo chiều ngang
  },
  badgeText: {
    color: "#fff", // Màu chữ trắng
    fontSize: 12, // Cỡ chữ
    fontWeight: "bold", // Độ đậm chữ
    textAlign: "center", // Căn giữa văn bản
  },
});

// Export component để sử dụng ở nơi khác
export default Header;