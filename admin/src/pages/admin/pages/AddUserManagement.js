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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Hiển thị ảnh preview ngay lập tức
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload ảnh lên Cloudinary
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
    try {
      const newUser = {
        userName,
        email,
        phoneNumber,
        gender,
        status,
        role,
        profileImage: profileImageUrl,
      };

      const response = await axios.post("http://localhost:8080/api/v1/users", newUser);

      if (response.status === 201) {
        toast.success("User created successfully!");
        navigate("/admin/usermanagement"); // Điều hướng về danh sách user
      }
    } catch (error) {
      toast.error("Failed to create user: " + error.message);
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
          <div className="grid grid-cols-2 gap-6">
            {/* Cột trái */}
            <div className="space-y-4">
              {/* User Name */}
              <div>
                <label className="block text-gray-700 mb-2">User Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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

            {/* Cột phải */}
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
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              {/* Hiển thị ảnh preview nếu có */}
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
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center justify-center"
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
              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
