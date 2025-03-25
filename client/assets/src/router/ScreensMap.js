
import Signin from "../screens/Signin";
import Signup from "../screens/Signup";


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

export const ScreensMap = [
 
  {
    name: ScreensName.home,
    component: Home,
    options: {
      tabBarButton: () => null,
    },
    
  },
  {
    
    name: ScreensName.signup,
    

    component: Signup,
   

    options: {
      tabBarButton: () => null,
      
    },

    hiddenBottomTab: true,
    
  },

  {
    
    name: ScreensName.signin,
    component: Signin,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,

    
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
  
  {
    name: ScreensName.favorList,
    component: FavorList,
    options: {
      tabBarIcon: ({ color, focused }) => (
        <Ionicons
          name="heart-outline" 
          size={28} 
          color={color} 
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
          name="chatbubble-ellipses-outline" 
          size={28} 
          color={color} 
        />
      ),
      iconStyles: { transform: [{ translateX: -25 }] },
      requireAuthen: true,
    },
    hiddenBottomTab: true,
  },
  {
    name: ScreensName.heartBeat,
    component: HeartBeat,
    options: {
      tabBarIcon: ({ color, focused }) => {
        return (
          <View>
            <FontAwesomeIcon
              name="heart-o" 
              size={24} 
              color={color} 
            />
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
          name="setting" 
          size={28} 
          color={color}
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
