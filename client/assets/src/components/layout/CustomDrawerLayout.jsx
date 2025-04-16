// Import các thư viện và components cần thiết
import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react"; // Import React và các hooks cần thiết
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native"; // Import các components cơ bản từ React Native
import {
  GestureHandlerRootView,
  DrawerLayout,
} from "react-native-gesture-handler"; // Import components để xử lý drawer và gesture
import FontistoIcon from "../common/VectorIcons/FontistoIcon"; // Import icon tùy chỉnh từ bộ Fontisto
import Ionicons from "../common/VectorIcons/Ionicons"; // Import icon tùy chỉnh từ bộ Ionicons
import MaterialIcons from "../common/VectorIcons/MaterialIcons"; // Import icon tùy chỉnh từ bộ MaterialIcons
import { useDispatch, useSelector } from "react-redux"; // Import hooks để tương tác với Redux store
import { drawerSelector, userSelector } from "../../redux/selectors/selector"; // Import selectors để lấy dữ liệu từ Redux store
import { ScreensName } from "../../constants/ScreensName"; // Import các tên màn hình để điều hướng
import { useNavigation } from "@react-navigation/native"; // Import hook để điều hướng giữa các màn hình
import {
  toggleVisible,
  updateVisible,
} from "../../redux/reducers/drawerReducer"; // Import các actions để thay đổi trạng thái drawer

// Lấy kích thước màn hình thiết bị
const HEIGHT = Dimensions.get("window").height; // Chiều cao màn hình
const WIDTH = Dimensions.get("window").width; // Chiều rộng màn hình

