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
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import quizService from "../../../../services/quizService";
import { selectUser } from "../../../../store/selectors/authSelectors";
import axios from "axios";
import UserProfileUpdate from "../../UpdateUser";
import AuthService from "../../../../services/auth.service";

import uploadFile from "../../../../helpers/uploadFile";
import { updateUser } from "../../../../store/actions/authActions";
import { toast } from "react-toastify";
import { getFavoriteNamesByIds } from "../../../survey/Favorite";
import { getHateNamesByIds } from "../../../survey/Hate";
import medicalConditionService from "../../../../services/nutritionist/medicalConditionServices";
import { loginSuccess } from "../../../../store/slices/authSlice";
import UserService from "../../../../services/user.service";

const UserProfile = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [passwordChangeInProgress, setPasswordChangeInProgress] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]); // Updated to 4-digit OTP
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [medicalConditionNames, setMedicalConditionNames] = useState([]);

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
      const { success, data, message } = await quizService.getUserPreferenceByUserPreferenceId(
        user.userPreferenceId
      );
      if (success) {
        setUserData(data);
        if (data.underDisease && Array.isArray(data.underDisease)) {
          const names = await Promise.all(
            data.underDisease.map(async (id) => {
              const result = await medicalConditionService.getMedicalConditionById(id);
              return result.success ? result.data.name : "Unknown";
            })
          );
          setMedicalConditionNames(names);
        } else {
          setMedicalConditionNames(["None"]);
        }
      } else {
        console.error("🚨 Error fetching userPreference data:", message);
        setUserData(null);
        setMedicalConditionNames(["None"]);
      }
    } catch (error) {
      console.error("🚨 Error in fetchUserData:", error);
      setUserData(null);
      setMedicalConditionNames(["None"]);
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

  useEffect(() => {
    if (showOtpModal && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showOtpModal]);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleReSurvey = () => {
    setShowEditModal(true);
    navigate("/survey/name");
  };

  const handleReset = async () => {
    if (!user || !user.userPreferenceId) {
      toast.error("No userPreferenceId found to delete!");
      return;
    }
    try {
      setResetInProgress(true);
      const { success, message } = await quizService.deleteUserPreference(user.userPreferenceId);
      if (success) {
        toast.success("Information deleted successfully");
        setUserData(null);
        setMedicalConditionNames(["None"]);
        const updatedUser = { ...user, userPreferenceId: null };
        dispatch(
          loginSuccess({
            user: updatedUser,
            token: localStorage.getItem("token"),
          })
        );
        console.log("✅ Updated user in Redux after reset:", updatedUser);
        fetchUserData();
      } else {
        toast.error(`Error deleting: ${message}`);
      }
    } catch (error) {
      toast.error("An error occurred while deleting data");
      console.error("🚨 Reset error:", error);
    } finally {
      setResetInProgress(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.newPasswordConfirm
    ) {
      toast.error("Please fill in all fields!");
      return;
    }
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error("New password and confirmation do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long!");
      return;
    }
    try {
      setPasswordChangeInProgress(true);
      const result = await AuthService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        newPasswordConfirm: passwordData.newPasswordConfirm,
      });
      if (result.success) {
        toast.success("Password changed successfully! Please log in again.");
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          newPasswordConfirm: "",
        });
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/signin");
      } else {
        toast.error(`Error: ${result.message || "Unable to change password"}`);
      }
    } catch (error) {
      toast.error("An error occurred while changing the password!", error);
    } finally {
      setPasswordChangeInProgress(false);
    }
  };

  const handleRequestDeleteAccount = async () => {
    if (!deleteEmail) {
      toast.error("Email is required!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(deleteEmail)) {
      toast.error("Invalid email format!");
      return;
    }
    try {
      setDeleteInProgress(true);
      const result = await UserService.requestDeleteAccount(deleteEmail);
      if (result.success) {
        toast.success(result.message);
        sessionStorage.setItem("deleteEmail", deleteEmail);
        setShowDeleteAccount(false);
        setShowOtpModal(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while requesting account deletion!");
      console.error("🚨 Request delete account error:", error);
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    const email = sessionStorage.getItem("deleteEmail");
    if (!email) {
      toast.error("Missing email data. Please request OTP again.");
      setOtpError("Missing email data. Please request OTP again.");
      return;
    }
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      // Updated to check for 4-digit OTP
      toast.error("Please enter a valid 4-digit OTP!");
      setOtpError("Please enter a valid 4-digit OTP!");
      return;
    }
    try {
      setDeleteInProgress(true);
      const result = await UserService.confirmDeleteAccount(email, otpValue);
      if (result.success) {
        toast.success(result.message);
        sessionStorage.removeItem("deleteEmail");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/signin");
      } else {
        toast.error(result.message);
        setOtpError(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the account!");
      setOtpError("An error occurred while deleting the account!");
      console.error("🚨 Confirm delete account error:", error);
    } finally {
      setDeleteInProgress(false);
      setShowOtpModal(false);
      setOtp(["", "", "", ""]); // Reset to 4-digit OTP
      setOtpError("");
    }
  };

  const handleResendOTP = async () => {
    const email = sessionStorage.getItem("deleteEmail");
    if (!email) {
      toast.error("Missing email data. Please request OTP again.");
      setOtpError("Missing email data. Please request OTP again.");
      return;
    }
    try {
      const result = await UserService.requestDeleteAccount(email);
      if (result.success) {
        toast.success("A new OTP has been sent to your email.");
        setOtpError("");
      } else {
        toast.error(result.message);
        setOtpError(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while resending OTP!");
      setOtpError("An error occurred while resending OTP!");
      console.error("🚨 Resend OTP error:", error);
    }
  };

  const handleOtpChange = (index, event) => {
    const { value } = event.target;
    const newOtp = [...otp];

    if (/^[0-9]?$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError("");

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text").trim();

    if (/^\d{4}$/.test(pasteData)) {
      // Updated to check for 4-digit OTP
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      setOtpError("");
      inputRefs.current[3].focus(); // Focus on last input
    } else {
      setOtpError("Invalid OTP format. Please paste a 4-digit number.");
    }
  };

  const handleUpdateProfile = (updatedData) => {
    setUserData((prev) => ({ ...prev, ...updatedData }));
    if (updatedData.underDisease) {
      if (updatedData.underDisease && Array.isArray(updatedData.underDisease)) {
        Promise.all(
          updatedData.underDisease.map(async (id) => {
            const result = await medicalConditionService.getMedicalConditionById(id);
            return result.success ? result.data.name : "Unknown";
          })
        ).then((names) => setMedicalConditionNames(names));
      } else {
        setMedicalConditionNames(["None"]);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage({ file, url: imageUrl });
    }
  };

  const handleUploadAvatar = async () => {
    if (!previewImage?.file) {
      toast.error("No image selected to upload!");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadFile(
        previewImage.file,
        (percent) => setUploadProgress(percent),
        (cancel) => console.log("Upload canceled")
      );
      const avatarUrl = result.secure_url;
      const userId = typeof user._id === "object" && user._id.$oid ? user._id.$oid : user._id;
      const userData = { _id: userId, avatarUrl };
      const updatedUser = await dispatch(updateUser(userData));
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }
      setUserData((prev) => ({ ...prev, ...updatedUser }));
    } catch (error) {
      console.error("🚨 Error uploading avatar:", error);
      toast.error(`An error occurred while uploading the avatar: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleCancelPreview = () => {
    setPreviewImage(null);
    fileInputRef.current.value = null;
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const calculateBMI = () => {
    if (userData) {
      const weight = parseFloat(userData.weight);
      const heightCm = parseFloat(userData.height);
      if (!weight || !heightCm || weight <= 0 || heightCm <= 0) return "No data";
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
    if (bmi < 18) return { text: "Underweight", color: "text-blue-600", bg: "bg-blue-100" };
    if (bmi < 30) return { text: "Normal", color: "text-green-600", bg: "bg-green-100" };
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
                onClick={() => setShowChangePassword(!showChangePassword)}
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
                onClick={() => setShowDeleteAccount(true)}
                disabled={deleteInProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 shadow-md disabled:bg-red-400"
              >
                {deleteInProgress ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:w-3/4 w-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {previewImage ? (
                    <img
                      src={previewImage.url}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-lg">
                      {user.username ? user.username[0].toUpperCase() : "?"}
                    </div>
                  )}
                  {previewImage && (
                    <button
                      onClick={handleCancelPreview}
                      disabled={uploading}
                      className="absolute top-0 right-[5px] text-red-600 hover:text-red-800 transition-all duration-300 disabled:opacity-50"
                    >
                      <span className="text-lg font-bold">X</span>
                    </button>
                  )}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    {previewImage ? (
                      <button
                        onClick={handleUploadAvatar}
                        disabled={uploading}
                        className="bg-green-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-green-600 transition-all duration-300 disabled:opacity-50"
                      >
                        <span className="text-xs">Save</span>
                      </button>
                    ) : (
                      <button
                        onClick={triggerFileInput}
                        disabled={uploading}
                        className="bg-white text-indigo-600 p-2 rounded-full shadow-md hover:bg-indigo-100 transition-all duration-300 disabled:opacity-50"
                      >
                        {uploading ? (
                          <span className="text-xs">{uploadProgress}%</span>
                        ) : (
                          <FaUpload />
                        )}
                      </button>
                    )}
                  </div>
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

            <div className="p-6">
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
                      {userData?.weight || "?"} <span className="text-sm">kg</span>
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <FaRuler className="text-green-500 text-2xl" />
                  <div>
                    <p className="text-gray-600">Height</p>
                    <p className="text-xl font-semibold text-green-700">
                      {userData?.height || "?"} <span className="text-sm">cm</span>
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
                    <p className={`text-xl font-semibold ${getBMIStatus().color}`}>
                      {calculateBMI()} - {getBMIStatus().text}
                    </p>
                  </div>
                </div>
              </div>

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
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Nutrition Goals</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <InfoItem
                          label="Weight Goal"
                          value={userData.weightGoal}
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
                          value={getFavoriteNamesByIds(userData.favorite)?.join(", ")}
                          colorClass="bg-yellow-50"
                          textClass="text-yellow-700"
                        />
                        <InfoItem
                          label="Food Allergies"
                          value={getHateNamesByIds(userData.hate)?.join(", ")}
                          colorClass="bg-red-50"
                          textClass="text-red-700"
                        />
                        <InfoItem
                          label="Meals per Day"
                          value={userData.mealNumber}
                          colorClass="bg-amber-50"
                          textClass="text-amber-700"
                        />
                        <InfoItem
                          label="Activity Level"
                          value={userData.activityLevel}
                          colorClass="bg-amber-50"
                          textClass="text-amber-700"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Health Metrics</h4>
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
                          value={medicalConditionNames.join(", ") || "None"}
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
                  <p className="text-gray-600 mb-4">No personal data available</p>
                  <button
                    onClick={handleReSurvey}
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

      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-indigo-500 mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.newPasswordConfirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPasswordConfirm: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordChangeInProgress}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-300"
                >
                  {passwordChangeInProgress ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Delete Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDeleteAccount}
                  disabled={deleteInProgress}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-red-300"
                >
                  {deleteInProgress ? "Processing..." : "Request OTP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify OTP</h2>
            <p className="text-gray-600 mb-6">Please enter the 4-digit OTP sent to your email</p>
            <div className="flex justify-center space-x-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  className="w-10 h-10 border border-gray-300 rounded text-center text-lg"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>
            {otpError && <p className="text-red-500 text-sm mb-4">{otpError}</p>}
            <div className="space-y-4">
              <button
                onClick={handleConfirmDeleteAccount}
                disabled={deleteInProgress}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-300"
              >
                {deleteInProgress ? "Verifying..." : "Verify OTP"}
              </button>
              <p className="text-gray-600 text-center">
                Didn’t receive OTP?{" "}
                <span
                  onClick={handleResendOTP}
                  className="text-indigo-600 cursor-pointer hover:underline"
                >
                  Resend
                </span>
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp(["", "", "", ""]);
                  setOtpError("");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
