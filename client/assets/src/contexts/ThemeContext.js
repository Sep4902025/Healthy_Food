// Import các thư viện và hooks cần thiết từ React
import React, { createContext, useContext, useState, useEffect } from "react";
// Import Appearance từ React Native để phát hiện chế độ màu của hệ thống
import { Appearance } from "react-native";
// Import các hằng số màu sắc cho theme sáng và tối
import { LightContants } from "../constants/LightConstants";

// Tạo context để quản lý theme trong ứng dụng
const ThemeContext = createContext();

// Component Provider cung cấp theme cho toàn bộ ứng dụng
export const ThemeProvider = ({ children }) => {
  // State để lưu trữ chế độ theme hiện tại (light hoặc dark)
  const [themeMode, setThemeMode] = useState(Appearance.getColorScheme() || "light");

  // Lấy bảng màu dựa trên chế độ theme hiện tại
  const theme = LightContants[themeMode];

  // Hàm để chuyển đổi giữa chế độ sáng và tối
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      return newMode;
    });
  };

  // Hàm để đặt chế độ theme cụ thể
  const setTheme = (mode) => {
    if (mode === "light" || mode === "dark") {
      setThemeMode(mode);
    }
  };

  // Hàm để lấy giá trị màu sắc từ theme
  const getThemeColor = (variableName, defaultValue = null) => {
    if (theme[variableName]) {
      return theme[variableName];
    }
    return defaultValue;
  };

  // Theo dõi thay đổi theme từ hệ thống và tự động cập nhật
  useEffect(() => {
    // Đăng ký listener để theo dõi thay đổi chế độ màu của hệ thống
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setThemeMode(colorScheme);
      }
    });

    // Hủy listener khi component bị hủy
    return () => subscription.remove();
  }, []);

  // Cung cấp các giá trị và hàm theme cho toàn bộ ứng dụng thông qua Provider
  return (
    <ThemeContext.Provider
      value={{
        theme, // Bảng màu hiện tại
        themeMode, // Chế độ theme (light hoặc dark)
        toggleTheme, // Hàm chuyển đổi theme
        setTheme, // Hàm đặt theme cụ thể
        getThemeColor, // Hàm lấy giá trị màu từ theme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng theme trong các component
export const useTheme = () => {
  // Lấy giá trị từ ThemeContext
  const context = useContext(ThemeContext);
  // Kiểm tra xem hook có được sử dụng trong ThemeProvider không
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hàm tiện ích để lấy màu từ theme
export const getThemedColor = (variableName, defaultValue = null) => {
  // Sử dụng hook useTheme để lấy theme hiện tại
  const { theme } = useTheme();
  // Trả về giá trị màu hoặc giá trị mặc định nếu không tìm thấy
  return theme[variableName] || defaultValue;
};