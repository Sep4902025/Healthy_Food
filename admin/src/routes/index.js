import { Routes, Route } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
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
import SendOtp from "../pages/auth/SendOtp";
import AdminLayout from "../components/layouts/AdminLayout";
import TableUser from "../pages/admin/TableUser";
import TableOrder from "../pages/admin/TableOrder";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
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
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="forget-password" element={<ForgetPassword />} />
        <Route path="send-otp" element={<SendOtp />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="user" element={<TableUser />} />
        <Route path="order" element={<TableOrder />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
