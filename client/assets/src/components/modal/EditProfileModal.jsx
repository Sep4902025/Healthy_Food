import React, { useState } from "react";
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
} from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { EditModalHeader } from "../common/EditModalHeader";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { useTheme } from "../../contexts/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../services/cloundaryService";

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;
export const EditProfileModal = ({ visible, onClose, onSave }) => {
  const user = useSelector(userSelector);
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "",
    countryCode: "+84", // Default country code for Vietnam
    weight: user?.weight || "",
    height: user?.height || "",
    weightGoal: user?.weightGoal || "",
    avtChange: false,
    ...user,
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

  // Toggle edit mode for a specific field
  const toggleEditMode = (fieldName) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Vietnamese phone number
  const validateVietnamesePhone = (phone) => {
    // Vietnam phone number format: 10 digits, starting with 0
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate numeric fields
  const validateNumericField = (value, fieldName) => {
    if (isNaN(value) || value <= 0) {
      return `${fieldName} phải là số dương`;
    }
    return "";
  };

  // Handle field change with validation
  const handleFieldChange = (fieldName, value) => {
    let error = "";
    
    // Validate based on field type
    switch (fieldName) {
      case "username":
        if (!value.trim()) {
          error = "Tên không được để trống";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email không được để trống";
        } else if (!validateEmail(value)) {
          error = "Định dạng email không hợp lệ";
        }
        break;
      case "phoneNumber":
        if (!validateVietnamesePhone(value)) {
          error = "Số điện thoại không hợp lệ (Việt Nam: 10 số, bắt đầu bằng số 0)";
        }
        break;
      case "weight":
        error = validateNumericField(value, "Cân nặng");
        break;
      case "height":
        error = validateNumericField(value, "Chiều cao");
        break;
      case "weightGoal":
        error = validateNumericField(value, "Mục tiêu cân nặng");
        break;
      default:
        break;
    }
    
    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    // Update profile state
    setProfile(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = async () => {
    // Check for validation errors before saving
    const hasErrors = Object.values(validationErrors).some(error => error !== "");
    const hasEmptyRequiredFields = !profile.username || !profile.email;
    
    if (hasErrors || hasEmptyRequiredFields) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ thông tin và sửa các lỗi trước khi lưu",
        [{ text: "OK" }]
      );
      return;
    }
    
    const response = profile?.avtChange
      ? await uploadToCloudinary(profile?.avatarUrl)
      : profile.avatarUrl;
    onSave({ ...profile, avatarUrl: response });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh để thực hiện tính năng này!");
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile((pre) => ({
        ...pre,
        avatarUrl: result.assets[0].uri,
        avtChange: true,
      }));
    }
  };

  // Renders input field with edit button
  const renderEditableField = (label, fieldName, placeholder, keyboardType = "default") => {
    return (
      <>
        <Text style={{ ...styles.label, color: theme.greyTextColor }}>
          {label}
        </Text>
        <View style={styles.editableFieldContainer}>
          <TextInput
            style={[
              styles.editableInput,
              !editableFields[fieldName] && styles.disabledInput
            ]}
            value={profile[fieldName]}
            onChangeText={(text) => handleFieldChange(fieldName, text)}
            placeholder={placeholder}
            keyboardType={keyboardType}
            editable={editableFields[fieldName]}
          />
          <TouchableOpacity 
            style={styles.editFieldButton}
            onPress={() => toggleEditMode(fieldName)}
          >
            <Ionicons 
              name={editableFields[fieldName] ? "checkmark" : "pencil"} 
              size={20} 
              color="#40B491" 
            />
          </TouchableOpacity>
        </View>
        {validationErrors[fieldName] ? (
          <Text style={styles.errorText}>{validationErrors[fieldName]}</Text>
        ) : null}
      </>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <EditModalHeader onCancel={onClose} />
        <View
          style={{
            ...styles.container,
            backgroundColor: theme.editModalbackgroundColor,
          }}
        >
          <Text style={{ ...styles.headerTitle, color: theme.textColor }}>
            Edit Profile
          </Text>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[styles.profileImage, styles.profileImagePlaceholder]}
                />
              )}
              <TouchableOpacity
                style={styles.editProfileImageButton}
                onPress={pickImage}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.formContainer}>
              {renderEditableField("Họ và tên", "username", "Nhập họ và tên")}
              
              {renderEditableField("Email", "email", "Nhập địa chỉ email", "email-address")}

              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Số điện thoại
              </Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>{profile.countryCode}</Text>
                </View>
                <TextInput
                  style={[
                    styles.phoneInput,
                    !editableFields.phoneNumber && styles.disabledInput
                  ]}
                  value={profile.phoneNumber}
                  onChangeText={(text) => handleFieldChange("phoneNumber", text)}
                  placeholder="Nhập số điện thoại"
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

              {renderEditableField("Cân nặng (kg)", "weight", "Nhập cân nặng (kg)", "numeric")}
              
              {renderEditableField("Chiều cao (cm)", "height", "Nhập chiều cao (cm)", "numeric")}
              
              {renderEditableField("Mục tiêu cân nặng (kg)", "weightGoal", "Nhập mục tiêu cân nặng (kg)", "numeric")}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lưu</Text>
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
    fontSize: 25,
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
    fontSize: 14,
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
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    marginBottom: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 8, // Reduced to account for possible error text
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
    fontSize: 14,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
});