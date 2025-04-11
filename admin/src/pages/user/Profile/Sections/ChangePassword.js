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
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.newPasswordConfirm) {
      toast.error("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    if (passwords.newPassword !== passwords.newPasswordConfirm) {
      toast.error("New passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long!");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await AuthService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        newPasswordConfirm: passwords.newPasswordConfirm,
      });

      if (response.success) {
        toast.success(response.message);
        setPasswords({
          currentPassword: "",
          newPassword: "",
          newPasswordConfirm: "",
        });
        localStorage.removeItem("token"); // Xóa token để yêu cầu đăng nhập lại
        localStorage.removeItem("username"); // Xóa username nếu cần
        navigate("/signin"); // Chuyển về trang đăng nhập
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="profile-sidebar">
        <div className="profile-avatar-container">
          <span className="profile-initial">{user.username.charAt(0).toUpperCase()}</span>
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
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
              <span className="password-toggle" onClick={() => togglePasswordVisibility("current")}>
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
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
                placeholder="Enter new password"
              />
              <span className="password-toggle" onClick={() => togglePasswordVisibility("new")}>
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="password-wrapper">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="newPasswordConfirm"
                value={passwords.newPasswordConfirm}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
              <span className="password-toggle" onClick={() => togglePasswordVisibility("confirm")}>
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
