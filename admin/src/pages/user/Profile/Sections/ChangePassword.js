import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../../../services/auth.service";
import "./ChangePassword.css";
import { FaUser, FaKey } from "react-icons/fa";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    email: "",
    profileImageUrl: "",
    profileImage: null,
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    try {
      const response = await AuthService.changePassword(passwords);
      if (response.success) {
        toast.success("Đổi mật khẩu thành công!");
        navigate("/admin/profile"); // Chuyển về trang profile sau khi đổi thành công
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi!");
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="profile-sidebar">
        <div className="profile-avatar-container">
          <span className="profile-initial">
            {user.username ? user.username.charAt(0).toUpperCase() : "A"}
          </span>
          <h2>Admin Profile</h2>
        </div>

        <ul className="sidebar-menu">
          <li onClick={() =>  navigate(`/admin/adminprofile/${user._id}`, { state: { user } })}>
            <FaUser className="menu-icon" />
            <span>Profile</span>
          </li>
          <li className="active" onClick={() => navigate("/admin/change-password")}>
            <FaKey className="menu-icon" />
            <span>Change Password</span>
          </li>
        </ul>
      </div>

      <div className="change-password-container">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit} className="change-password-form">
          <label>Old Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="oldPassword"
            value={passwords.oldPassword}
            onChange={handleChange}
            required
          />

          <label>New Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />

          <label>Confirm New Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="button" onClick={togglePasswordVisibility}>
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
