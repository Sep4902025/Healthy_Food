import React, { useState } from "react";

import ForgetPasswordLogo from "../../assets/images/forget-password.png";
import AuthService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleForgetPassword = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await AuthService.forgetPassword(email);
      setMessage(response.message || "Check your email for reset instructions.");
      toast.success("Reset code send your email");
      // ✅ Lưu email vào sessionStorage
      sessionStorage.setItem("resetEmail", email);
      navigate("/verify");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 w-96">
        <div className="flex justify-center mb-4">
          <img src={ForgetPasswordLogo} alt="Forget Password" className="w-[60%] h-[60%]" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Forgot password</h2>
        <p className="text-gray-600 text-center mb-6">Enter your registered email below</p>

        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleForgetPassword}
          className="w-full bg-green-500 text-white font-bold py-2 rounded-md hover:bg-green-600 transition duration-200"
          disabled={loading}
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>

        <p className="text-center text-gray-500 mt-4">
          Remember the password?{" "}
          <a href="/login" className="text-green-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;
