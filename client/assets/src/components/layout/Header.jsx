import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { ScreensName } from "../../constants/ScreensName";
import { useTheme } from "../../contexts/ThemeContext";
import FontistoIcon from "../common/VectorIcons/FontistoIcon";
import MaterialIcons from "../common/VectorIcons/MaterialIcons";
import { toggleVisible } from "../../redux/reducers/drawerReducer";

function Header() {
  const navigation = useNavigation();
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const { theme } = useTheme();
  // console.log(navigation.canGoBack());

  const checkAuth = () => {
    if (user) {
      navigation.navigate(ScreensName.profile);
    } else {
      navigation.navigate(ScreensName.signin);
    }
  };

  const notificationNav = () => {
    if (user) {
      navigation.navigate(ScreensName.notification);
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
      <TouchableOpacity style={styles.backIcon} onPress={onDrawerPress}>
        <Ionicons
          name="reorder-three" // Tên icon
          size={32} // Kích thước icon
          color={theme.backButtonColor} // Màu sắc (active/inactive)
        />
      </TouchableOpacity>
      {/* {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back" // Tên icon
            size={32} // Kích thước icon
            color={theme.backButtonColor} // Màu sắc (active/inactive)
          />
        </TouchableOpacity>
      )} */}

      <TouchableOpacity onPress={notificationNav}>
        <FontistoIcon
          name="bell" // Tên icon
          size={32} // Kích thước icon
          color={theme.backButtonColor} // Màu sắc (active/inactive)
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={checkAuth}>
        {user?.avatar_url ? (
          <Image
            source={{ uri: user.avatar_url }}
            resizeMode="cover"
            style={[styles.profileImage, styles.avtImage]}
          />
        ) : (
          <MaterialIcons
            name="account-circle" // Tên icon
            size={40} // Kích thước icon
            color={theme.backButtonColor} // Màu sắc (active/inactive)
          />
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
    // borderRadius: 100,
  },
  avtImage: {
    borderRadius: 100,
  },
});

export default Header;
