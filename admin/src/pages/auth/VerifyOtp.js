import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VerifyLogo from "../../assets/images/verify.png";
import AuthService from "../../services/auth.service";
import { toast } from "react-toastify";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState(""); // Trạng thái lỗi
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus(); // Focus vào ô đầu tiên khi component mount
    }
  }, []);

  const handleChange = (index, event) => {
    const { value } = event.target;
    const newOtp = [...otp];

    if (/^[0-9]?$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);
      setError(""); // Reset lỗi nếu người dùng nhập lại

      // Chuyển focus sang ô tiếp theo nếu nhập số
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text").trim();

    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      setError(""); // Reset lỗi nếu người dùng paste đúng OTP

      // Focus vào ô cuối cùng
      inputRefs.current[3].focus();
    }
  };

  const handleVerify = async () => {
    console.log("Current OTP State:", otp);
    console.log("Joined OTP:", otp.join(""));

    const email = sessionStorage.getItem("resetEmail");
    if (!email) {
      setError("Missing email data. Please request OTP again.");
      toast.error("Missing email data. Please request OTP again.");
      return;
    }

    try {
      const otpValue = otp.join("");
      console.log("OTP to send:", otpValue);

      const response = await AuthService.verifyOTP(email, otpValue);

      if (response.status === "success") {
        localStorage.setItem("token", response.token); // Lưu token
        toast.success("OTP verified! Redirecting...");
        navigate("/reset-password");
      }
    } catch (error) {
      console.error("API Error:", error);
      setError(error.message || "Invalid OTP. Please try again.");
      toast.error(error.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    const email = sessionStorage.getItem("resetEmail"); // Lấy email từ sessionStorage
    console.log("reset Email", email);

    if (!email) {
      setError("Email không tồn tại. Vui lòng yêu cầu OTP lại.");
      toast.error("Email không tồn tại. Vui lòng yêu cầu OTP lại.");
      return;
    }

    try {
      const response = await AuthService.resendOTP(email);

      if (response.status === "success") {
        toast.success("Mã OTP mới đã được gửi đến email của bạn.");
      }
    } catch (error) {
      setError("Không thể gửi lại OTP. Vui lòng thử lại.");
      toast.error("Không thể gửi lại OTP. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96 text-center">
        <div className="flex justify-center mb-4">
          <img src={VerifyLogo} alt="Success" className="w-[60%] h-[60%]" />
        </div>
        <h1 className="text-2xl text-custom-green font-semibold">Verify OTP</h1>
        <p className="text-gray-600 mb-6">Please enter the OTP sent to your email</p>

        <div className="flex justify-center space-x-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              className="w-10 h-10 border border-gray-300 rounded text-center"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleVerify}
          className="bg-custom-green text-white px-4 py-2 rounded mb-4 w-full"
        >
          Verify Code
        </button>

        <p className="text-gray-600">
          Can’t get OTP?{" "}
          <span className="text-custom-green cursor-pointer">
            <span onClick={handleResendOTP} className="text-custom-green cursor-pointer">
              Resend
            </span>
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
