// Import các thư viện cần thiết
import React, { useState, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  View,
  Animated,
} from "react-native";

// Lấy chiều rộng màn hình device
const WIDTH = Dimensions.get("window").width;

// Component SigninInputField với các props được truyền vào
function SigninInputField({
  state, // Giá trị của input
  setState, // Function để update giá trị input
  icon = null, // Icon component (tùy chọn)
  placeholder = "Enter text", // Placeholder text mặc định
  inputType = "default", // Loại input (default, email-address, numeric,...)
  secureTextEntry = false, // Ẩn text (dùng cho password)
  maxLength, // Độ dài tối đa của input
  keyboardType, // Loại bàn phím (override inputType)
  style, // Style tùy chỉnh cho container
  iconBackgroundcolor = "#ffffff", // Màu nền của icon
}) {
  // Khởi tạo giá trị animation cho width
  const animation = useRef(new Animated.Value(WIDTH * 0.85)).current;

  // Xử lý khi input được focus
  const handleFocus = () => {
    Animated.timing(animation, {
      toValue: WIDTH * 0.88, // Mở rộng width lên 88%
      duration: 200, // Thời gian animation
      useNativeDriver: false, // Không sử dụng native driver vì animate width
    }).start();
  };

  // Xử lý khi input mất focus
  const handleBlur = () => {
    Animated.timing(animation, {
      toValue: WIDTH * 0.85, // Thu nhỏ width về 85%
      duration: 200, // Thời gian animation
      useNativeDriver: false,
    }).start();
  };

  return (
    // Container với width được animate
    <Animated.View
      style={[
        styles.container,
        style,
        {
          width: animation,
        },
      ]}
    >
      {/* Render icon nếu được truyền vào */}
      {icon && (
        <View style={[styles.icon, { backgroundColor: iconBackgroundcolor }]}>
          {icon}
        </View>
      )}

      {/* Input field */}
      <TextInput
        value={state}
        onChangeText={setState}
        style={[styles.inputField, icon ? { marginLeft: 10 } : null]}
        placeholder={placeholder}
        keyboardType={keyboardType || inputType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        placeholderTextColor="#999"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Animated.View>
  );
}

// Styles cho component
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    alignItems: "center", // Căn giữa các item
    padding: 10, // Padding cho container
    borderRadius: 24, // Bo tròn góc
    backgroundColor: "#ffffff", // Màu nền trắng
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4.65,
    elevation: 6, // Shadow cho Android
  },
  icon: {
    marginRight: 10, // Khoảng cách với input
    padding: 12, // Padding cho icon
    borderRadius: 1000, // Bo tròn icon thành hình tròn
  },
  inputField: {
    flex: 1, // Chiếm hết không gian còn lại
    fontSize: 18, // Cỡ chữ
    color: "#000", // Màu chữ
    fontFamily: "Aleo_400Regular",
  },
});

export default SigninInputField;
