import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator, // Import ActivityIndicator for loading
} from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { EditModalHeader } from "../common/EditModalHeader";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { useTheme } from "../../contexts/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../services/cloundaryService";
import { updateUserPreference } from "../../services/userPreference";
import { normalize } from "../../utils/common";

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;

export const EditProfileModal = ({ visible, onClose, onSave, userPreference }) => {
  const user = useSelector(userSelector);
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "",
    countryCode: "+84", // Default country code for Vietnam
    weight: user?.weight || "",
    height: user?.height || "",
    weightGoal: user?.weightGoal || "",
    avatarUrl: user?.avatarUrl || "",
    avtChange: false,
  });

  // State to track which fields are currently editable
  const [editableFields, setEditableFields] = useState({
    username: false,
    email: false,
    phoneNumber: false,
    weight: false,
    height: false,
    weightGoal: false,
  });

  // State to track validation errors
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    weight: "",
    height: "",
    weightGoal: "",
  });

  // State to track loading during update
  const [loading, setLoading] = useState(false);

  // Update profile state when user or userPreference changes
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      username: user?.username || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || userPreference?.phoneNumber || "",
      gender: user?.gender || userPreference?.gender || "",
      weight: userPreference?.weight || user?.weight || "",
      height: userPreference?.height || user?.height || "",
      weightGoal: userPreference?.weightGoal || user?.weightGoal || "",
      avatarUrl: user?.avatarUrl || "",
    }));
  }, [user, userPreference]);

  // Toggle edit mode for a specific field
  const toggleEditMode = (fieldName) => {
    setEditableFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Vietnamese phone number
  const validateVietnamesePhone = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate numeric fields
  const validateNumericField = (value, fieldName) => {
    if (isNaN(value) || value <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return "";
  };

  // Handle field change with validation
  const handleFieldChange = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "username":
        if (!value.trim()) {
          error = "Name cannot be empty";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email cannot be empty";
        } else if (!validateEmail(value)) {
          error = "Invalid email format";
        }
        break;
      case "phoneNumber":
        if (!validateVietnamesePhone(value)) {
          error = "Invalid phone number (Vietnam: 10 digits, starting with 0)";
        }
        break;
      case "weight":
        error = validateNumericField(value, "Weight");
        break;
      case "height":
        error = validateNumericField(value, "Height");
        break;
      case "weightGoal":
        error = validateNumericField(value, "Weight Goal");
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    setProfile((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = async () => {
    const hasErrors = Object.values(validationErrors).some((error) => error !== "");
    const hasEmptyRequiredFields = !profile.username || !profile.email;

    if (hasErrors || hasEmptyRequiredFields) {
      Alert.alert("Error", "Please fill in all required fields and fix errors before saving", [
        { text: "OK" },
      ]);
      return;
    }

    setLoading(true); // Set loading to true when starting the update

    try {
      // Upload avatar to Cloudinary if changed
      const avatarUrl = profile?.avtChange
        ? await uploadToCloudinary(profile?.avatarUrl)
        : profile.avatarUrl;

      // Prepare updated user data for onSave
      const updatedUserData = {
        ...user,
        username: profile.username,
        email: profile.email,
        avatarUrl: avatarUrl,
      };

      // Prepare updated userPreference data
      const updatedPreferenceData = {
        ...userPreference,
        _id: userPreference?._id,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender,
        weight: parseFloat(profile.weight) || 0,
        height: parseFloat(profile.height) || 0,
        weightGoal: parseFloat(profile.weightGoal) || 0,
      };

      // Call API to update userPreference
      const preferenceResponse = await updateUserPreference(updatedPreferenceData);

      if (preferenceResponse.status === 200) {
        // If userPreference update is successful, proceed with onSave for user data
        onSave(updatedUserData);
      } else {
        throw new Error("Failed to update user preferences");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to save profile. Please try again later.", [{ text: "OK" }]);
      console.log("Save profile error:", error);
    } finally {
      setLoading(false); // Reset loading state after the operation completes
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need permission to access your photo library to use this feature!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile((prev) => ({
        ...prev,
        avatarUrl: result.assets[0].uri,
        avtChange: true,
      }));
    }
  };

  const renderEditableField = (
    label,
    fieldName,
    placeholder,
    keyboardType = "default",
    editable = true
  ) => {
    return (
      <>
        <Text style={{ ...styles.label, color: theme.greyTextColor }}>{label}</Text>
        <View style={styles.editableFieldContainer}>
          <TextInput
            style={[styles.editableInput, !editableFields[fieldName] && styles.disabledInput]}
            value={String(profile[fieldName])}
            onChangeText={(text) => handleFieldChange(fieldName, text)}
            placeholder={placeholder}
            keyboardType={keyboardType}
            editable={editableFields[fieldName]}
          />
          {editable && (
            <TouchableOpacity
              style={styles.editFieldButton}
              onPress={() => {
                editable && toggleEditMode(fieldName);
              }}
            >
              <Ionicons
                name={editableFields[fieldName] ? "checkmark" : "pencil"}
                size={20}
                color="#40B491"
              />
            </TouchableOpacity>
          )}
        </View>
        {validationErrors[fieldName] ? (
          <Text style={styles.errorText}>{validationErrors[fieldName]}</Text>
        ) : null}
      </>
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <EditModalHeader onCancel={onClose} />
        <View
          style={{
            ...styles.container,
            backgroundColor: theme.editModalbackgroundColor,
          }}
        >
          <Text style={{ ...styles.headerTitle, color: theme.textColor }}>Edit Profile</Text>

          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.profileImagePlaceholder]} />
              )}
              <TouchableOpacity style={styles.editProfileImageButton} onPress={pickImage}>
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.formContainer}>
              {renderEditableField("Full Name", "username", "Enter your full name")}

              {renderEditableField("Email", "email", "Enter your email", "email-address", false)}

              <Text style={{ ...styles.label, color: theme.greyTextColor }}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>{profile.countryCode}</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, !editableFields.phoneNumber && styles.disabledInput]}
                  value={String(profile.phoneNumber)}
                  onChangeText={(text) => handleFieldChange("phoneNumber", text)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  editable={editableFields.phoneNumber}
                />
                <TouchableOpacity
                  style={styles.editPhoneButton}
                  onPress={() => toggleEditMode("phoneNumber")}
                >
                  <Ionicons
                    name={editableFields.phoneNumber ? "checkmark" : "pencil"}
                    size={20}
                    color="#40B491"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.phoneNumber ? (
                <Text style={styles.errorText}>{validationErrors.phoneNumber}</Text>
              ) : null}

              {renderEditableField("Weight (kg)", "weight", "Enter your weight (kg)", "numeric")}

              {renderEditableField("Height (cm)", "height", "Enter your height (cm)", "numeric")}

              {renderEditableField(
                "Weight Goal (kg)",
                "weightGoal",
                "Enter your weight goal (kg)",
                "numeric"
              )}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading} // Disable the button while loading
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 8,
    zIndex: 999,
    bottom: "10%",
  },
  headerTitle: {
    fontSize: normalize(25),
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  scrollContent: {
    flex: 1,
    width: WIDTH,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    fontSize: normalize(14),
    marginBottom: 8,
    color: "#666",
  },
  saveButton: {
    width: WIDTH * 0.92,
    backgroundColor: "#40B491",
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    marginBottom: HEIGHT * 0.05,
  },
  saveButtonDisabled: {
    backgroundColor: "#A0D9C5", // Lighter shade when disabled
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontWeight: "600",
  },
  formContainer: {
    marginBottom: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  countryCodeContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
    marginRight: 8,
    width: 70,
    backgroundColor: "white",
  },
  countryCode: {
    fontSize: normalize(14),
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: normalize(14),
    backgroundColor: "white",
  },
  profileImageContainer: {
    position: "absolute",
    top: -HEIGHT * 0.15,
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImageWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    backgroundColor: "#e0e0e0",
  },
  editProfileImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3592E7",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  editableFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  editableInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: normalize(14),
    backgroundColor: "white",
  },
  disabledInput: {
    backgroundColor: "#f9f9f9",
    color: "#666",
  },
  editFieldButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
  editPhoneButton: {
    padding: 5,
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    fontSize: normalize(12),
    marginBottom: 8,
    marginTop: -4,
  },
});
