// Import React từ thư viện React
import React from "react";
// Import các component cần thiết từ React Native
import { Dimensions, KeyboardAvoidingView, Platform, Text } from "react-native";
// Import component SafeAreaWrapper đã được tạo trước đó
import SafeAreaWrapper from "./SafeAreaWrapper";
// Import component Header được tạo trước đó
import Header from "./Header";
// Import LinearGradient từ thư viện expo-linear-gradient để tạo nền gradient
import { LinearGradient } from "expo-linear-gradient";
// Import component DecorationDot đã được tạo trước đó để thêm các chấm trang trí
import DecorationDot from "../common/DecorationDot";
// Import hook useTheme từ context để sử dụng theme
import { useTheme } from "../../contexts/ThemeContext";

// Lấy chiều rộng của màn hình thiết bị
const WIDTH = Dimensions.get("window").width;
// Lấy chiều cao của màn hình thiết bị
const HEIGHT = Dimensions.get("window").height;

// Định nghĩa component NonBottomTabWrapper với các props
function NonBottomTabWrapper({ children, headerHidden, style }) {
 // Lấy theme từ context thông qua hook useTheme
 const { theme } = useTheme();

 return (
   // Sử dụng SafeAreaWrapper làm container chính
   <SafeAreaWrapper>
     {/* Kiểm tra nếu headerHidden là false, hiển thị component Header */}
     {!headerHidden && <Header />}

     {/* Tạo nền gradient cho toàn bộ màn hình */}
     <LinearGradient
       colors={theme.backgroundColor} // Màu của gradient lấy từ theme
       start={{ x: 0, y: 0 }} // Điểm bắt đầu của gradient (trên cùng)
       end={{ x: 0, y: 1 }} // Điểm kết thúc của gradient (dưới cùng)
       style={{ flex: 1, minHeight: HEIGHT }} // Style để gradient chiếm toàn bộ không gian
     >
       {/* Component tự động điều chỉnh view khi bàn phím hiện lên */}
       <KeyboardAvoidingView
         behavior={Platform.OS === "ios" ? "padding" : "height"} // Hành vi khác nhau giữa iOS và Android
         style={{ ...style }} // Truyền style từ props
       >
         {/* Hiển thị nội dung con được truyền vào */}
         {children}
       </KeyboardAvoidingView>
     </LinearGradient>

     {/* Fragment để chứa các chấm trang trí */}
     <>
       {/* Chấm trang trí màu xanh ở góc trên bên trái */}
       <DecorationDot
         size={HEIGHT * 0.25} // Kích thước bằng 25% chiều cao màn hình
         top={-(HEIGHT * 0.1)} // Vị trí trên, âm để một phần nằm ngoài màn hình
         left={-(WIDTH * 0.4)} // Vị trí trái, âm để một phần nằm ngoài màn hình
         zIndex={1} // Chỉ số lớp để kiểm soát sự chồng lấp
         backgroundColor={theme.greenDecorationDotColor} // Màu nền từ theme
       />
       {/* Chấm trang trí màu đen ở góc trên bên trái, nhỏ hơn và gần hơn */}
       <DecorationDot
         size={HEIGHT * 0.25} // Kích thước bằng 25% chiều cao màn hình
         top={-(HEIGHT * 0.2)} // Vị trí trên, âm nhiều hơn
         left={-(WIDTH * 0.2)} // Vị trí trái, âm ít hơn chấm trước
         opacity={0.4} // Độ trong suốt 40%
         zIndex={1} // Chỉ số lớp để kiểm soát sự chồng lấp
         backgroundColor={theme.blackDecorationDotColor} // Màu nền từ theme
       />

       {/* Chấm trang trí màu xanh ở góc dưới bên phải */}
       <DecorationDot
         size={HEIGHT * 0.25} // Kích thước bằng 25% chiều cao màn hình
         top={HEIGHT - HEIGHT * 0.15} // Vị trí từ trên xuống, gần cuối màn hình
         left={WIDTH - WIDTH * 0.4} // Vị trí từ trái qua, gần cạnh phải
         zIndex={-2} // Chỉ số lớp âm để hiển thị phía sau nội dung
         backgroundColor={theme.greenDecorationDotColor} // Màu nền từ theme
       />
       {/* Chấm trang trí màu đen ở góc dưới bên phải */}
       <DecorationDot
         size={HEIGHT * 0.25} // Kích thước bằng 25% chiều cao màn hình
         top={HEIGHT - HEIGHT * 0.3} // Vị trí từ trên xuống
         left={WIDTH - WIDTH * 0.6} // Vị trí từ trái qua
         opacity={0.4} // Độ trong suốt 40%
         zIndex={-1} // Chỉ số lớp âm để hiển thị phía sau nội dung
         transform={[{ translateX: 200 }, { translateY: 50 }]} // Di chuyển chấm theo trục X và Y
         backgroundColor={theme.blackDecorationDotColor} // Màu nền từ theme
       />
     </>
   </SafeAreaWrapper>
 );
}

// Export component để sử dụng ở nơi khác
export default NonBottomTabWrapper;