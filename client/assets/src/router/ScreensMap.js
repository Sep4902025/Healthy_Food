// PHẦN 1: IMPORTS
import Signin from "../screens/Signin";
import Signup from "../screens/Signup";
// ↑ Import các component màn hình sẽ được sử dụng trong navigation

import { ScreensName } from "../constants/ScreensName";
import ChangePassword from "../screens/ChangePassword";
import VerifyEmail from "../screens/VerifyEmail";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import Home from "../screens/Home";
import FavorList from "../screens/FavorList";
import Search from "../screens/Search";
import FavorAndSuggest from "../screens/FavorAndSuggest";
import Setting from "../screens/Setting";
import Notification from "../screens/Notification";
import FontistoIcon from "../components/common/VectorIcons/FontistoIcon";
import AntDesignIcon from "../components/common/VectorIcons/AntDesignIcon";
import List from "../screens/List";
import Message from "../screens/Message";
import FontAwesomeIcon from "../components/common/VectorIcons/FontAwesomeIcon";
import { Image, View } from "react-native";
import OcticonsIcon from "../components/common/VectorIcons/OcticonsIcon";
import HeartBeat from "../screens/HeartBeat";
import Profile from "../screens/Profile";
import MealPlan from "../screens/MealPlan/MealPlan";
// ↑ Import enum chứa tên các màn hình
// Giúp tránh lỗi typo và dễ dàng quản lý tên màn hình

// PHẦN 2: KHAI BÁO CẤU HÌNH SCREENS
export const ScreensMap = [
  // {
  //   name: ScreensName.welcome,
  //   component: Welcome,
  //   options: {
  //     tabBarButton: () => null,
  //   },
  //   hiddenBottomTab: true,
  // },
  {
    name: ScreensName.home,
    component: Home,
    options: {
      tabBarButton: () => null,
    },
    // hiddenBottomTab: true,
  },
  {
    // Cấu hình cho màn hình Signup
    name: ScreensName.signup,
    // ↑ Tên màn hình lấy từ enum, ví dụ: "SIGNUP"

    component: Signup,
    // ↑ Component sẽ được render khi navigate tới màn hình này

    options: {
      tabBarButton: () => null,
      // ↑ Return null để ẩn nút tab của màn hình này trong tabbar
    },

    hiddenBottomTab: true,
    // ↑ Flag để ẩn hoàn toàn tabbar khi ở màn hình này
  },

  {
    // Cấu hình cho màn hình Signin
    name: ScreensName.signin,
    component: Signin,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,

    // Code mẫu về cách cấu hình icon cho tab (đã comment)
    // options: {
    //   tabBarIcon: ({ color, focused }) => (
    //     <Ionicons
    //       name="home-outline"    // Tên icon
    //       size={32}             // Kích thước icon
    //       color={color}         // Màu sắc (active/inactive)
    //     />
    //   ),
    // },
  },
  {
    name: ScreensName.verifyEmail,
    component: VerifyEmail,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: ScreensName.changePassword,
    component: ChangePassword,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  // {
  //   name: ScreensName.home,
  //   component: Home,
  //   options: {
  //     tabBarButton: () => null,
  //   },
  //   hiddenBottomTab: true,
  // },
  {
    name: ScreensName.favorList,
    component: FavorList,
    options: {
      tabBarIcon: ({ color, focused }) => (
        <Ionicons
          name="heart-outline" // Tên icon
          size={28} // Kích thước icon
          color={color} // Màu sắc (active/inactive)
        />
      ),
      requireAuthen: true,
    },
  },
  {
    name: ScreensName.message,
    component: Message,
    options: {
      tabBarIcon: ({ color, focused }) => (
        <Ionicons
          name="chatbubble-ellipses-outline" // Tên icon
          size={28} // Kích thước icon
          color={color} // Màu sắc (active/inactive)
        />
      ),
      iconStyles: { transform: [{ translateX: -25 }] },
      requireAuthen: true,
    },
    hiddenBottomTab: true,
  },
  {
    name: ScreensName.mealPlan,
    component: MealPlan,
    options: {
      tabBarIcon: ({ color, focused }) => {
        return (
          <View>
            <FontAwesomeIcon name="heart-o" size={24} color={color} />
            <OcticonsIcon
              name="pulse"
              size={16}
              color={color}
              style={{
                position: "absolute",
                height: 16,
                width: 32,
                top: 4,
                left: 4,
              }}
            />
          </View>
        );
      },
      iconStyles: { transform: [{ translateX: 25 }] },
    },
  },

  {
    name: ScreensName.profile,
    component: Profile,
    options: {
      tabBarIcon: ({ color, focused }) => (
        <AntDesignIcon
          name="setting" // Tên icon
          size={28} // Kích thước icon
          color={color} // Màu sắc (active/inactive)
        />
      ),
      requireAuthen: true,
    },
    hiddenBottomTab: true,
  },
  {
    name: ScreensName.setting,
    component: Setting,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: ScreensName.list,
    component: List,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: ScreensName.favorAndSuggest,
    component: FavorAndSuggest,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: ScreensName.search,
    component: Search,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: ScreensName.notification,
    component: Notification,
    options: {
      tabBarButton: () => null,
    },
  },
];
