import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/selectors/authSelectors"; // Giả sử bạn có selector để lấy thông tin user

const Footer = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser); // Lấy thông tin user từ Redux store
  const isLoggedIn = !!localStorage.getItem("token"); // Kiểm tra xem có token trong localStorage hay không
  const isAdminOrNutritionist = user && (user.role === "admin" || user.role === "nutritionist");

  // Điều kiện để hiển thị nút "Apply to Become a Nutritionist"
  const showApplyButton = isLoggedIn && !isAdminOrNutritionist;

  return (
    <footer className="bg-white py-8 px-12 flex flex-col md:flex-row justify-between items-center mt-auto w-full border-t">
      {/* Phần bên trái */}
      <p className="text-sm mb-4 md:mb-0">Copyright © 2025 HFINC | All rights reserved</p>

      {/* Phần giữa - Nút Apply */}
      {showApplyButton && (
        <button
          onClick={() => navigate("/apply-nutritionist")}
          className="hover:underline text-green-600 font-semibold mb-4 md:mb-0"
        >
          Apply to Become a Nutritionist
        </button>
      )}

      {/* Phần bên phải */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
        <button onClick={() => navigate("/about")} className="hover:underline">
          About Us
        </button>
        <button onClick={() => navigate("/FAQs")} className="hover:underline">
          FAQs
        </button>
        <button onClick={() => navigate("/contact")} className="hover:underline">
          Contact Us
        </button>
        <button onClick={() => navigate("/term")} className="hover:underline">
          Terms of Use
        </button>
      </div>
    </footer>
  );
};

export default Footer;