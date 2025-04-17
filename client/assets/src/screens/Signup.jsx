import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
  PixelRatio,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SafeAreaWrapper from "../components/layout/SafeAreaWrapper";
import RippleButton from "../components/common/RippleButton";
import SplitLine from "../components/common/SplitLine";
import backgroundImage from "../../assets/image/welcome_bg.png";
import googleIcon from "../../assets/image/google_icon.png";
import { ScreensName } from "../constants/ScreensName";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { signup, verifyOtp, requestOtp, resendOtp, verifyAccount } from "../services/authService";
import InputOtpModal from "../components/modal/InputOtpModal";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../redux/actions/userThunk";
import Toast from "react-native-toast-message";
import ShowToast from "../components/common/CustomToast";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { userSelector } from "../redux/selectors/selector";
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function Signup({ navigation }) {
  const [buttonWidth, setButtonWidth] = useState(WIDTH);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    loginError: "",
  });
  const [isOpen, setIsOpen] = useState({ otpModal: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isResend, setIsResend] = useState(false); // Biến để theo dõi OTP có phải từ resend không
  const { signIn, error } = useGoogleAuth();
  const dispatch = useDispatch();
  const user = useSelector(userSelector);

  useEffect(() => {
    if (error) {
      ShowToast("error", `Lỗi đăng nhập: ${error}`, { duration: 5000 });
    }
  }, [error]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onPressGoogleButton = async () => {
    await signIn();
  };

  const validateForm = () => {
    const { email, fullName, password, passwordConfirm } = formData;

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = (password) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password);

    if (!email.trim()) {
      ShowToast("error", "Email is required.", { duration: 5000 });
      return false;
    }
    if (!fullName.trim()) {
      ShowToast("error", "Full name is required.", { duration: 5000 });
      return false;
    }
    if (!password.trim()) {
      ShowToast("error", "Password is required.", { duration: 5000 });
      return false;
    }
    if (!passwordConfirm.trim()) {
      ShowToast("error", "Please confirm your password.", { duration: 5000 });
      return false;
    }
    if (!isValidEmail(email.trim())) {
      ShowToast("error", "Invalid email format.", { duration: 5000 });
      return false;
    }
    if (!isValidPassword(password.trim())) {
      ShowToast(
        "error",
        "Password must be 8+ chars with uppercase, lowercase, and special characters.",
        { duration: 5000 }
      );
      return false;
    }
    if (password.trim() !== passwordConfirm.trim()) {
      ShowToast("error", "Passwords do not match.", { duration: 5000 });
      return false;
    }

    return true;
  };

  const onPressRegisterButton = async () => {
    if (isLoading) return;

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { email } = formData;
      const response = await requestOtp({ email: email.trim() });

      if (response.status === 200) {
        setIsResend(false); // OTP ban đầu, không phải từ resend
        setIsOpen({ ...isOpen, otpModal: true });
        ShowToast("success", "Please check your email for the OTP code.", { duration: 5000 });
      } else {
        ShowToast(
          "error",
          response?.response?.data?.error?.message ||
            "Failed to send OTP. Please ensure your email is correct and try again.",
          { duration: 5000 }
        );
      }
    } catch (error) {
      ShowToast(
        "error",
        "An error occurred while sending OTP. Please ensure your email is correct and try again.",
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { email } = formData;

      // Nếu đây là lần resend đầu tiên, cần gọi signup trước để tạo user
      if (!isResend) {
        const signupResponse = await signup({
          username: formData.fullName.trim(),
          email: email.trim(),
          password: formData.password.trim(),
          passwordConfirm: formData.passwordConfirm.trim(),
        });

        if (signupResponse.status !== 200) {
          ShowToast(
            "error",
            signupResponse?.response?.data?.error?.message ||
              "Failed to register user for OTP resend.",
            { duration: 5000 }
          );
          setIsLoading(false);
          return;
        }
      }

      const response = await resendOtp({ email: email.trim() });

      if (response.status === 200) {
        setIsResend(true); // Đánh dấu OTP là từ resend
        ShowToast("success", "A new OTP has been sent to your email.", { duration: 5000 });
      } else {
        ShowToast(
          "error",
          response?.response?.data?.error?.message || "Failed to resend OTP. Please try again.",
          { duration: 5000 }
        );
      }
    } catch (error) {
      ShowToast("error", "An error occurred while resending OTP.", { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const getTextWidth = (text, fontSize, fontFamily) => {
    const scaledFontSize = fontSize * PixelRatio.getFontScale();
    const extraPadding = 0;
    return text.length * scaledFontSize * 0.6 + extraPadding;
  };

  const calculateMaxButtonWidth = () => {
    const buttonTexts = ["Register", "Continue with Google"];
    const textWidths = buttonTexts.map((text) => getTextWidth(text, 18, "Aleo_700Bold"));
    const maxWidth = Math.min(Math.max(...textWidths), WIDTH * 0.8);
    setButtonWidth(maxWidth);
  };

  useEffect(() => {
    calculateMaxButtonWidth();
  }, []);

  const handleVerifyAccount = async (code) => {
    try {
      const { email, fullName, password, passwordConfirm } = formData;
      const verifyResponse = isResend
        ? await verifyAccount({ email: email.trim(), otp: code }) // OTP từ resend
        : await verifyOtp({ email: email.trim(), otp: code }); // OTP ban đầu

      if (verifyResponse.status === 200) {
        // Nếu OTP từ resend, không cần gọi signup vì đã gọi trong handleResendOtp
        if (!isResend) {
          const signupResponse = await signup({
            username: fullName.trim(),
            email: email.trim(),
            password: password.trim(),
            passwordConfirm: passwordConfirm.trim(),
          });

          if (signupResponse.status !== 200) {
            ShowToast(
              "error",
              signupResponse?.response?.data?.error?.message || "Registration failed.",
              { duration: 5000 }
            );
            setIsOpen({ ...isOpen, otpModal: false });
            return;
          }
        }
        setIsOpen({ ...isOpen, otpModal: false });
        // Hiển thị toast và đợi trước khi chuyển hướng
        ShowToast("success", "Registration successful! Please sign in.", { duration: 5000 });
        // Đợi 2 giây để toast hiển thị trước khi chuyển hướng
        setTimeout(() => {
          navigation.navigate(ScreensName.signin);
        }, 2000);
      } else {
        ShowToast("error", "Invalid OTP. Please try again.", { duration: 5000 });
      }
    } catch (error) {
      ShowToast("error", "An error occurred during verification.", { duration: 5000 });
    }
  };

  return (
    <SafeAreaWrapper headerStyle={{ theme: "light", backgroundColor: "transparent" }}>
      <Image source={backgroundImage} style={styles.backgroundImage} />
      <LinearGradient
        colors={[
          "transparent",
          "rgba(64, 180, 145, 0.1)",
          "rgba(64, 180, 145, 0.2)",
          "rgba(64, 180, 145, 0.4)",
          "rgba(64, 180, 145, 0.7)",
          "rgba(64, 180, 145, 0.9)",
          "rgba(64, 180, 145, 1)",
          "rgba(64, 180, 145, 1)",
          "rgba(64, 180, 145, 1)",
          "rgba(64, 180, 145,1)",
          "rgba(64, 180, 145,1)",
          "rgba(64, 180, 145, 1)",
          "rgba(64, 180, 145, 1)",
          "#40B491",
          "#40B491",
          "#40B491",
        ]}
        style={{
          position: "absolute",
          top: 0,
          bottom: Platform.OS === "ios" ? -35 : 0,
          left: 0,
          right: 0,
        }}
      >
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={Platform.OS === "ios" ? 20 : 40}
          keyboardShouldPersistTaps="handled"
        >
          <ScrollView
            style={styles.view}
            contentContainerStyle={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>Sign Up</Text>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full name *"
                placeholderTextColor="#666"
                value={formData.fullName}
                onChangeText={(text) => handleInputChange("fullName", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#666"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
              />
              <Text style={styles.emailHint}>
                * Important information! Please use a valid email address for verification.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Password *"
                placeholderTextColor="#666"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password *"
                placeholderTextColor="#666"
                secureTextEntry
                value={formData.passwordConfirm}
                onChangeText={(text) => handleInputChange("passwordConfirm", text)}
              />

              <RippleButton
                buttonStyle={{
                  ...styles.socialButtonStyle,
                  backgroundColor: "#191C32",
                  justifyContent: "center",
                }}
                buttonText={isLoading ? "Sending OTP..." : "Sign Up"}
                textStyle={{ ...styles.textStyle, color: "#ffffff" }}
                onPress={onPressRegisterButton}
                disabled={isLoading}
              />
              <SplitLine
                text="or use social sign up"
                textStyle={styles.splitTextStyle}
                lineStyle={styles.splitLineStyle}
              />
              <RippleButton
                buttonStyle={styles.socialButtonStyle}
                leftButtonIcon={
                  <Image
                    source={googleIcon}
                    style={{ width: 20, height: 20, ...styles.iconStyle }}
                  />
                }
                buttonText="Continue with Google"
                textStyle={styles.textStyle}
                contentContainerStyle={{
                  ...styles.buttonContainerStyle,
                  width: buttonWidth,
                }}
                onPress={onPressGoogleButton}
                backgroundColor={"rgba(0, 0, 0, 0.2)"}
              />
              <Text style={styles.alreadyText}>
                Already have account?{" "}
                <Text
                  style={{
                    textDecorationLine: "underline",
                    fontSize: 16,
                    color: "white",
                  }}
                  onPress={() => navigation.navigate(ScreensName.signin)}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <InputOtpModal
          isOpen={isOpen.otpModal}
          otpAmount={4}
          onClose={() => setIsOpen({ ...isOpen, otpModal: false })}
          onVerify={(code) => {
            handleVerifyAccount(code);
          }}
          onResend={handleResendOtp} // Thêm prop để gửi lại OTP
        />
      </LinearGradient>
      <Toast />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    top: -HEIGHT * 0.08,
    width: "100%",
    height: "65%",
    resizeMode: "cover",
    borderRadius: 20,
    transform: [{ translateY: Platform.OS === "ios" ? -15 : -10 }],
  },
  view: {
    flex: 1,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Aleo_700Bold",
    marginBottom: 20,
  },
  formContainer: {
    width: "80%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 60,
    backgroundColor: "rgba(256, 256, 256, 0.1)",
    color: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
  },
  emailHint: {
    width: "100%",
    color: "white",
    fontSize: 14,
    fontFamily: "Aleo_400Regular",
    marginBottom: 15,
    marginTop: -10,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  checkboxText: {
    color: "white",
  },
  socialButtonStyle: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    padding: 18,
    paddingHorizontal: 32,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 4.65,
    elevation: 6,
  },
  textStyle: {
    fontSize: 18,
    fontFamily: "Aleo_700Bold",
    color: "#000",
    marginLeft: 10,
  },
  iconStyle: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
  buttonContainerStyle: {
    width: "80%",
    justifyContent: "flex-start",
  },
  splitLineStyle: {
    width: WIDTH * 0.25,
    marginTop: 12,
  },
  alreadyText: {
    marginHorizontal: 8,
    marginVertical: 24,
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Aleo_400Regular",
  },
});

export default Signup;
