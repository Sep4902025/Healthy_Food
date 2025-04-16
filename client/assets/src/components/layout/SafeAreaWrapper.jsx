// Import React và các hook cần thiết từ thư viện React
import React, { useEffect, useState } from "react";
// Import các components cần thiết từ React Native
import {
  View, // Component cơ bản nhất để tạo khung layout
  Text, // Component để hiển thị văn bản
  StyleSheet, // API để tạo và quản lý styles
  StatusBar, // Component để điều khiển thanh trạng thái trên cùng của thiết bị
  Platform, // API để kiểm tra và truy cập thông tin nền tảng (iOS hay Android)
  ImageBackground, // Component để hiển thị một hình ảnh làm nền
  Dimensions, // API để lấy kích thước màn hình thiết bị
} from "react-native";
// Import các component để xử lý vùng an toàn từ thư viện react-native-safe-area-context
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
// Import hook useFocusEffect từ thư viện navigation để thực hiện hành động khi màn hình được focus
import { useFocusEffect } from "@react-navigation/native";
// Import hook tùy chỉnh để truy cập và sử dụng theme từ context
import { useTheme } from "../../contexts/ThemeContext";

// Lấy chiều rộng của màn hình thiết bị
const WIDTH = Dimensions.get("window").width;
// Lấy chiều cao của màn hình thiết bị
const HEIGHT = Dimensions.get("window").height;

// Định nghĩa component SafeAreaWrapper với các props
const SafeAreaWrapper = ({
  headerTitle = "", // Prop cho tiêu đề header, mặc định là chuỗi rỗng
  headerStyle = {
    // Prop cho style của header, với các giá trị mặc định
    backgroundColor: "transparent", // Màu nền trong suốt
    textColor: "#000000", // Màu chữ đen
    theme: "black", // Theme đen
  },
  backgroundImage, // Prop cho hình ảnh nền (không có giá trị mặc định)
  backgroundStyle, // Prop cho style của background (không có giá trị mặc định)
  children, // Prop chứa các component con
}) => {
  // Trích xuất các thuộc tính từ headerStyle
  const { backgroundColor, textColor, height } = headerStyle;
  // Sử dụng hook để lấy các giá trị insets (khoảng cách an toàn) của thiết bị
  const insets = useSafeAreaInsets();

  // Lấy theme và chế độ theme từ context thông qua hook tùy chỉnh
  const { theme, themeMode } = useTheme();

  // Sử dụng useFocusEffect để thực hiện hành động khi màn hình được focus
  useFocusEffect(
    // useCallback để tối ưu hóa hiệu suất, tránh tạo lại hàm mỗi khi render
    React.useCallback(() => {
      // Thiết lập kiểu thanh trạng thái dựa trên chế độ theme
      StatusBar.setBarStyle(
        themeMode !== "light" ? "light-content" : "dark-content",
        true
      );
    }, []) // Mảng dependencies rỗng, chỉ chạy một lần khi component mount
  );

  // Sử dụng useEffect để thực hiện hành động khi themeMode thay đổi
  useEffect(() => {
    // Thiết lập kiểu thanh trạng thái dựa trên chế độ theme
    StatusBar.setBarStyle(
      themeMode !== "light" ? "light-content" : "dark-content",
      true
    );
    // Nếu là thiết bị Android, thực hiện thêm các thiết lập dành riêng cho Android
    if (Platform.OS === "android") {
      // Thiết lập màu nền cho thanh trạng thái
      StatusBar.setBackgroundColor(theme.safeAreaBackgroundColor);
      // Cho phép hiển thị nội dung đằng sau thanh trạng thái
      StatusBar.setTranslucent(true);
    }
  }, [themeMode]); // Chạy lại khi themeMode thay đổi

  return (
    // Cung cấp context cho vùng an toàn
    <SafeAreaProvider>
      {/* View tạo một thanh màu ở trên cùng để hiển thị dưới thanh trạng thái */}
      <View
        style={{
          position: "absolute", // Vị trí tuyệt đối
          top: 0, // Gắn ở trên cùng
          left: 0, // Gắn ở bên trái
          right: 0, // Kéo dài đến bên phải
          height: height ?? insets.top, // Sử dụng height được cung cấp hoặc chiều cao insets.top nếu không có
          backgroundColor: theme.safeAreaBackgroundColor, // Màu nền từ theme
          zIndex: 2, // Đảm bảo hiển thị trên các phần tử khác
        }}
      />

      {/* Component chính để xử lý vùng an toàn */}
      <SafeAreaView style={styles.container}>
        {/* Kiểm tra xem có hình nền hay không */}
        {backgroundImage ? (
          // Nếu có hình nền, sử dụng ImageBackground
          <ImageBackground
            source={backgroundImage} // Nguồn hình ảnh
            style={[styles.background, backgroundStyle || {}]} // Style mặc định kết hợp với style tùy chỉnh
            imageStyle={{ resizeMode: "cover" }} // Style cho hình ảnh, đảm bảo phủ đầy
          >
            {/* Kiểm tra xem có tiêu đề header hay không */}
            {headerTitle ? (
              // Nếu có tiêu đề, hiển thị header
              <View style={styles.header}>
                {/* Hiển thị text với style và màu được cung cấp */}
                <Text style={[styles.headerText, { color: textColor }]}>
                  {headerTitle}
                </Text>
              </View>
            ) : null}
            {/* Container cho nội dung chính */}
            <View style={styles.content}>{children}</View>
          </ImageBackground>
        ) : (
          // Nếu không có hình nền
          <>
            {/* Kiểm tra xem có tiêu đề header hay không */}
            {headerTitle ? (
              // Nếu có tiêu đề, hiển thị header với màu nền được cung cấp
              <View style={[styles.header, { backgroundColor }]}>
                {/* Hiển thị text với style và màu được cung cấp */}
                <Text style={[styles.headerText, { color: textColor }]}>
                  {headerTitle}
                </Text>
              </View>
            ) : null}
            {/* Container cho nội dung chính với style được cung cấp */}
            <View style={[styles.content, backgroundStyle]}>{children}</View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  // Styles giữ nguyên theo yêu cầu
  container: {
    flex: 1,
    width: WIDTH,
    height: HEIGHT,
    position: "relative",
  },
  background: {
    flex: 1,
    backgroundColor: "red",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 15 : 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    zIndex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    zIndex: 0,
  },
});

// Export component để sử dụng ở nơi khác
export default SafeAreaWrapper;
