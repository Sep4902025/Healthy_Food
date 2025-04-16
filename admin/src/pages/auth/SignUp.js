import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../../store/actions/authActions";
import { selectIsAuthenticated } from "../../store/selectors/authSelectors";
import AuthService from "../../services/auth.service";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    username: "",
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

  const validateUsername = (username) => {
    const usernameRegex = /^[A-Za-z\s]+$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username
    if (!validateUsername(formData.username)) {
      toast.error("Full Name must contain only letters and spaces!");
      return;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character!"
      );
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await AuthService.signup(formData);

      if (response.success === true) {
        toast.success(response.message || "Sign up successful!");
        setTimeout(() => {
          navigate("/signin");
        }, 1000);
      } else {
        toast.error(response.message || "Sign up failed!");
      }
    } catch (error) {
      const errorMessage = error.message || "Sign up failed. Please try again!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const success = await dispatch(loginWithGoogle(credentialResponse.credential));
    if (success) {
      navigate("/");
    }
  };

  const handleTermsAccept = () => {
    setShowTermsModal(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
            <p className="text-gray-600">
              Your email address is essential. It will be used for account recovery, such as
              resetting or changing your password. If you choose to sign up quickly without entering
              a valid email, you may face difficulties related to account recovery or security.
            </p>
            <p className="text-gray-600">
              By proceeding, you agree to our terms of service and privacy policy.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleTermsAccept}
                className="py-2 px-4 bg-[#1C1B1F] text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-8">
        {/* Logo and Icon */}
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

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Full Name
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
                placeholder="Full Name"
              />
            </div>
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
            <div>
              <label htmlFor="passwordConfirm" className="sr-only">
                Confirm Password
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#1C1B1F] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing up..." : "Sign up"}
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
              onError={() => toast.error("Sign in failed")}
              type="icon"
              shape="circle"
              theme="outline"
              size="large"
              useOneTap={false}
              auto_select={false}
              prompt="select_account"
            />
          </div>

          {/* Link to Login */}
          <div className="text-center text-sm">
            <span className="text-gray-500">Already have an account?</span>
            <Link to="/signin" className="ml-1 text-pink-500 hover:text-pink-600">
              Sign in
            </Link>
          </div>
        </form>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-green-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-50"></div>
      </div>
    </div>
  );
};

export default SignUp;
