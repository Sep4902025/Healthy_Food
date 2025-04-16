// Import các thư viện và components cần thiết
import React, { useEffect, useState } from "react"; // Import React và các hooks
import { Dimensions, Text } from "react-native"; // Import components từ React Native
import SafeAreaWrapper from "./SafeAreaWrapper"; // Import component an toàn vùng notch
import Header from "./Header"; // Import component header
import { LinearGradient } from "expo-linear-gradient"; // Import gradient để làm nền
import DecorationDot from "../common/DecorationDot"; // Import component chấm trang trí
import { useTheme } from "../../contexts/ThemeContext"; // Import hook lấy theme từ context

// Lấy kích thước màn hình
const WIDTH = Dimensions.get("window").width; // Lấy chiều rộng màn hình
const HEIGHT = Dimensions.get("window").height; // Lấy chiều cao màn hình

// Component wrapper chính cho layout
function MainLayoutWrapper({ children, headerHidden }) {
 // Lấy theme từ context thông qua hook
 const { theme } = useTheme();

 return (
   // Sử dụng SafeAreaWrapper với headerStyle trong suốt
   <SafeAreaWrapper headerStyle={{ backgroundColor: "transparent" }}>
     {/* Hiển thị component Header */}
     <Header />
     
     {/* Tạo nền gradient cho toàn màn hình */}
     <LinearGradient
       colors={theme.backgroundColor} // Sử dụng màu từ theme
       start={{ x: 0, y: 0 }} // Điểm bắt đầu gradient ở góc trên cùng
       end={{ x: 0, y: 1 }} // Điểm kết thúc gradient ở dưới cùng
       style={{ flex: 1 }} // Chiếm toàn bộ không gian còn lại
     >
       {/* Hiển thị nội dung con được truyền vào */}
       {children}
     </LinearGradient>
     
     {/* Dòng comment này có vẻ là code cũ đã bị comment lại */}
     {/* {children} */}
     
     {/* Chấm trang trí màu xanh ở góc trên bên trái */}
     <DecorationDot
       size={HEIGHT * 0.25} // Kích thước là 25% chiều cao màn hình
       top={-(HEIGHT * 0.2)} // Vị trí top, âm để đẩy ra khỏi màn hình một phần
       left={-(WIDTH * 0.4)} // Vị trí left, âm để đẩy ra khỏi màn hình một phần
       zIndex={1} // Độ ưu tiên hiển thị
       backgroundColor={theme.greenDecorationDotColor} // Màu sắc từ theme
     />
     
     {/* Chấm trang trí màu đen ở góc trên bên trái, gần hơn */}
     <DecorationDot
       size={HEIGHT * 0.25} // Kích thước là 25% chiều cao màn hình
       top={-(HEIGHT * 0.25)} // Vị trí top, âm nhiều hơn
       left={-(WIDTH * 0.2)} // Vị trí left, âm ít hơn để gần cạnh trái hơn
       opacity={0.4} // Độ trong suốt 40%
       zIndex={1} // Độ ưu tiên hiển thị
       backgroundColor={theme.blackDecorationDotColor} // Màu sắc từ theme
     />
   </SafeAreaWrapper>
 );
}

// Export component để sử dụng ở nơi khác
export default MainLayoutWrapper;