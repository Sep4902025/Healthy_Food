import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  GestureHandlerRootView,
  DrawerLayout,
} from "react-native-gesture-handler";
import FontistoIcon from "../common/VectorIcons/FontistoIcon";
import Ionicons from "../common/VectorIcons/Ionicons";
import MaterialIcons from "../common/VectorIcons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { drawerSelector, userSelector } from "../../redux/selectors/selector";
import { ScreensName } from "../../constants/ScreensName";
import { useNavigation } from "@react-navigation/native";
import {
  toggleVisible,
  updateVisible,
} from "../../redux/reducers/drawerReducer";

const { width } = Dimensions.get("window");

const CustomDrawerLayout = forwardRef(
  ({ children, drawerWidth = width * 0.7, theme }, ref) => {
    const navigation = useNavigation();
    const drawerVisible = useSelector(drawerSelector);
    const drawerRef = useRef(null);
    const user = useSelector(userSelector);
    const dispatch = useDispatch();

    useEffect(() => {
      if (drawerVisible.visible) {
        drawerRef.current.openDrawer();
      } else {
        drawerRef.current.closeDrawer();
      }
    }, [drawerVisible]);

    const closeDrawer = () => {
      dispatch(toggleVisible());
    };

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

    const renderDrawerContent = () => {
      const drawerItems = [
        {
          title: "Home",
          icon: (
            <Ionicons name="home" size={24} color={theme.backButtonColor} />
          ),
          onPress: () => {
            navigation.navigate(ScreensName.home);
            closeDrawer();
          },
        },
        {
          title: "Profile",
          icon: (
            <MaterialIcons
              name="account-circle"
              size={24}
              color={theme.backButtonColor}
            />
          ),
          onPress: () => {
            checkAuth();
            closeDrawer();
          },
        },
        {
          title: "Notifications",
          icon: (
            <FontistoIcon name="bell" size={24} color={theme.backButtonColor} />
          ),
          onPress: () => {
            notificationNav();
            closeDrawer();
          },
        },
        // Add more drawer items as needed
      ];

      return (
        <View
          style={[
            styles.drawerContent,
            { backgroundColor: theme.headerBackgroundColor },
          ]}
        >
          <View style={styles.drawerHeader}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                resizeMode="cover"
                style={[styles.profileImage, styles.avtImage]}
              />
            ) : (
              <MaterialIcons
                name="account-circle"
                size={60}
                color={theme.backButtonColor}
              />
            )}
            <Text
              style={[
                styles.drawerHeaderText,
                { color: theme.backButtonColor },
              ]}
            >
              {user?.name || "Guest"}
            </Text>
          </View>

          {drawerItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.drawerItem}
              onPress={item.onPress}
            >
              {item.icon}
              <Text
                style={[
                  styles.drawerItemText,
                  { color: theme.backButtonColor },
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    };

    // Expose drawer methods to parent component
    useImperativeHandle(ref, () => ({
      openDrawer: () => drawerRef.current?.openDrawer(),
      closeDrawer: () => drawerRef.current?.closeDrawer(),
    }));

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={drawerWidth}
          drawerPosition={DrawerLayout.positions.Left}
          drawerType="front"
          renderNavigationView={renderDrawerContent}
          onDrawerClose={() => {
            dispatch(updateVisible({ visible: false }));
          }}
        >
          {children}
        </DrawerLayout>
      </GestureHandlerRootView>
    );
  }
);

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerHeaderText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "bold",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default CustomDrawerLayout;
