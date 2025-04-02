import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { FaUser, FaUpload, FaCheck, FaBan } from "react-icons/fa";
import { toast } from "react-toastify";
import "./EditUser.css"; // Reusing EditUser CSS for non-upload parts
import UserService from "../../services/user.service";
import { updateUserSuccess } from "../../store/slices/authSlice";
import uploadFile from "../../helpers/uploadFile";
import { selectAuth } from "../../store/selectors/authSelectors";

const EditAdmin = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth); // Lấy user từ Redux store
  console.log("AD", user);

  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    user?.avatarUrl || "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null); // State để lưu file tạm thời khi chọn
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (user.role !== "admin") {
      navigate("/user");
      return;
    }

    // Cập nhật formData và previewImage khi user từ Redux thay đổi
    setFormData({
      username: user.username || "",
      email: user.email || "",
    });
    setPreviewImage(user.avatarUrl || null);
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage({ file, url: imageUrl });
      setSelectedFile(file);
    }
  };

  const handleCancelPreview = () => {
    setPreviewImage(user.avatarUrl || null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error("No image selected to upload!");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(
        selectedFile,
        (percent) => setUploadProgress(percent),
        (cancel) => console.log("Upload canceled")
      );
      const avatarUrl = result.secure_url;

      // Cập nhật Redux store với avatarUrl mới
      const updatedUser = { ...user, avatarUrl };
      dispatch(updateUserSuccess(updatedUser));
      setPreviewImage(avatarUrl);
      setSelectedFile(null);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast.error("Failed to upload image: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleCancel = () => {
    navigate(`/admin/profile`);
    toast.info("Changes cancelled");
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email) {
      toast.error("Username and email are required");
      return;
    }

    try {
      setLoading(true);

      const updatedData = {
        id: user._id || id,
        username: formData.username,
        email: formData.email,
        avatar_url: user.avatarUrl,
      };

      const response = await UserService.updateUser(id || user._id, updatedData);

      if (response.success) {
        dispatch(updateUserSuccess(response.user));
        toast.success("Admin profile updated successfully");
        navigate("/admin/profile", { state: { updatedUser: response.user } });
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating admin profile:", error);
      toast.error("Failed to update profile: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="profile-sidebar">
        <div className="profile-avatar-container">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <img
              src={"https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
          )}
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
          <div className="profile-image-section flex flex-col items-center">
            <div className="relative">
              {uploading && (
                <div className="absolute -top-3 w-24 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {previewImage ? (
                typeof previewImage === "string" ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-md"
                  />
                ) : (
                  <img
                    src={previewImage.url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-md"
                  />
                )
              ) : user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-md"
                />
              ) : (
                <img
                  src={"https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-md"
                />
              )}
              {previewImage && typeof previewImage !== "string" && (
                <button
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 text-red-600 hover:text-red-800 transition-all duration-300 disabled:opacity-50"
                >
                  <span className="text-xl font-bold">X</span>
                </button>
              )}
            </div>
            <div className="mt-2">
              {previewImage && typeof previewImage !== "string" ? (
                <button
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="bg-green-500 text-white px-4 py-1 rounded-full shadow-md hover:bg-green-600 transition-all duration-300 disabled:opacity-50"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="bg-white text-blue-600 p-2 rounded-full shadow-md hover:bg-blue-100 transition-all duration-300 disabled:opacity-50 border border-gray-300"
                >
                  {uploading ? <span className="text-xs">{uploadProgress}%</span> : <FaUpload />}
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              id="profile-image-input"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
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
                value={formData.username}
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
                value={formData.email}
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
            <button className="btn btn-save" onClick={handleSubmit} disabled={loading || uploading}>
              <FaCheck /> {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAdmin;
