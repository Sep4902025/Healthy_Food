import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VerifyLogo from "../../assets/images/verify.png";
import AuthService from "../../services/auth.service";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (event) => {
    event.preventDefault();

    const email = sessionStorage.getItem("resetEmail"); // Lấy email từ sessionStorage
    if (!email) {
      setError("Missing email data. Please request OTP again.");
      toast.error("Missing email data. Please request OTP again.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await AuthService.resetPassword(email, password, passwordConfirm);
      if (response.status === "success") {
        toast.success("Password reset successfully! Redirecting...");
        sessionStorage.removeItem("resetEmail"); // Xóa email khỏi sessionStorage sau khi reset thành công
        navigate("/signin");
      }
    } catch (error) {
      setError("Failed to reset password. Please try again.");
      toast.error("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <img src={VerifyLogo} alt="Verify Logo" className="w-[60%] h-[60%]" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4 text-custom-green">
          Change New Password
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter a different password from the previous one
        </p>

        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label htmlFor="new-password" className="block text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="**** **** ****"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirm-password" className="block text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="**** **** ****"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-custom-green text-white font-semibold rounded-lg hover:bg-custom-green-hover transition duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
