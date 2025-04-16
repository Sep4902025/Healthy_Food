// Import các thư viện và hooks cần thiết
import React, { useEffect, useState } from "react";
// Import các components từ React Native
import {
 View,
 TextInput,
 TouchableOpacity,
 StyleSheet,
 Dimensions,
 PixelRatio,
} from "react-native";
// Import icon từ thư viện react-native-vector-icons
import Ionicons from "react-native-vector-icons/Ionicons";
// Import function lưu lịch sử tìm kiếm từ utils
import { saveSearchHistory } from "../../utils/common";

// Lấy kích thước màn hình thiết bị
const window = Dimensions.get("window");
// Tính toán tỷ lệ dựa trên chiều rộng cơ sở 375px
const scale = window.width / 375;

// Hàm để chuẩn hóa kích thước cho các màn hình có kích thước khác nhau
const normalize = (size) => {
 // Tính kích thước mới dựa trên tỷ lệ màn hình
 const newSize = size * scale;
 // Làm tròn và áp dụng PixelRatio để chính xác hơn
 return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Component SearchBar với các props
const SearchBar = ({
 placeholder = "What do you need?",  // Placeholder mặc định
 value = "",                         // Giá trị ô tìm kiếm
 onChangeText,                       // Hàm xử lý khi text thay đổi
 onSubmit,                           // Hàm xử lý khi submit tìm kiếm
 onClear,                            // Hàm xử lý khi xóa nội dung
}) => {
 // State lưu trữ giá trị tìm kiếm hiện tại
 const [searchText, setSearchText] = useState(value);

 // Effect cập nhật searchText khi prop value thay đổi từ bên ngoài
 useEffect(() => {
   if (value !== searchText) {
     setSearchText(value);
   }
 }, [value]);

 // Xử lý khi nhấn nút xóa
 const handleClear = () => {
   // Đặt lại text thành rỗng
   setSearchText("");
   // Gọi hàm onClear nếu được truyền vào
   if (onClear) onClear();
 };

 // Xử lý khi submit tìm kiếm
 const handleSubmit = async () => {
   // Kiểm tra nếu có nội dung tìm kiếm
   if (searchText.trim() !== "") {
     // Lưu vào lịch sử tìm kiếm
     await saveSearchHistory(searchText);
     // Gọi hàm onSubmit nếu được truyền vào
     onSubmit && onSubmit();
   }
 };

 // Render component
 return (
   // Container chính của SearchBar
   <View style={styles.container}>
     {/* Input tìm kiếm */}
     <TextInput
       style={styles.input}                   // Style cho input
       placeholder={placeholder}              // Text gợi ý
       placeholderTextColor="#999"            // Màu của text gợi ý
       value={value}                          // Giá trị hiện tại
       onChangeText={onChangeText}            // Xử lý khi text thay đổi
       onSubmitEditing={handleSubmit}         // Xử lý khi nhấn Enter/Done
     />

     {/* Nút xóa - chỉ hiển thị khi có text */}
     {searchText ? (
       <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
         <Ionicons name="close-circle" size={normalize(20)} color="#aaa" />
       </TouchableOpacity>
     ) : null}

     {/* Nút tìm kiếm */}
     <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
       <Ionicons name="search" size={normalize(22)} color="#fff" />
     </TouchableOpacity>
   </View>
 );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
 container: {
   flexDirection: "row",           // Sắp xếp theo hàng ngang
   alignItems: "center",           // Căn giữa theo chiều dọc
   backgroundColor: "#f5f5f5",     // Màu nền xám nhạt
   borderRadius: normalize(25),    // Bo tròn góc
   paddingHorizontal: normalize(16), // Padding theo chiều ngang
   height: normalize(48),          // Chiều cao cố định
   marginVertical: normalize(10),  // Margin theo chiều dọc
   shadowColor: "#000",            // Màu bóng đổ
   shadowOffset: { width: 0, height: 1 }, // Vị trí bóng đổ
   shadowOpacity: 0.1,             // Độ trong suốt của bóng
   shadowRadius: 2,                // Bán kính bóng
   elevation: 2,                   // Độ nổi trên Android
 },
 input: {
   flex: 1,                        // Chiếm phần còn lại của container
   height: "100%",                 // Chiều cao bằng container
   fontSize: normalize(16),        // Kích thước chữ
   color: "#333",                  // Màu chữ
   paddingRight: normalize(40),    // Padding phải để không đè lên nút xóa
 },
 clearButton: {
   position: "absolute",           // Vị trí tuyệt đối
   right: "20%",                   // Cách phải 20%
   height: "100%",                 // Chiều cao bằng container
   justifyContent: "center",       // Căn giữa theo chiều dọc
   paddingHorizontal: normalize(10), // Padding theo chiều ngang
 },
 searchButton: {
   position: "absolute",           // Vị trí tuyệt đối
   right: 0,                       // Bên phải cùng
   height: "100%",                 // Chiều cao bằng container
   width: normalize(60),           // Chiều rộng cố định
   backgroundColor: "#40B491",     // Màu nền xanh
   borderTopRightRadius: normalize(25),    // Bo tròn góc trên phải
   borderBottomRightRadius: normalize(25), // Bo tròn góc dưới phải
   justifyContent: "center",       // Căn giữa theo chiều dọc
   alignItems: "center",           // Căn giữa theo chiều ngang
 },
});

// Export component để sử dụng ở các file khác
export default SearchBar;