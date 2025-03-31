import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaUser,
  FaEdit,
  FaUpload,
  FaWeight,
  FaRuler,
  FaCalculator,
  FaKey,
} from "react-icons/fa";
import quizService from "../../../../services/quizService";
import { selectUser } from "../../../../store/selectors/authSelectors";
import axios from "axios";
import UserProfileUpdate from "../../UpdateUser";

import AuthService from "../../../../services/auth.service";
import uploadFile from "../../../../helpers/uploadFile";
import { updateUser } from "../../../../store/actions/authActions";

const UserProfile = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [passwordResetInProgress, setPasswordResetInProgress] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0); // Upload progress
  const [uploading, setUploading] = useState(false); // Upload status
  const fileInputRef = useRef(null); // Ref for hidden file input

  const fetchUserData = async () => {
    if (!user || !user._id) {
      console.error("🚨 User or user._id does not exist:", user);
      setLoading(false);
      return;
    }
    if (!user.userPreferenceId) {
      console.warn("🚨 userPreferenceId does not exist in user:", user);
      setUserData(null);
      setLoading(false);
      return;
    }
    try {
      const { success, data, message } =
        await quizService.getUserPreferenceByUserPreferenceId(
          user.userPreferenceId
        );
      if (success) {
        setUserData(data);
      } else {
        console.error("🚨 Error fetching userPreference data:", message);
        setUserData(null);
      }
    } catch (error) {
      console.error("🚨 Error in fetchUserData:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleReset = async () => {
    if (!user || !user.userPreferenceId) {
      alert("No userPreferenceId found to delete!");
      return;
    }
    const confirmReset = window.confirm(
      "Are you sure you want to delete all personal information? This action cannot be undone."
    );
    if (!confirmReset) return;
    try {
      setResetInProgress(true);
      const { success, message } = await quizService.deleteUserPreference(
        user.userPreferenceId
      );
      if (success) {
        alert("Information deleted successfully");
        setUserData(null);
        fetchUserData();
      } else {
        alert(`Error deleting: ${message}`);
      }
    } catch (error) {
      alert("An error occurred while deleting data");
      console.error("🚨 Reset error:", error);
    } finally {
      setResetInProgress(false);
    }
  };

  const handleResetPassword = async () => {
    if (
      !passwordData.email ||
      !passwordData.password ||
      !passwordData.passwordConfirm
    ) {
      alert("Please fill in all information!");
      return;
    }
    if (passwordData.password !== passwordData.passwordConfirm) {
      alert("Confirmation password does not match!");
      return;
    }
    try {
      setPasswordResetInProgress(true);
      const result = await AuthService.resetPassword(
        passwordData.email,
        passwordData.password,
        passwordData.passwordConfirm
      );
      if (result.success) {
        alert("Password changed successfully!");
        setShowPasswordReset(false);
        setPasswordData({ email: "", password: "", passwordConfirm: "" });
      } else {
        alert(`Error: ${result.message || "Unable to change password"}`);
      }
    } catch (error) {
      alert("An error occurred while changing the password!");
      console.error("🚨 Password reset error:", error);
    } finally {
      setPasswordResetInProgress(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !user._id) {
      alert("No user information found to delete!");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this account? This action cannot be undone, and you will be logged out!"
    );
    if (!confirmDelete) return;
    try {
      setDeleteInProgress(true);
      const { success, message } = await quizService.deleteUserByUserId(
        user._id
      );
      if (success) {
        alert("Account deleted successfully!");
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        alert(`Error deleting account: ${message}`);
      }
    } catch (error) {
      alert("An error occurred while deleting the account!");
      console.error("🚨 Delete user error:", error);
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleUpdateProfile = (updatedData) => {
    setUserData((prev) => ({ ...prev, ...updatedData }));
  };
  const dispatch = useDispatch();
  // Handle avatar upload using quizService.updateUserById
  const handleUploadAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(
        file,
        (percent) => setUploadProgress(percent),
        (cancel) => console.log("Upload canceled")
      );
      const avatarUrl = result.secure_url;

      const updateResult = await quizService.updateUserById(user._id, {
        avatarUrl,
      });
      if (updateResult.success) {
        setUserData((prev) => ({ ...prev, avatarUrl }));
        // Update user in Redux
        dispatch(updateUser({ ...user, avatarUrl }));
        alert("Avatar updated successfully!");
      } else {
        throw new Error(updateResult.message || "Unable to update avatar");
      }
    } catch (error) {
      console.error("🚨 Error uploading avatar:", error);
      alert("An error occurred while uploading the avatar: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUploadAvatar(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click(); // Trigger hidden file input
  };

  const calculateBMI = () => {
    if (userData) {
      const weight = parseFloat(userData.weight);
      const heightCm = parseFloat(userData.height);
      if (!weight || !heightCm || weight <= 0 || heightCm <= 0)
        return "No data";
      const heightM = heightCm / 100;
      return (weight / (heightM * heightM)).toFixed(2);
    }
    return "No data";
  };

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi))
      return {
        text: "No data",
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
    if (bmi < 18)
      return { text: "Underweight", color: "text-blue-600", bg: "bg-blue-100" };
    if (bmi < 30)
      return { text: "Normal", color: "text-green-600", bg: "bg-green-100" };
    if (bmi < 40)
      return {
        text: "Overweight",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { text: "Obese", color: "text-red-600", bg: "bg-red-100" };
  };

  const InfoItem = ({
    label,
    value,
    icon,
    colorClass = "bg-gray-50",
    textClass = "text-gray-700",
  }) => (
    <div
      className={`${colorClass} p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2 text-gray-600">{icon}</span>}
        <p className="font-medium text-gray-600">{label}</p>
      </div>
      <p className={`text-lg font-semibold ${textClass}`}>{value || "N/A"}</p>
    </div>
  );

  const SectionTitle = ({ title, icon }) => (
    <div className="flex items-center space-x-2 mb-6 border-b border-gray-200 pb-2">
      {icon}
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-gray-700">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-1/4 w-full">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
            <div className="space-y-4">
              <button
                onClick={handleEditClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
              >
                <FaEdit /> Edit Profile
              </button>
              <button
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md"
              >
                <FaKey /> Change Password
              </button>
              <button
                onClick={handleReset}
                disabled={resetInProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md disabled:bg-red-300"
              >
                {resetInProgress ? "Deleting..." : "Delete Personal Data"}
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteInProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 shadow-md disabled:bg-red-400"
              >
                {deleteInProgress ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4 w-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {userData?.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-lg">
                      {user.username ? user.username[0].toUpperCase() : "?"}
                    </div>
                  )}
                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2 rounded-full shadow-md hover:bg-indigo-100 transition-all duration-300 disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="text-xs">{uploadProgress}%</span>
                    ) : (
                      <FaUpload />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {userData?.name || user.username || "User"}
                  </h1>
                  <p className="text-indigo-100 mt-1">
                    {userData?.email || user.email || "No email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Body Measurements */}
              <SectionTitle
                title="Body Measurements"
                icon={<FaCalculator className="text-indigo-600" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <FaWeight className="text-blue-500 text-2xl" />
                  <div>
                    <p className="text-gray-600">Weight</p>
                    <p className="text-xl font-semibold text-blue-700">
                      {userData?.weight || "?"}{" "}
                      <span className="text-sm">kg</span>
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <FaRuler className="text-green-500 text-2xl" />
                  <div>
                    <p className="text-gray-600">Height</p>
                    <p className="text-xl font-semibold text-green-700">
                      {userData?.height || "?"}{" "}
                      <span className="text-sm">cm</span>
                    </p>
                  </div>
                </div>
                <div
                  className={`${
                    getBMIStatus().bg
                  } p-4 rounded-lg shadow-sm flex items-center gap-3`}
                >
                  <FaCalculator className="text-gray-600 text-2xl" />
                  <div>
                    <p className="text-gray-600">BMI</p>
                    <p
                      className={`text-xl font-semibold ${
                        getBMIStatus().color
                      }`}
                    >
                      {calculateBMI()} - {getBMIStatus().text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              {userData ? (
                <>
                  <SectionTitle
                    title="Personal Information"
                    icon={<FaUser className="text-indigo-600" />}
                  />
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoItem
                          label="Age"
                          value={userData.age}
                          colorClass="bg-blue-50"
                          textClass="text-blue-700"
                        />
                        <InfoItem
                          label="Gender"
                          value={userData.gender}
                          colorClass="bg-purple-50"
                          textClass="text-purple-700"
                        />
                        <InfoItem
                          label="Phone Number"
                          value={userData.phoneNumber}
                          colorClass="bg-indigo-50"
                          textClass="text-indigo-700"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Nutrition Goals
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem
                          label="Goal"
                          value={userData.goal}
                          colorClass="bg-green-50"
                          textClass="text-green-700"
                        />
                        <InfoItem
                          label="Plan Duration"
                          value={userData.longOfPlan}
                          colorClass="bg-teal-50"
                          textClass="text-teal-700"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Eating Preferences
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem
                          label="Diet"
                          value={userData.diet}
                          colorClass="bg-amber-50"
                          textClass="text-amber-700"
                        />
                        <InfoItem
                          label="Eating Habits"
                          value={userData.eatHabit?.join(", ")}
                          colorClass="bg-orange-50"
                          textClass="text-orange-700"
                        />
                        <InfoItem
                          label="Favorite Foods"
                          value={userData.favorite?.join(", ")}
                          colorClass="bg-yellow-50"
                          textClass="text-yellow-700"
                        />
                        <InfoItem
                          label="Food Allergies"
                          value={userData.hate?.join(", ")}
                          colorClass="bg-red-50"
                          textClass="text-red-700"
                        />
                        <InfoItem
                          label="Meals per Day"
                          value={userData.mealNumber}
                          colorClass="bg-amber-50"
                          textClass="text-amber-700"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Health Metrics
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InfoItem
                          label="Sleep Duration"
                          value={userData.sleepTime}
                          colorClass="bg-purple-50"
                          textClass="text-purple-700"
                        />
                        <InfoItem
                          label="Water Intake (L)"
                          value={userData.waterDrink}
                          colorClass="bg-blue-50"
                          textClass="text-blue-700"
                        />
                        <InfoItem
                          label="Medical Conditions"
                          value={userData.underDisease || "None"}
                          colorClass="bg-pink-50"
                          textClass="text-pink-700"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    No personal data available
                  </p>
                  <button
                    onClick={handleEditClick}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
                  >
                    Enter Information Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={passwordData.email}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordData.passwordConfirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      passwordConfirm: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm password"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordReset(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={passwordResetInProgress}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-300"
                >
                  {passwordResetInProgress ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <UserProfileUpdate
          userPreferenceId={user.userPreferenceId}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default UserProfile;
