import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";
import { FaUser, FaUpload, FaCheck, FaBan } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "./EditUser.css"; // Reusing EditUser CSS
import UserService from "../../services/user.service";

const EditAdmin = () => {
  const location = useLocation();
  const userData = location.state?.user || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);

  const [user, setUser] = useState({
    username: "",
    email: "",
    profileImageUrl: "",
    profileImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Check if user exists and is admin
    if (!currentUser) {
      navigate("/signin");
      return;
    }

    if (currentUser.role !== "admin") {
      navigate("/user"); // Redirect to normal profile if not admin
      return;
    }

    // Set user data from location state or fetch it
    if (userData && Object.keys(userData).length > 0) {
      setUser({
        username: userData.username || "",
        email: userData.email || "",
        profileImageUrl: userData.avatar_url || "",
        profileImage: null,
      });

      if (userData.avatar_url) {
        setPreviewImage(userData.avatar_url);
      }
    } else if (id) {
      fetchUserData(id);
    }
  }, [userData, id, currentUser, navigate]);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const response = await UserService.getUserById(userId);

      if (response.success) {
        setUser(response.user);
        if (response.user.profileImageUrl) {
          setPreviewImage(response.user.profileImageUrl);
        }
      } else {
        toast.error(response.message || "Failed to load user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(
        "Failed to load user data: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image to Cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "upload-image");

      const cloudName =
        process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dds8jiclc";

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      if (response.data && response.data.secure_url) {
        setUser((prevUser) => ({
          ...prevUser,
          profileImageUrl: response.data.secure_url,
          profileImage: response.data.public_id,
        }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast.error(
        "Failed to upload image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/profile`);
    toast.info("Changes cancelled");
  };

  const handleSubmit = async () => {
    if (!user.username || !user.email) {
      toast.error("Username and email are required");
      return;
    }

    try {
      setLoading(true);

      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar_url: user.profileImageUrl,
        profileImage: user.profileImage,
      };

      const userRole = "admin"; // Hoặc lấy từ context, redux, localStorage, v.v.

      // Truyền thêm userRole vào UserService.updateUser
      const response = await UserService.updateUser(id, userData);

      if (response.success) {
        toast.success("Admin profile updated successfully");
        navigate("/admin/profile");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating admin profile:", error);
      toast.error(
        "Failed to update profile: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
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
          <li className="active">
            <FaUser className="menu-icon" />
            <span>Profile</span>
          </li>
        </ul>
      </div>

      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <h1>Edit Admin Profile</h1>
        </div>

        <div className="edit-profile-form">
          <div className="profile-image-section">
            <div className="profile-image-container">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-image-placeholder">
                  {user.username ? user.username.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              {uploading && (
                <div className="image-upload-overlay">Uploading...</div>
              )}
            </div>
            <button
              className="upload-photo-btn"
              onClick={() =>
                document.getElementById("profile-image-input").click()
              }
              disabled={uploading}
            >
              <FaUpload /> {uploading ? "Uploading..." : "Upload Photo"}
            </button>
            <input
              type="file"
              id="profile-image-input"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              disabled={uploading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Admin Name:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={user.username}
                onChange={handleInputChange}
                placeholder="Enter admin name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                placeholder="Enter admin email"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={loading || uploading}
            >
              <FaBan /> Cancel
            </button>
            <button
              className="btn btn-save"
              onClick={handleSubmit}
              disabled={loading || uploading}
            >
              <FaCheck /> {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAdmin;
