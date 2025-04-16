// Import các màn hình đăng nhập và đăng ký
import Signin from "../screens/Signin";
import Signup from "../screens/Signup";

// Import hằng số tên các màn hình từ constants
import { ScreensName } from "../constants/ScreensName";
// Import màn hình đổi mật khẩu
import ChangePassword from "../screens/ChangePassword";
// Import màn hình xác minh email
import VerifyEmail from "../screens/VerifyEmail";
// Import component icon từ Ionicons
import Ionicons from "../components/common/VectorIcons/Ionicons";
// Import màn hình chính
import Home from "../screens/Home";
// Import màn hình danh sách yêu thích
import FavorList from "../screens/FavorList";
// Import màn hình tìm kiếm
import Search from "../screens/Search";
// Import màn hình yêu thích và gợi ý
import FavorAndSuggest from "../screens/FavorAndSuggest";
// Import màn hình thông báo
import Notification from "../screens/Notification";
// Import icon từ AntDesign
import AntDesignIcon from "../components/common/VectorIcons/AntDesignIcon";
// Import màn hình danh sách
import List from "../screens/List";
// Import màn hình tin nhắn
import Message from "../screens/Message";
// Import icon từ FontAwesome
import FontAwesomeIcon from "../components/common/VectorIcons/FontAwesomeIcon";
// Import components Image và View từ React Native
import { View } from "react-native";
// Import icon từ Octicons
import OcticonsIcon from "../components/common/VectorIcons/OcticonsIcon";
// Import màn hình hồ sơ người dùng
import Profile from "../screens/Profile";
// Import màn hình kế hoạch ăn uống
import MealPlan from "../screens/MealPlan/MealPlan";
// Import màn hình đề xuất cho bạn
import ForYou from "../screens/ForYou";
// Import các màn hình khảo sát
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
// Import màn hình chính cho khảo sát
import SurveyScreen from "../screens/SurveyScreen";
// Import màn hình đặt lại mật khẩu
import ResetPassword from "../screens/ResetPassword";
// Import màn hình thanh toán cho kế hoạch ăn uống
import PaymentScreen from "../screens/MealPlan/PaymentScreen";
// Import màn hình trạng thái thanh toán
import PaymentStatusScreen from "../screens/MealPlan/PaymentStatusScreen";

