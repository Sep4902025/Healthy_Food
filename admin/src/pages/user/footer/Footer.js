import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/selectors/authSelectors";

const Footer = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userRole = user?.role;
  const isLoggedIn = !!localStorage.getItem("token");
  const isAdminOrNutritionist =
    user && (user.role === "admin" || user.role === "nutritionist");

  // Điều kiện để hiển thị nút "Apply to Become a Nutritionist"
  const showApplyButton = isLoggedIn && !isAdminOrNutritionist;

  return (
    <footer className="bg-white py-8 px-12 flex flex-col md:flex-row justify-between items-center mt-auto w-full border-t">
      {/* Phần bên trái */}
      <p className="text-sm mb-4 md:mb-0">
        Copyright © 2025 HFINC | All rights reserved
      </p>

      {/* Phần giữa - Nút Apply */}
      {showApplyButton && (
        <button
          onClick={() => navigate("/apply-nutritionist")}
          className="hover:underline text-green-600 font-semibold mb-4 md:mb-0"
        >
          Apply to Become a Nutritionist
        </button>
      )}

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
        <button
          onClick={() =>
            navigate(
              userRole === "admin" ? "/admin/aboutusmanagement" : "/about"
            )
          }
          className="hover:underline"
        >
          About Us
        </button>
        <button
          onClick={() =>
            navigate(userRole === "admin" ? "/admin/faqsmanagement" : "/faqs")
          }
          className="hover:underline"
        >
          FAQs
        </button>
        <button
          onClick={() =>
            navigate(
              userRole === "admin" ? "/admin/contactusmanagement" : "/contact"
            )
          }
          className="hover:underline"
        >
          Contact Us
        </button>
        <button
          onClick={() =>
            navigate(
              userRole === "admin" ? "/admin/termofusemanagement" : "/term"
            )
          }
          className="hover:underline"
        >
          Terms of Use
        </button>
      </div>
    </footer>
  );
};

export default Footer;
