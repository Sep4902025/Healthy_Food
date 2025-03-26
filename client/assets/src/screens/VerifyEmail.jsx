// Import các thư viện cần thiết từ React và React Native
import React, { use, useCallback, useState } from "react";
import {
  Text, // Component hiển thị text
  View, // Component container
  StyleSheet, // API để tạo styles
  Image, // Component hiển thị hình ảnh
  TextInput, // Component nhập liệu
  Dimensions, // API lấy kích thước màn hình
  Platform,
  KeyboardAvoidingView, // API kiểm tra nền tảng
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Hook xử lý focus màn hình

// Import các components tùy chỉnh
import SafeAreaWrapper from "../components/layout/SafeAreaWrapper"; // Component wrapper an toàn
import RippleButton from "../components/common/RippleButton"; // Button có hiệu ứng gợn sóng
import { ScreensName } from "../constants/ScreensName"; // Constants chứa tên màn hình

// Import hình ảnh
import sadCactusIcon from "../../assets/image/sad_cactus.png"; // Icon xương rồng buồn
import happyCactusIcon from "../../assets/image/happy_cactus.png"; // Icon xương rồng vui
import { forgetPassword, verifyOtp } from "../services/authService"; // Services xử lý quên mật khẩu
import OTPInput from "../components/common/OtpInput"; // Component nhập OTP
import { useTheme } from "../contexts/ThemeContext";

// Lấy kích thước màn hình
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function VerifyEmail({ navigation }) {
  // Khởi tạo các state
  const [email, setEmail] = useState(""); // State lưu email
  const [verificationCode, setVerificationCode] = useState(""); // State lưu mã OTP
  const [otpAmount] = useState(4); // Số lượng ký tự OTP
  const [isCodeSent, setIsCodeSent] = useState(false); // Trạng thái đã gửi mã
  const { theme } = useTheme();

  // Reset trạng thái khi focus màn hình
  // useFocusEffect sẽ chạy mỗi khi focus vào màn hình,
  // useCallback sẽ lưu lại các phương thức bên trong hạn chế việc tải lại mỗi khi gọi hàm
  useFocusEffect(
    React.useCallback(() => {
      setIsCodeSent(false);
    }, [])
  );

  // Xử lý gửi email
  const handleSubmitEmail = async () => {
    const response = await forgetPassword({ email: email.trim() });
    if (response.status === 200) {
      setIsCodeSent(true);
    } else {
      console.log(response);
    }
  };

  // Xử lý xác thực mã OTP
  const handleVerifyCode = async (value) => {
    const response = await verifyOtp({
      email: email.trim(),
      otp: value ?? verificationCode,
    });
    if (response.status === 200) {
      navigation.navigate(ScreensName.changePassword, { email: email });
    } else {
      console.log(response);
    }
  };

  // Xử lý gửi lại mã
  const handleResendCode = async () => {
    await handleSubmitEmail();
  };

  // Xử lý quay lại nhập email
  const handleBackToEmail = () => {
    setIsCodeSent(false);
    setVerificationCode("");
  };

  // Xử lý khi nhập mã OTP
  const handleCodeChange = (value) => {
    setVerificationCode(value);
    if (value.length === otpAmount) {
      console.log("Complete OTP:", value);
      handleVerifyCode(value);
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
          {/* Hiển thị icon tương ứng với trạng thái */}
          <Image
            source={isCodeSent ? happyCactusIcon : sadCactusIcon}
            style={styles.cactusIcon}
          />

          {/* Tiêu đề */}
          <Text style={{ ...styles.title, color: theme.textColor }}>
            {isCodeSent ? "Success" : "Forget Password"}
          </Text>

          {/* Phụ đề */}
          <Text style={{ ...styles.subtitle, color: theme.greyTextColor }}>
            {isCodeSent
              ? "Please check your email for create\na new password"
              : "Enter your registered email below"}
          </Text>

          {/* Hiển thị form tương ứng với trạng thái */}
          {!isCodeSent ? (
            <>
              {/* Form nhập email */}
              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Email address
              </Text>
              <TextInput
                style={styles.emailInput}
                placeholder="emirhan.begg@gmail.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Nút gửi email */}
              <RippleButton
                buttonStyle={styles.submitButton}
                buttonText="Submit"
                textStyle={styles.buttonText}
                onPress={handleSubmitEmail}
              />

              {/* Link đăng nhập */}
              <Text
                style={{ ...styles.bottomText, color: theme.greyTextColor }}
              >
                Remember the password?{" "}
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
              {/* Form nhập mã OTP */}
              <View style={styles.codeContainer}>
                <OTPInput
                  length={otpAmount}
                  value={verificationCode}
                  onChange={handleCodeChange}
                />
              </View>

              {/* Link gửi lại mã */}
              <Text style={{ ...styles.bottomText, color: theme.textColor }}>
                Can't get email?{" "}
                <Text style={styles.linkText} onPress={handleResendCode}>
                  Resubmit
                </Text>
              </Text>

              {/* Nút quay lại */}
              <RippleButton
                buttonStyle={styles.backButton}
                buttonText="Back Email"
                textStyle={[styles.buttonText, styles.backButtonText]}
                onPress={handleBackToEmail}
              />
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
    marginBottom: 50,
    lineHeight: 22,
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
  codeInput: {
    width: WIDTH * 0.1,
    height: WIDTH * 0.1,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Aleo_700Bold",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#32B768",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  backButton: {
    width: "100%",
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
