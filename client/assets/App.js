// Import thư viện Linking từ expo để xử lý các deeplink URL
import * as Linking from "expo-linking";
// Import thư viện để xử lý các cử chỉ (vuốt, kéo, v.v) trong ứng dụng
import "react-native-gesture-handler";
// Import Provider từ react-redux để cung cấp store Redux cho toàn bộ ứng dụng
import { Provider } from "react-redux";
// Import các component cơ bản từ React Native
import { ActivityIndicator, Text, View } from "react-native";
// Import Redux store từ thư mục redux
import store from "./src/redux/store";
// Import component Navigator chính của ứng dụng
import Navigator from "./src/router/Navigator";
// Import React và hook useEffect
import React, { useEffect } from "react";
// Import thư viện Toast để hiển thị thông báo toast
import Toast from "react-native-toast-message";
// Import file CSS toàn cục
import "./global.css";

// Import các font Aleo từ thư viện Google Fonts Expo
import {
  useFonts, // Hook để tải và sử dụng font
  Aleo_300Light, // Font Aleo nhẹ
  Aleo_300Light_Italic, // Font Aleo nhẹ nghiêng
  Aleo_400Regular, // Font Aleo thường
  Aleo_400Regular_Italic, // Font Aleo thường nghiêng
  Aleo_700Bold, // Font Aleo đậm
  Aleo_700Bold_Italic, // Font Aleo đậm nghiêng
} from "@expo-google-fonts/aleo";
// Import ThemeProvider từ context để quản lý theme
import { ThemeProvider } from "./src/contexts/ThemeContext";
// Import service xử lý socket cho tin nhắn realtime
import messageSocket from "./src/services/messageSocket";

// Lưu trữ phương thức render mặc định của component Text
const DefaultText = Text.render;
// Tạo phương thức render tùy chỉnh để áp dụng font mặc định cho tất cả văn bản
const customTextRender = function (...args) {
  // Gọi phương thức render mặc định với các đối số được truyền vào
  const originText = DefaultText.apply(this, args);
  // Sao chép element và thêm font mặc định vào style
  return React.cloneElement(originText, {
    style: [{ fontFamily: "Aleo_400Regular" }, originText.props.style],
  });
};

// Ghi đè phương thức render của Text để sử dụng phương thức tùy chỉnh
Text.render = customTextRender;

// Component chính của ứng dụng
export default function App() {
  // Tải các font sử dụng hook useFonts
  // Gọi tất cả hooks trước bất kỳ lệnh return nào
  const [fontsLoaded] = useFonts({
    Aleo_300Light, // Đăng ký font Aleo nhẹ
    Aleo_300Light_Italic, // Đăng ký font Aleo nhẹ nghiêng
    Aleo_400Regular, // Đăng ký font Aleo thường
    Aleo_400Regular_Italic, // Đăng ký font Aleo thường nghiêng
    Aleo_700Bold, // Đăng ký font Aleo đậm
    Aleo_700Bold_Italic, // Đăng ký font Aleo đậm nghiêng
  });

  // Cấu hình các kiểu Toast thông báo
  const toastConfig = {
    // Cấu hình thông báo thành công
    success: ({ text1, text2, props }) => (
      <View style={{ backgroundColor: "green", padding: 10, borderRadius: 5 }}>
        <Text style={{ color: "white" }}>{text1}</Text>
        {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
      </View>
    ),
    // Cấu hình thông báo lỗi
    error: ({ text1, text2, props }) => (
      <View style={{ backgroundColor: "red", padding: 10, borderRadius: 5 }}>
        <Text style={{ color: "white" }}>{text1}</Text>
        {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
      </View>
    ),
    // Cấu hình thông báo cảnh báo
    warning: ({ text1, text2, props }) => (
      <View style={{ backgroundColor: "yellow", padding: 10, borderRadius: 5 }}>
        <Text style={{ color: "white" }}>{text1}</Text>
        {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
      </View>
    ),
    // Cấu hình thông báo thông tin
    info: ({ text1, text2, props }) => (
      <View style={{ backgroundColor: "blue", padding: 10, borderRadius: 5 }}>
        <Text style={{ color: "white" }}>{text1}</Text>
        {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
      </View>
    ),
  };

  // Hiển thị màn hình loading khi đang tải font
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render UI chính của ứng dụng sau khi font đã tải xong
  return (
    // Provider bao bọc toàn bộ ứng dụng để cung cấp Redux store
    <Provider store={store}>
      {/* ThemeProvider cung cấp theme cho toàn bộ ứng dụng */}
      <ThemeProvider>
        {/* Navigator chính của ứng dụng xử lý định tuyến các màn hình */}
        <Navigator />
        {/* Component Toast để hiển thị thông báo */}
        <Toast config={toastConfig} />
      </ThemeProvider>
    </Provider>
  );
}