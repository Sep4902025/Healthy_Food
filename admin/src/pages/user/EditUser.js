import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaUpload,
  FaTrash,
  FaCheck,
  FaShoppingCart,
  FaBan,
  FaKey,
  FaQuestionCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./EditUser.css";
import UserService from "../../services/user.service";

const EditUser = () => {
  const location = useLocation();
  const userData = location.state?.user || {};
  const { id } = useParams();
  console.log("IDDDDDDD", id);

  const [user, setUser] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    gender: "Male",
    weight: "",
    height: "",
    profileImage: null,
    profileImageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setUser(userData);
      if (userData.profileImageUrl) {
        setPreviewImage(userData.profileImageUrl);
      }
    } else if (id) {
      fetchUserData(id);
    }
  }, [userData, id]);

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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  }, []);

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

      // Make sure your cloud name is correct and upload preset is properly configured in Cloudinary
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

  const handleClear = () => {
    setUser({
      username: "",
      email: "",
      phoneNumber: "",
      gender: "Male",
      weight: "",
      height: "",
      profileImage: null,
      profileImageUrl: "",
    });
    setPreviewImage(null);
  };

  const handleCancel = () => {
    // Restore original data
    if (id) {
      fetchUserData(id);
    } else {
      handleClear();
    }
    toast.info("Changes cancelled");
  };

  const handleSubmit = async () => {
    if (!user.username || !user.email) {
      toast.error("Username and email are required");
      return;
    }

    try {
      setLoading(true);

      // Optional: Validate data before sending
      const userData = {
        id: id, // Make sure to include the user ID
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        profileImageUrl: user.profileImageUrl,
        profileImage: user.profileImage,
      };

      // Make sure your API endpoint is correct
      // Consider using a base URL from environment variables
      // Truyền thêm userRole vào UserService.updateUser
      const response = await UserService.updateUser(id, userData);

      if (response.status === 200) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
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
            {user.username ? user.username.charAt(0).toUpperCase() : "G"}
          </span>
          <h2>My Profile</h2>
        </div>

        <ul className="sidebar-menu">
          <li className="active">
            <FaUser className="menu-icon" />
            <span>Profile</span>
          </li>
          <li>
            <FaShoppingCart className="menu-icon" />
            <span>Favorite Food</span>
          </li>
          <li>
            <FaBan className="menu-icon" />
            <span>Don't Eat Food</span>
          </li>
          <li>
            <FaKey className="menu-icon" />
            <span>Change Password</span>
          </li>
          <li>
            <FaQuestionCircle className="menu-icon" />
            <span>FAQs</span>
          </li>
        </ul>
      </div>

      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <h1>Edit Profile</h1>
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
                  {user.username ? user.username.charAt(0).toUpperCase() : ""}
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
              <label htmlFor="username">Your Name:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={user.username}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Gender:</label>
              <div className="gender-options">
                <label className="radio-container">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={user.gender === "Male"}
                    onChange={handleInputChange}
                  />
                  <span className="radio-custom"></span>
                  Male
                </label>
                <label className="radio-container">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={user.gender === "Female"}
                    onChange={handleInputChange}
                  />
                  <span className="radio-custom"></span>
                  Female
                </label>
              </div>
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
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight:</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={user.weight}
                onChange={handleInputChange}
                placeholder="Enter weight in kg"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number:</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={user.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="height">Height:</label>
              <input
                type="text"
                id="height"
                name="height"
                value={user.height}
                onChange={handleInputChange}
                placeholder="Enter height in m"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-clear"
              onClick={handleClear}
              disabled={loading || uploading}
            >
              <FaTrash /> Clear
            </button>
            <button
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={loading || uploading}
            >
              <FaCheck /> Cancel
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

export default EditUser;
