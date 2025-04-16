// Import thư viện React
import React from "react";
// Import các component từ React Native
import { View, TouchableOpacity, StyleSheet } from "react-native";
// Import component Ionicons từ thư viện Expo
import { Ionicons } from "@expo/vector-icons";

// Định nghĩa component Rating với các props, cung cấp giá trị mặc định
const Rating = ({
 rate = 0,                    // Điểm đánh giá hiện tại
 starClick,                   // Hàm callback khi nhấn vào sao
 maxStars = 5,                // Số sao tối đa
 size = 30,                   // Kích thước sao
 activeColor = "#FFD700",     // Màu sao được chọn (màu vàng)
 inactiveColor = "#CCCCCC",   // Màu sao chưa được chọn (màu xám)
 disabled = false,            // Trạng thái vô hiệu hóa
}) => {

 // Đảm bảo giá trị rate nằm trong phạm vi hợp lệ (từ 0 đến maxStars)
 const currentRate = Math.min(Math.max(0, rate), maxStars);

 // Hàm xử lý khi người dùng nhấn vào sao
 const handleStarPress = (selectedRate) => {
   // Chỉ xử lý khi không bị vô hiệu hóa và có hàm callback
   if (!disabled && starClick) {
     starClick(selectedRate);
   }
 };

 // Hàm render các ngôi sao
 const renderStars = () => {
   const stars = [];

   // Tạo danh sách các ngôi sao dựa trên maxStars
   for (let i = 1; i <= maxStars; i++) {
     // Kiểm tra xem sao có được kích hoạt hay không
     const active = i <= currentRate;

     // Thêm sao vào mảng
     stars.push(
       <TouchableOpacity
         key={i}                              // Key duy nhất cho mỗi sao
         onPress={() => handleStarPress(i)}   // Xử lý khi nhấn vào sao
         disabled={disabled}                  // Vô hiệu hóa nếu cần
         style={styles.starContainer}         // Style cho container của sao
       >
         <Ionicons
           name={active ? "star" : "star-outline"}  // Sử dụng sao đặc hoặc viền tùy trạng thái
           size={size}                              // Kích thước icon
           color={active ? activeColor : inactiveColor}  // Màu sắc tùy trạng thái
         />
       </TouchableOpacity>
     );
   }

   return stars;
 };

 // Render component Rating
 return <View style={styles.container}>{renderStars()}</View>;
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
 container: {
   flex: 1,                // Mở rộng để chiếm không gian có sẵn
   flexDirection: "row",   // Hiển thị các sao theo chiều ngang
   alignItems: "center",   // Căn giữa theo chiều dọc
 },
 starContainer: {
   justifyContent: "center",  // Căn giữa nội dung theo chiều dọc
   alignItems: "center",      // Căn giữa nội dung theo chiều ngang
   padding: 2,                // Thêm padding để dễ nhấn
 },
});

// Export component để sử dụng ở các file khác
export default Rating;