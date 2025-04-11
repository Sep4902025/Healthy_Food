import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";

import SafeAreaWrapper from "../components/layout/SafeAreaWrapper";
import RippleButton from "../components/common/RippleButton";
import proundCactusIcon from "../../assets/image/pround_cactus.png";
import ShowToast from "../components/common/CustomToast";
import { changePassword } from "../services/authService";
import { ScreensName } from "../constants/ScreensName";
import { useTheme } from "../contexts/ThemeContext";
import { Feather } from "@expo/vector-icons"; // Assuming you're using Expo

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function ChangePassword({ navigation, route }) {
  const email = route.params?.email;
  const { theme } = useTheme();

  const [presentPassword, setPresentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPresentPassword, setShowPresentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    presentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 8) strength++;
    if (hasLowerCase) strength++;
    if (hasUpperCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChars) strength++;

    if (password && strength < 3) {
      return {
        isStrong: false,
        message:
          "Password is too weak. Include uppercase, lowercase, numbers, and special characters.",
      };
    }

    return { isStrong: true, message: "" };
  };

  // Validate form on input change
  useEffect(() => {
    validateForm();
  }, [presentPassword, newPassword, confirmPassword]);

  const validateForm = () => {
    const newErrors = {
      presentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    // Validate present password
    if (!presentPassword.trim()) {
      newErrors.presentPassword = "Current password is required";
      isValid = false;
    }

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else {
      const passwordStrength = checkPasswordStrength(newPassword);
      if (!passwordStrength.isStrong) {
        newErrors.newPassword = passwordStrength.message;
        isValid = false;
      }
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      ShowToast("error", "Complete form to change password");
      return;
    }

    const response = await changePassword({
      currentPassword: presentPassword,
      newPassword: newPassword,
      newPasswordConfirm: confirmPassword,
    });

    if (response.status === 200) {
      ShowToast("success", "Password changed successfully");
      console.log("Password reset:", newPassword);
      navigation.navigate(ScreensName.signin);
    } else {
      ShowToast("error", response.message || "Failed to change password");
    }
  };

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        style={{
          ...styles.container,
          backgroundColor: theme.editModalbackgroundColor,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={{ ...styles.title, color: theme.textColor }}>
            Change Password
          </Text>
          <Text style={{ ...styles.subtitle, color: theme.greyTextColor }}>
            Enter a different password from{"\n"}your previous one
          </Text>

          <View style={styles.inputContainer}>
            <Text style={{ ...styles.label, color: theme.greyTextColor }}>
              Current Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                errors.presentPassword ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#666"
                value={presentPassword}
                onChangeText={setPresentPassword}
                secureTextEntry={!showPresentPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPresentPassword(!showPresentPassword)}
              >
                <Feather
                  name={showPresentPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.presentPassword ? (
              <Text style={styles.errorText}>{errors.presentPassword}</Text>
            ) : null}

            <Text style={{ ...styles.label, color: theme.greyTextColor }}>
              New Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                errors.newPassword ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#666"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Feather
                  name={showNewPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            <Text style={{ ...styles.label, color: theme.greyTextColor }}>
              Confirm Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                errors.confirmPassword ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <View style={styles.illustrationContainer}>
            <Image source={proundCactusIcon} style={styles.cactusIcon} />
            <View style={styles.decorations}>
              <View style={[styles.star, styles.starOrange]} />
              <View style={[styles.star, styles.starYellow]} />
              <View style={[styles.dot]} />
            </View>
          </View>

          <RippleButton
            buttonStyle={{ ...styles.submitButton }}
            buttonText="Change Password"
            textStyle={styles.buttonText}
            onPress={handleResetPassword}
            disabled={!isFormValid}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: WIDTH * 0.075,
    paddingVertical: 30,
  },
  card: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Aleo_700Bold",
    color: "#191C32",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
    alignSelf: "flex-start",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
    color: "#666",
    marginBottom: 8,
  },
  inputWrapper: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 5,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
  },
  eyeIcon: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontFamily: "Aleo_400Regular",
    marginBottom: 15,
  },
  illustrationContainer: {
    position: "relative",
    width: "100%",
    height: HEIGHT * 0.25,
    marginBottom: 20,
  },
  cactusIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  decorations: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  star: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 4,
    transform: [{ rotate: "45deg" }],
  },
  starOrange: {
    backgroundColor: "#FF8A65",
    right: "20%",
    top: "10%",
  },
  starYellow: {
    backgroundColor: "#FFD54F",
    right: "35%",
    top: "15%",
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    right: "25%",
    top: "25%",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#32B768",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Aleo_700Bold",
    textAlign: "center",
  },
});

export default ChangePassword;
