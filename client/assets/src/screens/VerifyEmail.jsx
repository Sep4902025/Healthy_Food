import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import SafeAreaWrapper from "../components/layout/SafeAreaWrapper";
import RippleButton from "../components/common/RippleButton";
import { ScreensName } from "../constants/ScreensName";

import sadCactusIcon from "../../assets/image/sad_cactus.png";
import happyCactusIcon from "../../assets/image/happy_cactus.png";
import { forgetPassword, verifyOtp } from "../services/authService";
import OTPInput from "../components/common/OtpInput";
import { useTheme } from "../contexts/ThemeContext";
import { secondsToMinutes } from "../utils/common";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function VerifyEmail({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpAmount] = useState(4);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countTime, setCountTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const intervalRef = useRef(null);
  const { theme } = useTheme();

  // Reset states when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setIsCodeSent(false);
      setCountTime(0);
      setErrorMessage("");
      setAttemptCount(0);
      setIsBlocked(false);
      setIsNetworkError(false);
    }, [])
  );

  // Handle the countdown timer
  useEffect(() => {
    if (isCodeSent && countTime > 0) {
      intervalRef.current = setInterval(() => {
        setCountTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCodeSent, countTime]);

  // Submit email to request OTP
  const handleSubmitEmail = async () => {
    try {
      setErrorMessage("");
      setIsNetworkError(false);

      if (!email.trim()) {
        setErrorMessage("Vui lòng nhập địa chỉ email.");
        return;
      }

      const response = await forgetPassword({ email: email.trim() });
      if (response.status === 200) {
        setIsCodeSent(true);
        setCountTime(300); // 5 minutes countdown
        setAttemptCount(0);
      } else {
        console.log(response);
        setErrorMessage("Không thể gửi mã OTP. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setIsNetworkError(true);
      setErrorMessage(
        "Không thể gửi mã OTP. Kiểm tra kết nối mạng và thử lại."
      );
    }
  };

  // Verify OTP code
  const handleVerifyCode = async (value) => {
    try {
      setErrorMessage("");
      setIsNetworkError(false);

      // Check if user is blocked due to too many attempts
      if (isBlocked) {
        setErrorMessage(
          "Bạn đã nhập sai quá số lần cho phép. Vui lòng thử lại sau."
        );
        return;
      }

      // Check if OTP has expired
      if (countTime === 0) {
        setErrorMessage("Mã OTP đã hết hạn.");
        return;
      }

      const response = await verifyOtp({
        email: email.trim(),
        otp: value ?? verificationCode,
      });

      if (response.status === 200) {
        // Success - navigate to next screen
        navigation.navigate(ScreensName.resetPassword, { email: email });
      } else {
        // Increment attempt count and check if max attempts reached
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 3) {
          setIsBlocked(true);
          setErrorMessage(
            "Bạn đã nhập sai quá số lần cho phép. Vui lòng thử lại sau."
          );
        } else {
          setErrorMessage("Invalid Otp. Please retype code.");
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setIsNetworkError(true);
      setErrorMessage(
        "Không thể xác thực mã OTP. Kiểm tra kết nối mạng và thử lại."
      );
    }
  };

  // Resend OTP code
  const handleResendCode = async () => {
    // Can only resend if the timer has expired or equals 0
    if (countTime - 240 > 0) {
      Alert.alert(
        "Notificate",
        `Please wait ${secondsToMinutes(countTime - 240)} before resent code.`
      );
      return;
    }

    setIsBlocked(false); // Reset blocked status when sending new OTP
    setAttemptCount(0); // Reset attempt counter
    await handleSubmitEmail();
  };

  // Go back to email entry
  const handleBackToEmail = () => {
    setIsCodeSent(false);
    setVerificationCode("");
    setErrorMessage("");
    setAttemptCount(0);
    setIsBlocked(false);
    setIsNetworkError(false);
  };

  // Handle OTP input changes
  const handleCodeChange = (value) => {
    setVerificationCode(value);
    // if (value.length === otpAmount) {
    //   console.log("Complete OTP:", value);
    //   handleVerifyCode(value);
    // }
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
          <Image
            source={isCodeSent ? happyCactusIcon : sadCactusIcon}
            style={styles.cactusIcon}
          />

          <Text style={{ ...styles.title, color: theme.textColor }}>
            {isCodeSent ? "Verify OTP" : "Forgot password"}
          </Text>

          <Text style={{ ...styles.subtitle, color: theme.greyTextColor }}>
            {isCodeSent
              ? "Please check your email \n to create new password"
              : "Type your signup email"}
          </Text>

          {/* Error message display */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {!isCodeSent ? (
            <>
              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Email address
              </Text>
              <TextInput
                style={styles.emailInput}
                placeholder="example@gmail.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <RippleButton
                buttonStyle={styles.submitButton}
                buttonText="Send code"
                textStyle={styles.buttonText}
                onPress={handleSubmitEmail}
              />

              <Text
                style={{ ...styles.bottomText, color: theme.greyTextColor }}
              >
                Remember password?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate(ScreensName.signin)}
                >
                  Sign in
                </Text>
              </Text>
            </>
          ) : (
            <>
              <View style={styles.codeContainer}>
                <OTPInput
                  length={otpAmount}
                  value={verificationCode}
                  onChange={handleCodeChange}
                  disabled={isBlocked || countTime === 0}
                />
              </View>

              {/* Timer display */}
              <Text style={{ ...styles.timerText, color: theme.textColor }}>
                {countTime > 0
                  ? `Time left: ${secondsToMinutes(countTime)}`
                  : "OTP code exprided"}
              </Text>

              <Text style={{ ...styles.bottomText, color: theme.textColor }}>
                Can't get email? ?{" "}
                <Text
                  style={[
                    styles.linkText,
                    countTime - 240 > 0 && {
                      color: "#888",
                      textDecorationLine: "none",
                    },
                  ]}
                  onPress={handleResendCode}
                >
                  Resubmit
                </Text>
              </Text>

              <View style={styles.buttonList}>
                <RippleButton
                  buttonStyle={styles.backButton}
                  buttonText="Back Email"
                  textStyle={[styles.buttonText, styles.backButtonText]}
                  onPress={handleBackToEmail}
                />
                <RippleButton
                  buttonStyle={styles.backButton}
                  buttonText="Send code"
                  textStyle={[styles.buttonText, styles.backButtonText]}
                  onPress={() => handleVerifyCode()}
                />
              </View>
            </>
          )}
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
  cactusIcon: {
    width: WIDTH * 0.8,
    height: HEIGHT * 0.25,
    resizeMode: "contain",
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Aleo_700Bold",
    color: "#191C32",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Aleo_400Regular",
    fontSize: 14,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
    color: "#666",
    marginBottom: 8,
  },
  emailInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Aleo_400Regular",
    marginBottom: 20,
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#32B768",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonList: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#32B768",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Aleo_700Bold",
    textAlign: "center",
  },
  backButtonText: {
    color: "white",
  },
  bottomText: {
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
    color: "#666",
    marginVertical: 16,
  },
  linkText: {
    color: "#40B491",
    textDecorationLine: "underline",
  },
});

export default VerifyEmail;
