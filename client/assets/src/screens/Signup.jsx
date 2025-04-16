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
  Alert,
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

import { signup, verifyOtp } from "../services/authService";

import InputOtpModal from "../components/modal/InputOtpModal";

import { useDispatch, useSelector } from "react-redux";

import { loginThunk } from "../redux/actions/userThunk";

import Toast from "react-native-toast-message";
import ShowToast from "../components/common/CustomToast";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { userSelector } from "../redux/selectors/selector";
import Checkbox from "expo-checkbox";

const WIDTH = Dimensions.get("window").width;

const HEIGHT = Dimensions.get("window").height;

function Signup({ navigation }) {
  const [buttonWidth, setButtonWidth] = useState(WIDTH);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    termAgree: false,
    loginError: "",
  });

  const [isOpen, setIsOpen] = useState({ otpModal: false });

  const { signIn, userInfo, error } = useGoogleAuth();

  const dispatch = useDispatch();
  const user = useSelector(userSelector);

  useEffect(() => {
    if (error) {
      ShowToast("error", `Lỗi đăng nhập: ${error}`);
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

  const onPressRegisterButton = async () => {
    const { email, fullName, password, phoneNumber, termAgree } = formData;

    // Email validation
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email.trim()) {
      return ShowToast("error", "Email is required.");
    }
    if (!isValidEmail(email.trim())) {
      return ShowToast("error", "Please enter a valid email address.");
    }

    // Full name validation
    if (!fullName.trim()) {
      return ShowToast("error", "Full name is required.");
    }

    // Password validation - updated with stronger requirements
    const isValidPassword = (password) =>
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(
        password
      );

    if (!password.trim()) {
      return ShowToast("error", "Password is required.");
    }
    if (!isValidPassword(password.trim())) {
      return ShowToast(
        "error",
        "Password is too weak. Must be at least 8 characters with upper, lower, number & special char."
      );
    }

    // Phone number validation
    if (!phoneNumber.trim()) {
      return ShowToast("error", "Phone number is required.");
    }

    // Terms agreement validation
    if (!termAgree) {
      setFormData((prev) => ({ ...prev, loginError: "termAgreeError" }));
      return ShowToast("error", "Agree with our term to regis.");
    }

    try {
      const response = await signup({
        username: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
        passwordConfirm: password.trim(),
      });

      if (response.status === 200) {
        // navigation.navigate(ScreensName.signin);
        const credentials = {
          email,
          password,
        };
        const responseLogin = await dispatch(loginThunk(credentials));
        if (responseLogin.type.endsWith("fulfilled")) {
          setIsOpen({ ...isOpen, otpModal: true });
          ShowToast(
            "success",
            "Register successfully! Please check your email to verify your account."
          );
        } else {
          ShowToast("error", "Login failed after registration.");
        }
      } else {
        ShowToast(
          "error",
          response?.response?.data?.message || "Registration failed."
        );
      }
    } catch (error) {
      ShowToast("error", "An error occurred during registration.");
    }
  };

  const getTextWidth = (text, fontSize, fontFamily) => {
    const scaledFontSize = fontSize * PixelRatio.getFontScale();

    const extraPadding = 0;

    return text.length * scaledFontSize * 0.6 + extraPadding;
  };

  const calculateMaxButtonWidth = () => {
    const buttonTexts = ["Register", "Continue with Google"];

    const textWidths = buttonTexts.map((text) =>
      getTextWidth(text, 18, "Aleo_700Bold")
    );

    const maxWidth = Math.min(Math.max(...textWidths), WIDTH * 0.8);

    setButtonWidth(maxWidth);
  };

  useEffect(() => {
    calculateMaxButtonWidth();
  }, []);

  const handleVerifyAccount = async (code) => {
    const response = await verifyOtp({ email: formData?.email, otp: code });

    if (response.status === 200) {
      ShowToast("success", "Verify account successfully.");
      setIsOpen({ ...isOpen, otpModal: false });
      navigation.navigate(ScreensName.home);
    } else {
      ShowToast("error", "Verify account fail. Please try again.");

      console.log("error");
    }
  };

  return (
    <SafeAreaWrapper
      headerStyle={{ theme: "light", backgroundColor: "transparent" }}
    >
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
            <Text style={styles.title}>REGISTER</Text>

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
              <View style={styles.checkbox}>
                <Text
                  style={{
                    color: "white",
                    textAlign: "left",
                    transform: [{ translateY: -10 }],
                  }}
                >
                  * Impotant information
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Phone number *"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange("phoneNumber", text)}
              />

              <TextInput
                style={styles.input}
                placeholder="Password *"
                placeholderTextColor="#666"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
              />
              <View style={styles.checkbox}>
                <Checkbox
                  value={formData.termAgree}
                  onValueChange={(selection) => {
                    setFormData((prev) => ({ ...prev, termAgree: selection }));
                  }}
                />
                <Text
                  style={{
                    ...styles.checkboxText,
                    textDecorationLine:
                      formData.loginError === "termAgreeError"
                        ? "underline"
                        : "none",
                  }}
                >
                  Agree to terms
                </Text>
              </View>

              <RippleButton
                buttonStyle={{
                  ...styles.socialButtonStyle,
                  backgroundColor: "#191C32",
                  justifyContent: "center",
                }}
                buttonText="Register"
                textStyle={{ ...styles.textStyle, color: "#ffffff" }}
                onPress={async () => await onPressRegisterButton()}
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
                  Log In
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
          isCancleRefreshCode={true}
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
