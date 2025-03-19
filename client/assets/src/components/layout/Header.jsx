import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { ScreensName } from "../../constants/ScreensName";
import { useTheme } from "../../contexts/ThemeContext";

function Header() {
  const navigation = useNavigation();
  const user = useSelector(userSelector);
  const { theme } = useTheme();
  // console.log(navigation.canGoBack());

  const checkAuth = () => {
    if (user) {
      navigation.navigate(ScreensName.profile);
    } else {
      navigation.navigate(ScreensName.signin);
    }
  };

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: theme.headerBackgroundColor,
      }}
    >
      {navigation.canGoBack() && (
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
      )}

      <TouchableOpacity onPress={checkAuth}>
        <Image
          source={
            user?.avatar_url
              ? { uri: user.avatar_url }
              : require("../../../assets/image/Profile.png")
          }
          resizeMode="cover"
          style={[
            styles.profileImage,
            user?.avatar_url ? styles.avtImage : null,
          ]}
        />
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
