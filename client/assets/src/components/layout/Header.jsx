import React, { useEffect } from "react"; // Thêm useEffect
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { ScreensName } from "../../constants/ScreensName";
import { useTheme } from "../../contexts/ThemeContext";
import MaterialIcons from "../common/VectorIcons/MaterialIcons";
import { toggleVisible } from "../../redux/reducers/drawerReducer";
import ReminderNotification from "../../screens/MealPlan/ReminderNotification";
import RemindService from "../../services/reminderService";

function Header() {
  const navigation = useNavigation();
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Giả sử token được lưu trong user.token
  const token = user?.accessToken; // Lấy token từ Redux store

  // Kết nối socket khi user và token có sẵn
  useEffect(() => {
    if (user?._id && token) {
      RemindService.connectSocket(user._id);
    }

    // Ngắt kết nối socket khi component unmount
    return () => {
      RemindService.disconnect();
    };
  }, [user, token]); // Chạy lại khi user hoặc token thay đổi

  const checkAuth = () => {
    if (user) {
      navigation.navigate(ScreensName.profile);
    } else {
      navigation.navigate(ScreensName.signin);
    }
  };

  const onDrawerPress = () => {
    dispatch(toggleVisible());
  };

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: theme.headerBackgroundColor,
      }}
    >
      {/* Nút Drawer */}
      <TouchableOpacity style={styles.backIcon} onPress={onDrawerPress}>
        <Ionicons name="reorder-three" size={32} color={theme.backButtonColor} />
      </TouchableOpacity>

      {/* Tích hợp ReminderNotification */}
      {user ? (
        <ReminderNotification userId={user?._id} /> // Truyền userId từ user
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate(ScreensName.signin)}>
          <Text style={{ fontSize: 32, color: theme.backButtonColor }}>🔔</Text>
        </TouchableOpacity>
      )}

      {/* Avatar hoặc icon profile */}
      <TouchableOpacity onPress={checkAuth}>
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            resizeMode="cover"
            style={[styles.profileImage, styles.avtImage]}
          />
        ) : (
          <MaterialIcons name="account-circle" size={40} color={theme.backButtonColor} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 20,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: "#fff",
  },
  backIcon: {
    position: "absolute",
    left: "5%",
    zIndex: 999,
  },
  profileImage: {
    height: 40,
    width: 40,
  },
  avtImage: {
    borderRadius: 100,
  },
});

export default Header;
