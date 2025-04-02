import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../../../services/auth.service";
import "./ChangePassword.css";
import { FaUser, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [user] = useState({
    username: localStorage.getItem("username") || "Admin",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    console.log("Token being sent:", token);
    if (!token) {
      toast.error("No authentication token found. Please log in.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long!");
      return;
    }

    try {
      const response = await AuthService.changePassword({
        currentPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
        newPasswordConfirm: passwords.confirmPassword,
      });

      if (response.success) {
        toast.success("Password changed successfully!");
        setPasswords({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        navigate("/admin/profile");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "Error changing password!");
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="profile-sidebar">
        <div className="profile-avatar-container">
          <span className="profile-initial">
            {user.username.charAt(0).toUpperCase()}
          </span>
          <h2>{user.username}'s Profile</h2>
        </div>

        <ul className="sidebar-menu">
          <li onClick={() => navigate("/admin/profile")}>
            <FaUser className="menu-icon" />
            <span>Profile</span>
          </li>
          <li className="active">
            <FaKey className="menu-icon" />
            <span>Change Password</span>
          </li>
        </ul>
      </div>

      <div className="change-password-container">
        <h2>Change Your Password</h2>
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="input-group">
            <label>Current Password</label>
            <div className="password-wrapper">
              <input
                type={showPasswords.old ? "text" : "password"}
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handleChange}
                required
                placeholder="Enter current password"
              />
              <span
                className="password-toggle"
                onClick={() => togglePasswordVisibility("old")}
              >
                {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter new password"
              />
              <span
                className="password-toggle"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="password-wrapper">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm new password"
              />
              <span
                className="password-toggle"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
