import React, { useState } from "react";
import { UploadIcon } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Display preview image immediately
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
        setProfileImageUrl(response.data.secure_url);
        setProfileImage(response.data.public_id);
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

  const navigate = useNavigate();

  const handleSave = async () => {
    // Form validation
    if (!userName || !email || !role) {
      toast.error("Please fill in required fields: Name, Email, and Role");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = {
        userName,
        email,
        phoneNumber,
        gender,
        status: status || "active",
        role,
        profileImage: profileImageUrl,
      };

      // Display what's being sent for debugging
      console.log("Sending user data:", newUser);

      // Using the correct API endpoint
      const response = await axios.post(
        "http://localhost:8080/api/v1/users",
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("User created successfully!");

        // If a temporary password was returned, show it to the admin
        if (response.data?.data?.tempPassword) {
          toast.info(`Temporary password: ${response.data.data.tempPassword}`);
        }

        navigate("/admin/usermanagement"); // Navigate to user list
      }
    } catch (error) {
      console.error("Error creating user:", error);

      // Better error handling with specific messages
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 404) {
          toast.error(
            "API endpoint not found. Please check server configuration."
          );
        } else if (error.response.status === 409) {
          toast.error("User with this email already exists.");
        } else {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Unknown server error";
          toast.error(`Server error: ${errorMessage}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error(
          "No response from server. Please check your connection or server status."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Error creating user: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Add User Content */}
        <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create User</h1>
          </div>

          {/* Add User Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              {/* User Name */}
              <div>
                <label className="block text-gray-700 mb-2">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Gender */}
              <div>
                <label className="block text-gray-700 mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="nutritionist">Nutritionist</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-6">
            <label className="block text-gray-700 mb-2">Profile Image</label>
            <div className="flex flex-col items-center space-y-2">
              {/* Display preview image if available */}
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="w-28 h-28 rounded-full border object-cover"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center bg-gray-200 rounded-full border">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}

              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center justify-center disabled:bg-blue-400"
                onClick={() =>
                  document.getElementById("profile-image-input").click()
                }
                disabled={uploading}
              >
                <UploadIcon className="mr-1" size={18} />
                {uploading ? "Uploading..." : "Import Image"}
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
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition duration-300 disabled:bg-red-300"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
