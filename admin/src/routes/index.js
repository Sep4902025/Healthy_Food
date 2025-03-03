import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import PrivateRoute from "../components/PrivateRoute";
import Home from "../pages/user/Home";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import User from "../pages/user/User";
import Dishes from "../pages/user/Dishes";
import MealsPlan from "../pages/user/MealsPlan";
import Ingredient from "../pages/user/Ingredient";
import ForgetPassword from "../pages/auth/ForgetPassword";
import AdminLayout from "../components/layouts/AdminLayout";
import TableUser from "../pages/admin/TableUser";
import TableOrder from "../pages/admin/TableOrder";
import NutritionistLayout from "../components/layouts/NutritionistLayout";
import NutritionChat from "../pages/nutritionist/NutritionChat";
import TableIngredient from "../pages/nutritionist/TableIngredient";
import TableMealPlan from "../pages/nutritionist/TableMealPlan";
import TableDishes from "../pages/nutritionist/TableDishes";
import ChatWindow from "../components/Chat/ChatWindow";
import ProtectedRoute from "../components/ProtectedRoute";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import QuizLayout from "../components/layouts/QuizLayout";
import Favorite from "../pages/quizinfor/Favorite";
import Age from "../pages/quizinfor/Age";
import Diet from "../pages/quizinfor/Diet";
import EatHabit from "../pages/quizinfor/EatHabit";
import Email from "../pages/quizinfor/Email";
import Gender from "../pages/quizinfor/Gender";
import Goal from "../pages/quizinfor/Goal";
import Hate from "../pages/quizinfor/Hate";
import Height from "../pages/quizinfor/Height";
import LongOfPlan from "../pages/quizinfor/LongOfPlan";
import MealNumber from "../pages/quizinfor/MealNumber";
import Name from "../pages/quizinfor/Name";
import PhoneNumber from "../pages/quizinfor/PhoneNumber";
import SleepTime from "../pages/quizinfor/SleepTime";
import UnderDisease from "../pages/quizinfor/UnderDisease";
import WaterDrink from "../pages/quizinfor/WaterDrink";
import Weight from "../pages/quizinfor/Weight";
import WeightGoal from "../pages/quizinfor/WeightGoal";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="signin" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="verify" element={<VerifyOtp />} />
        <Route path="forget-password" element={<ForgetPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Các route cần đăng nhập */}
        <Route
          path="user"
          element={
            <PrivateRoute>
              <User />
            </PrivateRoute>
          }
        />

        <Route
          path="dishes"
          element={
            <PrivateRoute>
              <Dishes />
            </PrivateRoute>
          }
        />
        <Route
          path="meal"
          element={
            <PrivateRoute>
              <MealsPlan />
            </PrivateRoute>
          }
        />
        <Route
          path="ingredient"
          element={
            <PrivateRoute>
              <Ingredient />
            </PrivateRoute>
          }
        />

        {/* ✅ Bảo vệ trang chat, chỉ user mới vào được */}
        <Route
          path="chat"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ChatWindow />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ✅ Bảo vệ toàn bộ route admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="user" element={<TableUser />} />
        <Route path="order" element={<TableOrder />} />
      </Route>

      {/* ✅ quizinfor */}
      <Route path="/quizinfor" element={<QuizLayout />}>
        <Route path="age" element={<Age />} />
        <Route path="diet" element={<Diet />} />
        <Route path="eathabit" element={<EatHabit />} />
        <Route path="email" element={<Email />} />
        <Route path="favorite" element={<Favorite />} />
        <Route path="gender" element={<Gender />} />
        <Route path="goal" element={<Goal />} />
        <Route path="hate" element={<Hate />} />
        <Route path="height" element={<Height />} />
        <Route path="longofplan" element={<LongOfPlan />} />
        <Route path="mealnumber" element={<MealNumber />} />
        <Route path="name" element={<Name />} />
        <Route path="phonenumber" element={<PhoneNumber />} />
        <Route path="sleeptime" element={<SleepTime />} />
        <Route path="underdisease" element={<UnderDisease />} />
        <Route path="waterdrink" element={<WaterDrink />} />
        <Route path="weight" element={<Weight />} />
        <Route path="weightgoal" element={<WeightGoal />} />
      </Route>

      {/* ✅ Bảo vệ toàn bộ route nutritionist */}
      <Route
        path="/nutritionist"
        element={
          <ProtectedRoute allowedRoles={["nutritionist"]}>
            <NutritionistLayout />
          </ProtectedRoute>
        }
      >
        <Route path="chat" element={<NutritionChat />} />
        <Route path="ingredient" element={<TableIngredient />} />
        <Route path="mealplan" element={<TableMealPlan />} />
        <Route path="dishes" element={<TableDishes />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
