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
import Profile from "../screens/Profile";
import MealPlan from "../screens/MealPlan/MealPlan";
import ForYou from "../screens/ForYou";
import UnderDisease from "../screens/Survey/UnderDisease";
import EatHabit from "../screens/Survey/EatHabit";
import Favorite from "../screens/Survey/Favorite";
import Hate from "../screens/Survey/Hate";
import LongOfPlan from "../screens/Survey/LongOfPlan";
import MealNumber from "../screens/Survey/MealNumber";
import Diet from "../screens/Survey/Diet";
import WaterDrink from "../screens/Survey/WaterDrink";
import ActivityLevel from "../screens/Survey/ActivityLevel";
import SleepTime from "../screens/Survey/SleepTime";
import Goal from "../screens/Survey/Goal";
import Age from "../screens/Survey/Age";
import Gender from "../screens/Survey/Gender";
import WeightGoal from "../screens/Survey/WeightGoal";
import Height from "../screens/Survey/Height";
import Weight from "../screens/Survey/Weight";
import Email from "../screens/Survey/Email";
import PhoneNumber from "../screens/Survey/PhoneNumber";
import Name from "../screens/Survey/Name";
import SurveyScreen from "../screens/SurveyScreen";

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
      tabBarIcon: ({ color, focused }) => <Ionicons name="heart-outline" size={28} color={color} />,
      requireAuthen: true,
    },
  },
  {
    name: ScreensName.message,
    component: Message,
    options: {
      tabBarIcon: ({ color, focused }) => (
        <Ionicons name="chatbubble-ellipses-outline" size={28} color={color} />
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
      requireAuthen: true,
    },
  },

  {
    name: ScreensName.profile,
    component: Profile,
    options: {
      tabBarIcon: ({ color, focused }) => <AntDesignIcon name="setting" size={28} color={color} />,
      requireAuthen: true,
    },
    hiddenBottomTab: true,
  },
  // Thêm các màn hình khảo sát
  {
    name: ScreensName.survey,
    component: SurveyScreen, // Màn hình đầu tiên của khảo sát
    options: {
      tabBarButton: () => null,
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

  {
    name: "Name",
    component: Name,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "PhoneNumber",
    component: PhoneNumber,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Email",
    component: Email,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Weight",
    component: Weight,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Height",
    component: Height,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "WeightGoal",
    component: WeightGoal,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Gender",
    component: Gender,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Age",
    component: Age,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Goal",
    component: Goal,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "SleepTime",
    component: SleepTime,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "ActivityLevel",
    component: ActivityLevel,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "WaterDrink",
    component: WaterDrink,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Diet",
    component: Diet,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "MealNumber",
    component: MealNumber,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "LongOfPlan",
    component: LongOfPlan,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "EatHabit",
    component: EatHabit,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "UnderDisease",
    component: UnderDisease,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Favorite",
    component: Favorite,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: "Hate",
    component: Hate,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
  {
    name: ScreensName.forYou,
    component: ForYou,
    options: {
      tabBarButton: () => null,
    },
    hiddenBottomTab: true,
  },
];
