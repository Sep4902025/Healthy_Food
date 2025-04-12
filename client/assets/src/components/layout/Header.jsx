import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { ScreensName } from "../../constants/ScreensName";
import { useTheme } from "../../contexts/ThemeContext";
import MaterialIcons from "../common/VectorIcons/MaterialIcons";
import { toggleVisible } from "../../redux/reducers/drawerReducer";
import ReminderNotification from "../../screens/MealPlan/ReminderNotification";
import RemindService from "../../services/reminderService";

import Cart from "../../screens/MealPlan/Cart";
import mealPlanService from "../../services/mealPlanService";

function Header() {
  const navigation = useNavigation();
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [cartVisible, setCartVisible] = useState(false);
  const [mealPlanCount, setMealPlanCount] = useState(0);

  const token = user?.accessToken;

  useEffect(() => {
    if (user?._id && token) {
      RemindService.connectSocket(user._id);
      // Fetch unpaid meal plans for badge count
      const fetchUnpaidMealPlans = async () => {
        try {
          const response = await mealPlanService.getUnpaidMealPlanForUser(user._id);
          if (response.success) {
            setMealPlanCount(response.data.length);
          } else {
            setMealPlanCount(0);
          }
        } catch (error) {
          setMealPlanCount(0);
        }
      };
      fetchUnpaidMealPlans();
    }

    return () => {
      RemindService.disconnect();
    };
  }, [user, token]);

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

  const toggleCart = () => {
    if (user) {
      setCartVisible(!cartVisible);
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
      <TouchableOpacity style={styles.backIcon} onPress={onDrawerPress}>
        <Ionicons name="reorder-three" size={32} color={theme.backButtonColor} />
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        {user ? (
          <ReminderNotification userId={user?._id} />
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate(ScreensName.signin)}>
            <Text style={{ fontSize: 32, color: theme.backButtonColor }}>🔔</Text>
          </TouchableOpacity>
        )}

        {/* Cart Icon */}
        <TouchableOpacity onPress={toggleCart} style={styles.cartContainer}>
          <Ionicons name="cart-outline" size={32} color={theme.backButtonColor} />
          {mealPlanCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{mealPlanCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Icon */}
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

      {/* Cart Modal */}
      <Cart
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        mealPlanCount={mealPlanCount}
      />
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
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileImage: {
    height: 40,
    width: 40,
  },
  avtImage: {
    borderRadius: 100,
  },
  cartContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Header;