// Xuất mảng chứa cấu hình của tất cả các màn hình trong ứng dụng
export const ScreensMap = [
  {
    name: ScreensName.home, // Tên màn hình chính
    component: Home, // Component tương ứng
    options: {
      tabBarButton: () => null, // Ẩn nút tab cho màn hình này
    },
  },
  {
    name: ScreensName.signup, // Tên màn hình đăng ký
    component: Signup, // Component tương ứng
    options: {
      tabBarButton: () => null, // Ẩn nút tab cho màn hình này
    },
    hiddenBottomTab: true, // Ẩn thanh tab dưới cùng khi hiển thị màn hình này
  },
  {
    name: ScreensName.signin, // Tên màn hình đăng nhập
    component: Signin, // Component tương ứng
    options: {
      tabBarButton: () => null, // Ẩn nút tab cho màn hình này
    },
    hiddenBottomTab: true, // Ẩn thanh tab dưới cùng khi hiển thị màn hình này
  },
  {
    name: ScreensName.verifyEmail, // Tên màn hình xác minh email
    component: VerifyEmail, // Component tương ứng
    options: {
      tabBarButton: () => null, // Ẩn nút tab cho màn hình này
    },
    hiddenBottomTab: true, // Ẩn thanh tab dưới cùng khi hiển thị màn hình này
  },
  {
    name: ScreensName.changePassword, // Tên màn hình đổi mật khẩu
    component: ChangePassword, // Component tương ứng
    options: {
      tabBarButton: () => null, // Ẩn nút tab cho màn hình này
    },
    hiddenBottomTab: true, // Ẩn thanh tab dưới cùng khi hiển thị màn hình này
  },
  {
    name: ScreensName.resetPassword, // Tên màn hình đặt lại mật khẩu
    component: ResetPassword, // Component tương ứng
    options: {
      tabBarButton: () => null, // Ẩn nút tab cho màn hình này
    },
    hiddenBottomTab: true, // Ẩn thanh tab dưới cùng khi hiển thị màn hình này
  },
  {
    name: ScreensName.favorList, // Tên màn hình danh sách yêu thích
    component: FavorList, // Component tương ứng
    options: {
      tabBarIcon: ({ color, focused }) => <Ionicons name="heart-outline" size={28} color={color} />, // Icon hiển thị trên tab
      requireAuthen: true, // Yêu cầu xác thực để truy cập
    },
  },
  {
    name: ScreensName.message, // Tên màn hình tin nhắn
    component: Message, // Component tương ứng
    options: {
      tabBarIcon: ({ color, focused }) => (
        <Ionicons name="chatbubble-ellipses-outline" size={28} color={color} />
      ), // Icon hiển thị trên tab
      iconStyles: { transform: [{ translateX: -25 }] }, // Điều chỉnh vị trí icon
      requireAuthen: true, // Yêu cầu xác thực để truy cập
    },
    hiddenBottomTab: true, // Ẩn thanh tab dưới cùng khi hiển thị màn hình này
  },
  {
    name: ScreensName.survey, // Tên màn hình khảo sát
    component: SurveyScreen, // Component tương ứng (màn hình đầu tiên của khảo sát)
    options: {
      tabBarIcon: ({ color, focused }) => <AntDesignIcon name="calendar" size={28} color={color} />, // Icon hiển thị trên tab
      iconStyles: { transform: [{ translateX: 25 }] }, // Điều chỉnh vị trí icon
      requireAuthen: true, // Yêu cầu xác thực để truy cập
    },
    hiddenBottomTab: true, // Ẩn thanh tab dưới cùng khi hiển thị màn hình này
  },
  {
    name: ScreensName.mealPlan, // Tên màn hình kế hoạch ăn uống
    component: MealPlan, // Component tương ứng
    options: {
      tabBarIcon: ({ color, focused }) => {
        return (
          <View>
            <FontAwesomeIcon name="heart-o" size={24} color={color} /> {/* Icon trái tim */}
            <OcticonsIcon
              name="pulse"
              size={16}
              color={color}
              style={{
                position: "absolute", // Định vị tuyệt đối
                height: 16, // Chiều cao
                width: 32, // Chiều rộng
                top: 4, // Vị trí từ trên xuống
                left: 4, // Vị trí từ trái sang
              }}
            /> {/* Icon nhịp đập được chồng lên icon trái tim */}
          </View>
        );
      },
      requireAuthen: true, // Yêu cầu xác thực để truy cập
    },
  },

  {
    name: ScreensName.profile,
    component: Profile,
    options: {
      tabBarButton: () => null,
      requireAuthen: true,
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
  },
  {
    name: "PhoneNumber",
    component: PhoneNumber,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Email",
    component: Email,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Weight",
    component: Weight,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Height",
    component: Height,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "WeightGoal",
    component: WeightGoal,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Gender",
    component: Gender,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Age",
    component: Age,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Goal",
    component: Goal,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "SleepTime",
    component: SleepTime,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "ActivityLevel",
    component: ActivityLevel,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "WaterDrink",
    component: WaterDrink,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Diet",
    component: Diet,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "MealNumber",
    component: MealNumber,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "LongOfPlan",
    component: LongOfPlan,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "EatHabit",
    component: EatHabit,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "UnderDisease",
    component: UnderDisease,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Favorite",
    component: Favorite,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: "Hate",
    component: Hate,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: ScreensName.forYou,
    component: ForYou,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: ScreensName.payment,
    component: PaymentScreen,
    options: {
      tabBarButton: () => null,
    },
  },
  {
    name: ScreensName.paymentStatus,
    component: PaymentStatusScreen,
    options: {
      tabBarButton: () => null,
    },
  },
];
