import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import User from "../pages/User";
import Dishes from "../pages/Dishes";
import MealsPlan from "../pages/MealsPlan";
import Ingredient from "../pages/Ingredient";
import Home from "../pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "user", element: <User /> },
      { path: "dishes", element: <Dishes /> },
      { path: "meal", element: <MealsPlan /> },
      { path: "ingredient", element: <Ingredient /> },
      { path: "", element: <Home /> },
    ],
  },
]);
export default router;