// Định nghĩa component CustomDrawerLayout sử dụng forwardRef để có thể truyền ref từ component cha
const CustomDrawerLayout = forwardRef(
  ({ children, drawerWidth = WIDTH * 0.7, theme }, ref) => {
    // Lấy đối tượng navigation để điều hướng
    const navigation = useNavigation();
    // Lấy trạng thái drawer từ Redux store
    const drawerVisible = useSelector(drawerSelector);
    // Tạo ref để tham chiếu đến component DrawerLayout
    const drawerRef = useRef(null);
    // Lấy thông tin user từ Redux store
    const user = useSelector(userSelector);
    // Lấy dispatch để gửi actions đến Redux store
    const dispatch = useDispatch();

    // Effect để đồng bộ trạng thái drawer với Redux store
    useEffect(() => {
      // Nếu drawer nên hiển thị theo Redux store
      if (drawerVisible.visible) {
        // Mở drawer thông qua ref
        drawerRef.current.openDrawer();
      } else {
        // Đóng drawer thông qua ref
        drawerRef.current.closeDrawer();
      }
    }, [drawerVisible]); // Chạy lại khi drawerVisible thay đổi

    // Hàm đóng drawer bằng cách gửi action toggleVisible đến Redux store
    const closeDrawer = () => {
      dispatch(toggleVisible());
    };

    // Hàm kiểm tra xác thực và điều hướng đến màn hình tương ứng
    const checkAuth = () => {
      if (user) {
        // Nếu đã đăng nhập, chuyển đến màn hình profile
        navigation.navigate(ScreensName.profile);
      } else {
        // Nếu chưa đăng nhập, chuyển đến màn hình signin
        navigation.navigate(ScreensName.signin);
      }
    };

    // Hàm điều hướng đến màn hình thông báo dựa trên trạng thái user
    const notificationNav = () => {
      if (user) {
        // Nếu đã đăng nhập
        if (user.userPreferenceId === null) {
          // Nếu chưa có preference, chuyển đến màn hình survey
          navigation.navigate(ScreensName.survey);
        } else {
          // Nếu đã có preference, chuyển đến màn hình for you
          navigation.navigate(ScreensName.forYou);
        }
      } else {
        // Nếu chưa đăng nhập, chuyển đến màn hình signin
        navigation.navigate(ScreensName.signin);
      }
    };

    // Hàm render nội dung của drawer
    const renderDrawerContent = () => {
      // Danh sách các mục trong drawer
      const drawerItems = [
        {
          title: "Home", // Tiêu đề mục
          icon: (
            <Ionicons name="home" size={24} color={theme.backButtonColor} />
          ), // Icon hiển thị
          onPress: () => {
            // Hành động khi nhấn vào mục
            navigation.navigate(ScreensName.home); // Điều hướng đến màn hình home
            closeDrawer(); // Đóng drawer
          },
        },
        {
          title: "Profile",
          icon: (
            <MaterialIcons
              name="account-circle"
              size={24}
              color={theme.backButtonColor}
            />
          ),
          onPress: () => {
            checkAuth(); // Kiểm tra xác thực trước khi điều hướng
            closeDrawer();
          },
        },
        {
          title: "Notifications",
          icon: (
            <FontistoIcon name="bell" size={24} color={theme.backButtonColor} />
          ),
          onPress: () => {
            notificationNav(); // Điều hướng đến màn hình thông báo tương ứng
            closeDrawer();
          },
        },
      ];

      return (
        // Container chính của drawer content
        <View
          style={[
            styles.drawerContent,
            { backgroundColor: theme.headerBackgroundColor },
          ]}
        >
          {/* Header của drawer hiển thị thông tin user */}
          <View style={styles.drawerHeader}>
            {/* Kiểm tra và hiển thị avatar user nếu có */}
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }} // URL của avatar
                resizeMode="cover" // Mode hiển thị ảnh
                style={[styles.profileImage, styles.avtImage]} // Style cho ảnh
              />
            ) : (
              // Nếu không có avatar, hiển thị icon mặc định
              <MaterialIcons
                name="account-circle"
                size={60}
                color={theme.backButtonColor}
              />
            )}
            {/* Hiển thị tên user hoặc "Guest" nếu không có user */}
            <Text
              style={[
                styles.drawerHeaderText,
                { color: theme.backButtonColor },
              ]}
            >
              {user?.username || "Guest"}
            </Text>
          </View>

          {/* Render các mục trong drawer bằng phương thức map */}
          {drawerItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.drawerItem}
              onPress={item.onPress}
            >
              {item.icon} {/* Hiển thị icon của mục */}
              <Text
                style={[
                  styles.drawerItemText,
                  { color: theme.backButtonColor },
                ]}
              >
                {item.title} {/* Hiển thị tiêu đề của mục */}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    };

    // Sử dụng useImperativeHandle để hiển thị các phương thức cho component cha thông qua ref
    useImperativeHandle(ref, () => ({
      openDrawer: () => drawerRef.current?.openDrawer(), // Phương thức mở drawer
      closeDrawer: () => drawerRef.current?.closeDrawer(), // Phương thức đóng drawer
    }));

    return (
      // Root view cho gesture handler
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Component DrawerLayout chính */}
        <DrawerLayout
          ref={drawerRef} // Gán ref để có thể điều khiển drawer từ code
          drawerWidth={drawerWidth} // Chiều rộng của drawer
          drawerPosition={DrawerLayout.positions.Left} // Vị trí của drawer (từ bên trái)
          drawerType="front" // Kiểu drawer (hiển thị phía trước nội dung)
          renderNavigationView={renderDrawerContent} // Hàm render nội dung của drawer
          onDrawerClose={() => {
            // Xử lý khi drawer đóng
            dispatch(updateVisible({ visible: false })); // Cập nhật trạng thái trong Redux store
          }}
        >
          {children} {/* Hiển thị nội dung con */}
        </DrawerLayout>
      </GestureHandlerRootView>
    );
  }
);

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerHeaderText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "bold",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
  avtImage: {
    width: WIDTH * 0.1,
    height: WIDTH * 0.1,
    borderRadius: 50,
  },
});

export default CustomDrawerLayout;
