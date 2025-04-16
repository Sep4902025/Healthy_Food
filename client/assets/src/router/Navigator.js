// Import các thư viện và component cần thiết cho điều hướng
import React, { useEffect } from "react";
// Import các thành phần từ thư viện react-navigation để tạo stack điều hướng
import { createStackNavigator } from "@react-navigation/stack";
// Import để tạo thanh điều hướng dưới cùng
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// Import các thành phần chính từ react-navigation và các theme mặc định
import {
 NavigationContainer,
 DefaultTheme,
 DarkTheme,
} from "@react-navigation/native";
// Import StatusBar để tùy chỉnh thanh trạng thái
import { StatusBar } from "react-native";

// Import danh sách các màn hình trong ứng dụng
import { ScreensMap } from "./ScreensMap";
// Import thanh tab tùy chỉnh
import CustomTabBar from "../components/common/CustomTabBar";
// Import hook sử dụng theme
import { useTheme } from "../contexts/ThemeContext";
// Import layout drawer tùy chỉnh
import CustomDrawerLayout from "../components/layout/CustomDrawerLayout";
// Import tham chiếu điều hướng để có thể điều hướng bên ngoài component
import { navigationRef } from "../utils/NavigationService";


// Khởi tạo Stack Navigator để điều hướng giữa các màn hình
const Stack = createStackNavigator();
// Khởi tạo Tab Navigator cho thanh điều hướng dưới cùng
const Tab = createBottomTabNavigator();


// Component Stack điều hướng chính chứa tất cả các màn hình
function HomeStack() {
 // Lấy theme hiện tại từ context
 const { theme } = useTheme();

 return (
   <Stack.Navigator
     screenOptions={{
       headerShown: false, // Ẩn header mặc định
       gestureEnabled: true, // Cho phép vuốt để điều hướng
       gestureDirection: "horizontal", // Hướng vuốt từ trái sang phải
     }}
   >
     {/* Lặp qua danh sách các màn hình và tạo các Stack.Screen */}
     {ScreensMap.map((item, index) => (
       <Stack.Screen key={index} name={item.name} component={item.component} />
     ))}
   </Stack.Navigator>
 );
}

// Component Tab Navigator để hiển thị thanh điều hướng dưới cùng
const TabNavigator = () => {
 // Lấy theme hiện tại từ context
 const { theme } = useTheme();

 return (
   <Tab.Navigator
     // Sử dụng CustomTabBar thay vì TabBar mặc định
     tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
     screenOptions={({ route }) => ({
       tabBarShowLabel: false, // Ẩn nhãn của tab
       headerShown: false, // Ẩn header
       animation: "shift", // Hiệu ứng chuyển động
       gestureEnabled: true, // Cho phép vuốt để điều hướng
       gestureDirection: "horizontal", // Hướng vuốt từ trái sang phải

       // Tùy chỉnh style cho thanh tab
       tabBarStyle: {
         backgroundColor: theme.tabBarBackgroundColor, // Màu nền thanh tab
         borderTopColor: theme.border, // Màu viền trên của thanh tab
       },
     })}
     backBehavior="history" // Hành vi khi nhấn nút back
   >
     {/* Chỉ có một tab chính chứa toàn bộ HomeStack */}
     <Tab.Screen name={"Main"} component={HomeStack} />
   </Tab.Navigator>
 );
};


// Component Navigator chính của ứng dụng
const Navigator = () => {
 // Lấy theme và chế độ theme (sáng/tối) từ context
 const { theme, themeMode } = useTheme();


 // Tạo theme cho NavigationContainer dựa trên chế độ theme hiện tại
 const navigationTheme = {
   ...(themeMode === "dark" ? DarkTheme : DefaultTheme), // Chọn theme mặc định dựa vào chế độ
   colors: {
     ...(themeMode === "dark" ? DarkTheme : DefaultTheme).colors, // Kế thừa màu từ theme mặc định
     card: theme.cardBackground, // Màu nền của card
     text: theme.textColor, // Màu chữ
     border: theme.border, // Màu viền
     primary: theme.primary, // Màu chính
     notification: theme.accent, // Màu thông báo
   },
 };

 return (
   <>
     {/* Cấu hình thanh trạng thái */}
     <StatusBar
       barStyle={themeMode === "dark" ? "light-content" : "dark-content"} // Màu chữ trên thanh trạng thái
       backgroundColor="transparent" // Màu nền trong suốt
       translucent // Cho phép thanh trạng thái trong suốt
     />
     {/* Container điều hướng chính với theme đã cấu hình */}
     <NavigationContainer theme={navigationTheme} ref={navigationRef}>
       {/* Bọc TabNavigator trong CustomDrawerLayout để có menu drawer */}
       <CustomDrawerLayout theme={theme}>
         {/* Hiển thị TabNavigator */}
         {TabNavigator()}
       </CustomDrawerLayout>
     </NavigationContainer>
   </>
 );
};

// Export component Navigator để sử dụng trong ứng dụng
export default Navigator;