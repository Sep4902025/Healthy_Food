import React, { useEffect, useState, useRef } from "react";
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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    username: "",
  });
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (showOtpModal && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showOtpModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtpChange = (index, event) => {
    const { value } = event.target;
    const newOtp = [...otp];

    if (/^[0-9]?$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError("");

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text").trim();

    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      setOtpError("");
      inputRefs.current[3].focus();
    }
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[A-Za-z\s]+$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestOtp = async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.requestOtpForSignUp({ email: formData.email });

      if (response.status === 200) {
        toast.success("OTP sent to your email!");
        setShowOtpModal(true);
      } else {
        toast.error(response.data.message || "Failed to request OTP!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setOtpError("Please enter a 4-digit OTP!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await AuthService.verifyOtpForSignUp({
        email: formData.email,
        otp: otpValue,
      });

      if (response.status === 200) {
        // Proceed with signup
        await handleFinalSignup();
      } else {
        setOtpError(response.data.message || "Invalid OTP!");
        toast.error(response.data.message || "Invalid OTP!");
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid OTP!");
      toast.error(error.response?.data?.message || "Invalid OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSignup = async () => {
    try {
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
      toast.error(error.message || "Sign up failed. Please try again!");
    } finally {
      setShowOtpModal(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateUsername(formData.username)) {
      toast.error("Full Name must contain only letters and spaces!");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

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

    // Request OTP
    await handleRequestOtp();
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
              Your email address is essential. You will need to verify it with an OTP to complete
              the signup process.
            </p>
            <p className="text-gray-600 tipologie">
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

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-md rounded-lg p-8 w-96 text-center relative">
            {/* Nút đóng modal */}
            <button
              onClick={() => setShowOtpModal(false)} // Giả sử bạn có state showOtpModal
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h1 className="text-2xl text-custom-green font-semibold">Verify OTP</h1>
            <p className="text-gray-600 mb-6">Please enter the OTP sent to your email</p>

            <div className="flex justify-center space-x-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  className="w-10 h-10 border border-gray-300 rounded text-center focus:border-custom-green focus:ring-custom-green"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>

            {otpError && <p className="text-red-500 text-sm mb-4">{otpError}</p>}

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="bg-custom-green text-white px-4 py-2 rounded mb-4 w-full hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-gray-600">
              Can’t get OTP?{" "}
              <span
                onClick={handleRequestOtp}
                className="text-custom-green cursor-pointer hover:underline"
              >
                Resend
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md rounded-lg p-8">
        {/* Logo */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-custom-green outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-custom-green outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-custom-green outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-green focus:border-custom-green outline-none"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#1C1B1F] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Sign up"}
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
            <span className="text-gray-600">Already have an account?</span>
            <Link to="/signin" className="ml-1 text-pink-500 hover:text-pink-600">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
