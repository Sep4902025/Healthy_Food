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
import TableIngredient from "../pages/nutritionist/Ingredient Management/TableIngredient";
import TableMealPlan from "../pages/nutritionist/TableMealPlan";
import TableDishes from "../pages/nutritionist/Dishes Management/TableDishes";
import AddDishes from "../pages/nutritionist/Dishes Management/AddDishes";
import ChatWindow from "../components/Chat/ChatWindow";
import ProtectedRoute from "../components/ProtectedRoute";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import IngredientList from "../pages/ingredients/ingredientByType";
import DishesList from "../pages/dishes/dishByType";
import AddIngredient from "../pages/nutritionist/Ingredient Management/AddIngredient";
import FAQs from "../pages/user/footer/FAQs";
import About from "../pages/user/footer/About";
import Contact from "../pages/user/footer/Contact";
import Term from "../pages/user/footer/Term";
import AboutUsManagement from "../pages/admin/FooterManagement/AboutUsManagement";
import TermOfUseManagement from "../pages/admin/FooterManagement/TermOfUseManagement";
import FAQsManagement from "../pages/admin/FooterManagement/FAQsManagement";
import ContactUsManagement from "../pages/admin/FooterManagement/ContactUsManagement";
import HealthyDashboard from "../pages/admin/pages/HealthyDashboard";
import UserManagement from "../pages/admin/pages/UserManagement";
import IngredientsManagement from "../pages/admin/pages/IngredientManagement";
import DishManagement from "../pages/admin/pages/DishManagement";
import MealPlan from "../pages/admin/pages/MealPlan";
import EditUser from "../pages/user/EditUser";
import ViewProfile from "../pages/user/ViewProfile";
import Quiz from "../pages/user/Quiz";
import AddUser from "../pages/admin/pages/AddUserManagement";
import AdminProfile from "../pages/user/AdminProfile";
import EditAdmin from "../pages/user/EditAdmin";

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

        <Route path="/edituser/:id" element={<EditUser />} />

        <Route path="/viewprofile" element={<ViewProfile />} />

        <Route path="/foodrecommend" element={<Quiz/>} />

        {/* Các route cần đăng nhập */}
        <Route
          path="user"
          element={
            <PrivateRoute>
              <ViewProfile />
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

        <Route path="ingredients/:type" element={<IngredientList />} />
        <Route path="dishes/:type" element={<DishesList />} />

        {/* ✅ Bảo vệ trang chat, chỉ user mới vào được */}
        <Route
          path="chat"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ChatWindow />
            </ProtectedRoute>
          }
        />
        <Route path="faqs" element={<FAQs />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="term" element={<Term />} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<AdminProfile/>}/>
          <Route path="adduser" element={<AddUser />}/>
          <Route path="user" element={<TableUser />} />
          <Route path="order" element={<TableOrder />} />
          <Route path="dashboard" element={<HealthyDashboard />} />
          <Route path="usermanagement" element={<UserManagement />} />
          <Route
            path="ingredientsmanagement"
            element={<IngredientsManagement />}
          />
          <Route path="dishmanagement" element={<DishManagement />} />
          <Route path="mealplan" element={<MealPlan />} />
          <Route path="editadmin/:id" element={<EditAdmin />} />
          <Route path="edituser/:id" element={<EditUser />} />
          <Route path="viewprofile" element={<ViewProfile />} />
          <Route path="aboutusmanagement" element={<AboutUsManagement />} />
          <Route path="termofusemanagement" element={<TermOfUseManagement />} />
          <Route path="faqsManagement" element={<FAQsManagement />} />
          <Route path="contactusmanagement" element={<ContactUsManagement />} />
        </Route>
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
        <Route path="mealplan" element={<TableMealPlan />} />
        {/* <Route path="dishes" element={<TableDishes />} /> */}
        <Route path="dishes">
          <Route index element={<TableDishes />} />
          <Route path="add" element={<AddDishes />} />
        </Route>

        <Route path="ingredients">
          <Route index element={<TableIngredient />} />
          <Route path="add" element={<AddIngredient />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
