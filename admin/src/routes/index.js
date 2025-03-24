import { Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import PrivateRoute from "../components/PrivateRoute";
import Home from "../pages/user/Home";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import User from "../pages/user/User";
import MealPlanUser from "../pages/user/MealPlan/MealPlan";
import Ingredient from "../pages/user/Ingredient";
import ForgetPassword from "../pages/auth/ForgetPassword";
import AdminLayout from "../components/layouts/AdminLayout";
import NutritionistLayout from "../components/layouts/NutritionistLayout";
import NutritionChat from "../pages/nutritionist/NutritionChat";
import TableIngredient from "../pages/nutritionist/Ingredient Management/TableIngredient";
import TableMealPlan from "../pages/nutritionist/MealPlan Management/TableMealPlan";
import TableDishes from "../pages/nutritionist/Dishes Management/TableDishes";
import AddDishes from "../pages/nutritionist/Dishes Management/AddDishes";
import TableRecipes from "../pages/nutritionist/Recipes Management/TableRecipes";
import ProtectedRoute from "../components/ProtectedRoute";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import IngredientList from "../pages/ingredients/ingredientByType";
import DishesList from "../pages/dishes/dishByType";
import RecipeView from "../pages/recipe/ViewRecipe";
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
import EditUser from "../pages/user/EditUser";
import ViewProfile from "../pages/user/ViewProfile";
import DishDetail from "../pages/user/DishDetail";
import Favorite from "../pages/survey/Favorite";
import Age from "../pages/survey/Age";
import Diet from "../pages/survey/Diet";
import EatHabit from "../pages/survey/EatHabit";
import Email from "../pages/survey/Email";
import Gender from "../pages/survey/Gender";
import Goal from "../pages/survey/Goal";
import Hate from "../pages/survey/Hate";
import Height from "../pages/survey/Height";
import LongOfPlan from "../pages/survey/LongOfPlan";
import MealNumber from "../pages/survey/MealNumber";
import Name from "../pages/survey/Name";
import PhoneNumber from "../pages/survey/PhoneNumber";
import SleepTime from "../pages/survey/SleepTime";
import UnderDisease from "../pages/survey/UnderDisease";
import WaterDrink from "../pages/survey/WaterDrink";
import Weight from "../pages/survey/Weight";
import WeightGoal from "../pages/survey/WeightGoal";
import ForYoyPage from "../pages/user/ForYouPage";
import AddUser from "../pages/admin/pages/AddUserManagement";
import AdminProfile from "../pages/user/AdminProfile";
import EditAdmin from "../pages/user/EditAdmin";
import ChangePassword from "../pages/user/Profile/Sections/ChangePassword";
import TableMedicalConditions from "../pages/nutritionist/Medical Condition Management/TableMedicalConditions";
import AddMedicalCondition from "../pages/nutritionist/Medical Condition Management/AddMedicalCondition";
import CreateMealPlanNutritionist from "../pages/nutritionist/MealPlan Management/CreateMealPlanPage";
import EditMealPlanNutritionist from "../pages/nutritionist/MealPlan Management/EditMealPlanPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Các route cần đăng nhập MainLayout User */}
      <Route path="/" element={<MainLayout />}>
        <Route path="signin" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="verify" element={<VerifyOtp />} />
        <Route path="forgot-password" element={<ForgetPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route index element={<Home />} />
        <Route path="viewprofile" element={<ViewProfile />} />

        {/* Router recipe */}
        <Route path=":dishId/recipes/:recipeId" element={<RecipeView />} />
        {/* Router mealPlan */}
        <Route
          path="mealplan"
          element={
            <PrivateRoute>
              <MealPlanUser />
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
          path="dishes/:dishId"
          element={
            <PrivateRoute>
              <DishDetail />
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

        <Route
          path="/foryou"
          element={
            <PrivateRoute>
              <ForYoyPage />
            </PrivateRoute>
          }
        />
        <Route path="faqs" element={<FAQs />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="term" element={<Term />} />

        {/* ✅ Gom các route của quiz vào đây */}
        <Route
          path="/survey"
          element={
            <PrivateRoute>
              <Outlet />
            </PrivateRoute>
          }
        >
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
      </Route>

      {/* Các route cần đăng nhập AdminLayout Admin*/}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HealthyDashboard />} />
        {/* ✅ Thêm route cho Footer Management */}
        <Route path="profile" element={<AdminProfile />} />
        <Route path="adduser" element={<AddUser />} />
        <Route path="aboutusmanagement" element={<AboutUsManagement />} />
        <Route path="termofusemanagement" element={<TermOfUseManagement />} />
        <Route path="faqsManagement" element={<FAQsManagement />} />
        <Route path="contactusmanagement" element={<ContactUsManagement />} />

        <Route path="usermanagement" element={<UserManagement />} />
        <Route path="dishmanagement" element={<DishManagement />} />
        <Route path="ingredientsmanagement" element={<IngredientsManagement />} />
        <Route path="mealplan" element={<TableMealPlan />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="editadmin/:id" element={<EditAdmin />} />
        <Route path="edituser/:id" element={<EditUser />} />
        <Route path="viewprofile/:id" element={<ViewProfile />} />
      </Route>

      {/* ✅ Bảo vệ toàn bộ route NutritionistLayout Nutritionist*/}
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
        <Route path="mealplan/create" element={<CreateMealPlanNutritionist />} />
        <Route
          path="/nutritionist/mealplan/edit/:mealPlanId"
          element={<EditMealPlanNutritionist />}
        />
        <Route path="dishes">
          <Route index element={<TableDishes />} />
          <Route path="add" element={<AddDishes />} />
        </Route>

        <Route path="ingredients">
          <Route index element={<TableIngredient />} />
          <Route path="add" element={<AddIngredient />} />
        </Route>

        <Route path="recipes">
          <Route index element={<TableRecipes />} />
        </Route>

        <Route path="medicalConditions">
          <Route index element={<TableMedicalConditions />} />
          <Route path="add" element={<AddMedicalCondition />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
