// Import React và useState hook
import React, { useState } from "react";
// Import các component và API từ React Native
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

// Lấy kích thước màn hình thiết bị
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

// Định nghĩa component RippleButton với các props
const RippleButton = ({
 onPress,                // Hàm xử lý khi nhấn button
 children,               // Nội dung con của button
 buttonStyle,            // Style tùy chỉnh cho button
 textStyle,              // Style tùy chỉnh cho text
 backgroundColor = "rgba(256, 256, 256, 0.2)", // Màu nền hiệu ứng ripple
 buttonText,             // Text của button
 leftButtonIcon,         // Icon bên trái
 rightButtonIcon,        // Icon bên phải
 contentContainerStyle,  // Style cho container chứa nội dung
 loading,                // Trạng thái loading
}) => {
 // Khởi tạo các state cho hiệu ứng ripple
 const [rippleScale] = useState(new Animated.Value(0));   // Scale của hiệu ứng
 const [rippleOpacity] = useState(new Animated.Value(1)); // Độ trong suốt
 const [touchCoords, setTouchCoords] = useState({ x: 0, y: 0 }); // Vị trí chạm

 // Hàm tạo hiệu ứng ripple
 const animateRipple = () => {
   // Reset các giá trị ban đầu
   rippleScale.setValue(0);
   rippleOpacity.setValue(1);

   // Chạy song song 2 animation
   Animated.parallel([
     // Animation phóng to hiệu ứng
     Animated.timing(rippleScale, {
       toValue: 1,         // Phóng to tới kích thước 1
       duration: 200,      // Thời gian 200ms
       useNativeDriver: true, // Sử dụng native driver để tối ưu hiệu năng
     }),

     // Animation làm mờ dần hiệu ứng
     Animated.timing(rippleOpacity, {
       toValue: 0,         // Độ trong suốt giảm xuống 0
       duration: 200,      // Thời gian 200ms
       useNativeDriver: true, // Sử dụng native driver
     }),
   ]).start();
 };

 // Xử lý khi bắt đầu nhấn button
 const handlePressIn = (event) => {
   // Lấy thông tin sự kiện chạm
   const touch = event.nativeEvent;

   // Lưu tọa độ nơi chạm
   setTouchCoords({
     x: touch.locationX,
     y: touch.locationY,
   });
   // Kích hoạt hiệu ứng ripple
   animateRipple();
 };

 // Xử lý khi nhấn button
 const handlePress = (event) => {
   // Gọi hàm onPress nếu được truyền vào
   if (onPress) {
     onPress(event);
   }
 };

 // Render component
 return (
   // Component Pressable từ React Native
   <Pressable
     onPress={handlePress}     // Xử lý khi nhấn
     onPressIn={Platform.OS === "ios" ? handlePressIn : undefined} // Chỉ xử lý trên iOS
     android_ripple={
       Platform.OS === "android"
         ? {
             color: backgroundColor,  // Màu của ripple trên Android
             borderless: false,       // Không phải dạng borderless
             foreground: true,        // Hiển thị phía trên nội dung
           }
         : undefined
     }
     // Kết hợp styles mặc định và tùy chỉnh
     style={{ ...styles.defaultButtonStyle, ...buttonStyle }}
     // Vô hiệu hóa button khi đang loading
     disabled={loading}
   >
     {/* Hiệu ứng ripple chỉ cho iOS */}
     {Platform.OS === "ios" && (
       <Animated.View
         style={[
           styles.rippleView,
           {
             backgroundColor,         // Màu nền ripple
             opacity: rippleOpacity,  // Độ trong suốt animated
             transform: [{ scale: rippleScale }], // Scale animated
             left: touchCoords.x - WIDTH * 0.09,  // Vị trí tính từ điểm chạm
             top: touchCoords.y - HEIGHT * 0.09,  // Vị trí tính từ điểm chạm
           },
         ]}
       />
     )}
     {/* Container chứa nội dung button */}
     <View style={[styles.contentContainer, contentContainerStyle]}>
       {leftButtonIcon}  {/* Icon bên trái nếu có */}
       {children ||
         (buttonText && <Text style={textStyle}>{buttonText}</Text>)} {/* Nội dung button */}
       {rightButtonIcon} {/* Icon bên phải nếu có */}
     </View>
     {/* Hiển thị loading indicator khi loading = true */}
     {loading && (
       <View style={styles.loadingContainer}>
         <ActivityIndicator size="small" color="white" />
       </View>
     )}
   </Pressable>
 );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
 defaultButtonStyle: {
   overflow: "hidden",            // Ẩn nội dung tràn ra ngoài
   flexDirection: "row",          // Sắp xếp theo hàng ngang
   justifyContent: "center",      // Căn giữa theo chiều ngang
   alignItems: "center",          // Căn giữa theo chiều dọc
   width: "100%",                 // Chiều rộng 100%
   padding: 12,                   // Padding xung quanh
   borderRadius: 8,               // Bo tròn góc
   position: "relative",          // Vị trí tương đối để xác định vị trí các phần tử con
 },
 contentContainer: {
   flexDirection: "row",          // Sắp xếp theo hàng ngang
   alignItems: "center",          // Căn giữa theo chiều dọc
   justifyContent: "center",      // Căn giữa theo chiều ngang
   width: "100%",                 // Chiều rộng 100%
 },
 rippleView: {
   position: "absolute",          // Vị trí tuyệt đối
   width: 200,                    // Kích thước ripple
   height: 200,                   // Kích thước ripple
   borderRadius: 100,             // Bo tròn thành hình tròn
 },
 iosPressed: {
   opacity: 0.8,                  // Độ mờ khi nhấn trên iOS
 },
 loadingContainer: {
   position: "absolute",          // Vị trí tuyệt đối
   top: 0,                        // Căn chỉnh vị trí
   left: 0,                       // Căn chỉnh vị trí
   right: 0,                      // Căn chỉnh vị trí
   bottom: 0,                     // Căn chỉnh vị trí
   justifyContent: "center",      // Căn giữa theo chiều dọc
   alignItems: "center",          // Căn giữa theo chiều ngang
   backgroundColor: "rgba(255, 255, 255, 0.5)", // Nền mờ khi loading
 },
});

// Export component để sử dụng ở các file khác
export default RippleButton;