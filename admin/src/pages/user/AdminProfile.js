import React, { useState, useEffect } from "react";
import { FaKey, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";
import { useNavigate } from "react-router-dom";
import "./ViewProfile.css"; // Sử dụng CSS từ ViewProfile

const AdminProfile = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra nếu người dùng tồn tại và là admin
    if (!user) {
      navigate("/signin");
      return;
    }

    if (user.role !== "admin") {
      navigate("/user"); // Chuyển hướng đến profile thông thường nếu không phải admin
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  const handleEditClick = () => {
    // Chuyển hướng đến trang chỉnh sửa profile của admin
    navigate(`/admin/editadmin/${user._id}`, { state: { user } });
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="sidebar-header">
          <div className="profile-initial">
            {user.username ? user.username.charAt(0).toUpperCase() : "A"}
          </div>
          <h2>Admin Profile</h2>
        </div>

        <ul className="sidebar-menu">
          <li className="active">
            <FaUser className="menu-icon" />
            <span>Profile</span>
          </li>
          <li onClick={() => navigate("/admin/change-password")}>
            <FaKey className="menu-icon" />
            <span>Change Password</span>
          </li>
        </ul>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <h1>ADMIN PROFILE</h1>
        </div>

        <div className="profile-main">
          <div className="profile-info-card">
            <div className="profile-info-section">
              <div className="profile-image-container">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <span>{user.username ? user.username.charAt(0).toUpperCase() : ""}</span>
                  </div>
                )}
              </div>

              <div className="user-info">
                <div className="info-row">
                  <div className="info-label">Admin Name</div>
                  <div className="info-value">{user.username || "Admin"}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Email</div>
                  <div className="info-value">{user.email || "admin@example.com"}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Role</div>
                  <div className="info-value">Administrator</div>
                </div>

                <button className="edit-button" onClick={handleEditClick}>
                  EDIT
                </button>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3>Admin Privileges</h3>
              </div>
              <p className="section-content">
                As an administrator, you have full access to manage users, content, and system
                settings. Use the Management link in the navigation bar to access the admin
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
