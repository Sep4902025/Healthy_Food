// Import các thành phần cần thiết từ React và React Native
import React, { useState, useRef } from "react";
import {
  Dimensions, // Module để lấy kích thước màn hình
  StyleSheet, // Module để tạo stylesheet
  TextInput, // Component nhập liệu
  View, // Component hiển thị container
  Animated, // Module để tạo hiệu ứng animation
} from "react-native";


const WIDTH = Dimensions.get("window").width; // Lấy chiều rộng của màn hình thiết bị


function SigninInputField({
  state, // Giá trị hiện tại của trường nhập liệu
  setState, // Hàm để cập nhật giá trị của trường nhập liệu
  icon = null, // Icon hiển thị bên trái (tùy chọn)
  placeholder = "Enter text", // Văn bản gợi ý khi không có nội dung
  inputType = "default", // Loại bàn phím mặc định
  secureTextEntry = false, // Tùy chọn ẩn ký tự nhập vào (dùng cho mật khẩu)
  maxLength, // Giới hạn số lượng ký tự nhập vào
  keyboardType, // Loại bàn phím hiển thị
  style, // Style tùy chỉnh thêm
  iconBackgroundcolor = "#ffffff", // Màu nền của icon
}) {
 
  const animation = useRef(new Animated.Value(WIDTH * 0.85)).current; // Tạo giá trị animation với giá trị ban đầu là 85% chiều rộng màn hình

  
  const handleFocus = () => {
    Animated.timing(animation, {
      toValue: WIDTH * 0.88, // Khi focus, mở rộng trường nhập liệu đến 88% chiều rộng màn hình
      duration: 200, // Thời gian hoàn thành hiệu ứng là 200ms
      useNativeDriver: false, // Không sử dụng native driver vì đang thay đổi thuộc tính không hỗ trợ bởi native driver
    }).start();
  };

  
  const handleBlur = () => {
    Animated.timing(animation, {
      toValue: WIDTH * 0.85, // Khi mất focus, thu nhỏ trường nhập liệu về 85% chiều rộng màn hình
      duration: 200, // Thời gian hoàn thành hiệu ứng là 200ms
      useNativeDriver: false, // Không sử dụng native driver
    }).start();
  };

  return (
    
    <Animated.View
      style={[
        styles.container, // Style mặc định của container
        style, // Style tùy chỉnh được truyền từ props
        {
          width: animation, // Chiều rộng sẽ thay đổi theo giá trị của animation
        },
      ]}
    >
      
      {icon && ( // Nếu có icon được truyền vào
        <View style={[styles.icon, { backgroundColor: iconBackgroundcolor }]}>
          {icon}
        </View>
      )}

      
      <TextInput
        value={state} // Giá trị hiện tại của input
        onChangeText={setState} // Hàm xử lý khi giá trị thay đổi
        style={[styles.inputField, icon ? { marginLeft: 10 } : null]} // Thêm lề trái nếu có icon
        placeholder={placeholder} // Văn bản gợi ý
        keyboardType={keyboardType || inputType} // Loại bàn phím
        secureTextEntry={secureTextEntry} // Ẩn ký tự nhập (cho mật khẩu)
        maxLength={maxLength} // Giới hạn số ký tự
        placeholderTextColor="#999" // Màu của placeholder
        onFocus={handleFocus} // Xử lý khi trường nhập liệu được focus
        onBlur={handleBlur} // Xử lý khi trường nhập liệu mất focus
      />
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Sắp xếp các phần tử theo hàng ngang
    alignItems: "center", // Căn giữa các phần tử theo chiều dọc
    padding: 10, // Khoảng cách lề bên trong
    borderRadius: 24, // Bo tròn góc
    backgroundColor: "#ffffff", // Màu nền trắng
   
    shadowColor: "#000", // Màu đổ bóng
    shadowOffset: {
      width: 0, // Không có offset theo chiều ngang
      height: 5, // Offset theo chiều dọc là 5
    },
    shadowOpacity: 0.05, // Độ trong suốt của bóng
    shadowRadius: 4.65, // Bán kính của bóng
    elevation: 6, // Độ nổi cho Android
  },
  icon: {
    marginRight: 10, // Khoảng cách với phần tử bên phải
    padding: 12, // Khoảng cách lề bên trong
    borderRadius: 1000, // Bo tròn hoàn toàn để tạo hình tròn
  },
  inputField: {
    flex: 1, // Chiếm hết không gian còn lại trong container
    fontSize: 18, // Kích thước chữ
    color: "#000", // Màu chữ
    fontFamily: "Aleo_400Regular", // Font chữ
  },
});

export default SigninInputField; // Export component để sử dụng ở nơi khác