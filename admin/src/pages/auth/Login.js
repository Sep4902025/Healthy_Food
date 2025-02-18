import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithEmail, loginWithGoogle } from "../../store/actions/authActions";
import { selectIsAuthenticated, selectAuthLoading } from "../../store/selectors/authSelectors";
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(loginWithEmail(formData));
      console.log("Login response:", response);

      if (response && response.success) {
        const userRole = response.user.role;
        console.log("User role:", userRole);

        if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "nutritionist") {
          navigate("/nutritionist");
        } else {
          navigate("/"); // Điều hướng user bình thường về trang chủ
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const success = await dispatch(loginWithGoogle(credentialResponse.credential));
      if (success) {
        toast.success("Đăng nhập Google thành công!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Đăng nhập Google thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo và Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                stroke="#FF69B4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                stroke="#FF69B4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Sign in with email</h2>
        </div>

        {/* Form đăng nhập */}
        <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/auth/forget-password" className="text-sm text-pink-500 hover:text-pink-600">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#1C1B1F] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Đăng nhập thất bại")}
              type="icon"
              shape="circle"
              theme="outline"
              size="large"
              useOneTap={false}
              auto_select={false}
              prompt="select_account"
            />
          </div>

          {/* Link to Signup */}
          <div className="text-center text-sm">
            <span className="text-gray-500">Don't have an account?</span>
            <Link to="/auth/signup" className="ml-1 text-pink-500 hover:text-pink-600">
              Sign up
            </Link>
          </div>
        </form>

        {/* Trang trí */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-green-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-50"></div>
      </div>
    </div>
  );
};

export default Login;
