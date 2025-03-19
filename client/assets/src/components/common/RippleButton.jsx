// Import các thư viện cần thiết
import React, { useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  View,
  ActivityIndicator,
} from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

// Định nghĩa component RippleButton với các props
const RippleButton = ({
  onPress, // Hàm xử lý khi button được nhấn
  children, // Cho phép truyền vào bất kỳ component con nào
  buttonStyle, // Style tùy chỉnh cho button
  textStyle, // Style cho text trong button
  backgroundColor = "rgba(256, 256, 256, 0.2)", // Màu nền mặc định cho hiệu ứng ripple
  buttonText, // Text hiển thị trong button
  leftButtonIcon, // Icon bên trái của button
  rightButtonIcon, // Icon bên phải của button
  contentContainerStyle,
  loading,
}) => {
  // Khởi tạo các state cho animation
  const [rippleScale] = useState(new Animated.Value(0)); // Scale của hiệu ứng ripple, bắt đầu từ 0
  const [rippleOpacity] = useState(new Animated.Value(1)); // Độ trong suốt của ripple, bắt đầu từ 1
  const [touchCoords, setTouchCoords] = useState({ x: 0, y: 0 }); // Vị trí touch để bắt đầu hiệu ứng

  // Hàm xử lý animation ripple
  const animateRipple = () => {
    // Reset các giá trị animation về ban đầu
    rippleScale.setValue(0);
    rippleOpacity.setValue(1);

    // Chạy đồng thời hai animation
    Animated.parallel([
      // Animation 1: Phóng to ripple
      Animated.timing(rippleScale, {
        toValue: 1, // Scale từ 0 đến 1
        duration: 200, // Thời gian animation: 200ms
        useNativeDriver: true, // Sử dụng native driver để tối ưu hiệu năng
      }),
      // Animation 2: Làm mờ dần ripple
      Animated.timing(rippleOpacity, {
        toValue: 0, // Opacity từ 1 xuống 0
        duration: 200, // Thời gian animation: 200ms
        useNativeDriver: true,
      }),
    ]).start(); // Bắt đầu chạy animation
  };

  // Xử lý sự kiện khi người dùng bắt đầu nhấn
  const handlePressIn = (event) => {
    const touch = event.nativeEvent;
    // Lưu tọa độ điểm chạm
    setTouchCoords({
      x: touch.locationX,
      y: touch.locationY,
    });
    animateRipple(); // Bắt đầu animation
  };

  // Xử lý sự kiện khi button được nhấn
  const handlePress = (event) => {
    if (onPress) {
      onPress(event);
    }
  };

  return (
    // Component Pressable để xử lý touch events
    <Pressable
      onPress={handlePress}
      // Chỉ áp dụng handlePressIn cho iOS
      onPressIn={Platform.OS === "ios" ? handlePressIn : undefined}
      // Cấu hình ripple effect cho Android
      android_ripple={
        Platform.OS === "android"
          ? {
              color: backgroundColor,
              borderless: false,
              foreground: true,
            }
          : undefined
      }
      // Style động dựa trên trạng thái pressed
      style={({ pressed }) => [
        styles.defaultButtonStyle,
        buttonStyle,
        Platform.OS === "ios" && pressed && styles.iosPressed,
      ]}
      disabled={loading}
    >
      {/* Hiệu ứng Ripple cho iOS */}
      {Platform.OS === "ios" && (
        <Animated.View
          style={[
            styles.rippleView,
            {
              backgroundColor,
              opacity: rippleOpacity, // Áp dụng animation opacity
              transform: [{ scale: rippleScale }], // Áp dụng animation scale
              left: touchCoords.x - WIDTH * 0.09, // Căn chỉnh vị trí ripple
              top: touchCoords.y - HEIGHT * 0.09,
            },
          ]}
        />
      )}
      <View style={[styles.contentContainer, contentContainerStyle]}>
        {leftButtonIcon}
        {children ||
          (buttonText && <Text style={textStyle}>{buttonText}</Text>)}
        {rightButtonIcon}
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
    </Pressable>
  );
};

// Định nghĩa styles
const styles = StyleSheet.create({
  defaultButtonStyle: {
    overflow: "hidden", // Ẩn phần tử con vượt ra ngoài
    flexDirection: "row", // Sắp xếp các phần tử theo chiều ngang
    justifyContent: "center", // Căn giữa theo chiều ngang
    alignItems: "center", // Căn giữa theo chiều dọc
    width: "100%", // Chiều rộng 100%
    padding: 12, // Padding để dễ nhấn
    borderRadius: 8, // Bo tròn góc
    position: "relative", // Để có thể định vị các phần tử con tuyệt đối
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Căn giữa theo chiều ngang
    width: "100%",
  },
  rippleView: {
    position: "absolute", // Định vị tuyệt đối so với button
    width: 200, // Chiều rộng của hiệu ứng ripple
    height: 200, // Chiều cao của hiệu ứng ripple
    borderRadius: 100, // Bo tròn để tạo hình tròn
  },
  iosPressed: {
    opacity: 0.8, // Độ trong suốt khi button được nhấn trên iOS
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});

export default RippleButton;
