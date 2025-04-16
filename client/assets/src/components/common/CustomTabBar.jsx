import React from "react"; // Import React
import { View, TouchableOpacity, Dimensions, StyleSheet } from "react-native"; // Import các component cần thiết từ react-native
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient để tạo hiệu ứng nền chuyển màu
import { ScreensMap } from "../../router/ScreensMap"; // Import danh sách các màn hình (route) từ file cấu hình
import MaterialCommunityIcons from "./VectorIcons/MaterialCommunityIcons"; // Import icon từ bộ MaterialCommunityIcons
import { ScreensName } from "../../constants/ScreensName"; // Import danh sách tên các màn hình (const)
import { useTheme } from "../../contexts/ThemeContext"; // Import hook context chủ đề (sáng/tối)
import { userSelector } from "../../redux/selectors/selector"; // Import selector lấy user từ Redux
import { useSelector } from "react-redux"; // Hook để sử dụng Redux state

// Lấy chiều cao màn hình
const HEIGHT = Dimensions.get("window").height;

const CustomTabBar = ({ state, descriptors, navigation }) => {
  // Lấy thông tin theme hiện tại từ context
  const { theme } = useTheme();
  // Lấy thông tin người dùng hiện tại từ Redux
  const user = useSelector(userSelector);

  // Lấy route chính (Main), chứa Stack Navigator
  const mainRoute = state.routes[0];
  const mainRouteState = mainRoute?.state;

  // Lấy index của màn hình hiện tại trong stack
  const currentRouteIndex = mainRouteState?.index || 0;

  // Khởi tạo tên màn hình hiện tại, mặc định là "Home"
  let currentScreenName = "Home";

  // Kiểm tra và cập nhật tên màn hình hiện tại nếu có dữ liệu
  if (
    mainRouteState &&
    mainRouteState.routes &&
    mainRouteState.routes.length > 0
  ) {
    currentScreenName = mainRouteState.routes[currentRouteIndex].name;
  }

  // Tìm màn hình hiện tại trong danh sách ScreensMap
  const currentScreen =
    ScreensMap.find((screen) => screen.name === currentScreenName) ||
    ScreensMap[0];

  // Nếu màn hình hiện tại có cờ `hiddenBottomTab` thì ẩn thanh tab
  if (currentScreen?.hiddenBottomTab) {
    return <View />; // Vẫn giữ không gian layout
  }

  // Lọc ra các tab có thể hiển thị trên thanh tab bar
  const visibleTabs = ScreensMap.filter(
    (screen) =>
      !(
        screen.options?.tabBarButton &&
        typeof screen.options.tabBarButton === "function"
      ) && screen.options?.tabBarIcon
  );

  return (
    <>
      {/* Khoảng trống phía dưới để tránh đè nội dung */}
      <View style={{ height: HEIGHT * 0.08, width: "100%" }} />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: HEIGHT * 0.08,
          elevation: 8, // Tạo độ nổi (bóng đổ)
          shadowColor: theme.mode === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme.mode === "dark" ? 0.3 : 0.1,
          shadowRadius: 3,
          backgroundColor: "transparent", // Đảm bảo nền trong suốt
          zIndex: 999, // Đảm bảo hiển thị trên cùng
        }}
      >
        {/* Nền chuyển màu của thanh tab */}
        <LinearGradient
          colors={[theme.tabBarBackgroundColor, theme.tabBarBackgroundColor]}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        {/* Container chứa các tab */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around", // Các tab được chia đều
            height: "100%",
            alignItems: "center",
          }}
        >
          {visibleTabs.map((screen, index) => {
            // Kiểm tra xem tab hiện tại có được chọn không
            const isFocused = currentScreenName === screen.name;

            // Xử lý khi người dùng nhấn vào một tab
            const onPress = () => {
              if (!isFocused) {
                // Nếu màn hình yêu cầu đăng nhập
                if (screen?.options?.requireAuthen) {
                  if (!user) {
                    // Nếu chưa đăng nhập thì chuyển sang màn hình đăng nhập
                    navigation.navigate("Main", {
                      screen: ScreensName.signin,
                    });
                  } else {
                    // Nếu đã đăng nhập thì chuyển đến màn hình tương ứng
                    navigation.navigate("Main", {
                      screen: screen.name,
                    });
                  }
                } else {
                  // Nếu không yêu cầu đăng nhập thì chuyển luôn
                  navigation.navigate("Main", {
                    screen: screen.name,
                  });
                }
              }
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={screen.name}
                onPress={onPress}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  ...(screen.options?.iconStyles || {}),
                }}
              >
                {/* Hiển thị icon của tab nếu có */}
                {screen.options?.tabBarIcon &&
                  screen.options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused
                      ? theme.tabBarActiveIcon ||
                        screen.options?.activeColor ||
                        "#FF7400"
                      : theme.tabBarInactiveIcon ||
                        screen.options?.inactiveColor ||
                        "#ABB7C2",
                    size: 28,
                  })}
              </TouchableOpacity>
            );
          })}

          {/* Nút trung tâm (nút Home) */}
          <TouchableOpacity
            style={{
              position: "absolute",
              alignSelf: "center",
              top: "-50%",
              left: "50%",
              transform: [{ translateX: -HEIGHT * 0.04 }],
              width: HEIGHT * 0.08,
              height: HEIGHT * 0.08,
              borderRadius: 50,
              backgroundColor: theme.mode === "dark" ? "#333" : "#ff9900", // Màu nền theo theme
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              // Khi nhấn vào nút trung tâm thì chuyển về màn hình Home
              navigation.navigate("Main", {
                screen: ScreensName.home,
              });
            }}
            activeOpacity={0.9}
          >
            {/* Nền gradient cho nút trung tâm */}
            <LinearGradient
              colors={
                theme.mode === "dark"
                  ? ["#2a7660", "#333333"]
                  : ["#40B491", "#FFFFFF"]
              }
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: 50,
              }}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            >
              {/* Phần bên trong sẽ có biểu tượng */}
            </LinearGradient>
            <MaterialCommunityIcons
              name="home"
              size={42}
              color={theme.mode === "dark" ? "#E075A2" : "#F398C1"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CustomTabBar; // Xuất component CustomTabBar
