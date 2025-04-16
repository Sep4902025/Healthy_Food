// Import các thư viện và hooks cần thiết từ React và React Native
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text, // Component để hiển thị văn bản
  View, // Component cơ bản để tạo layout
  StyleSheet, // API để định nghĩa các style
  Image, // Component để hiển thị hình ảnh
  TextInput, // Component để nhập liệu
  Dimensions, // API để lấy kích thước màn hình
  Platform, // API để nhận biết nền tảng đang chạy (iOS/Android)
  KeyboardAvoidingView, // Component để tránh bàn phím che phủ nội dung
  Alert, // API để hiển thị hộp thông báo
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Hook để thực hiện hành động khi màn hình được focus

// Import các components tùy chỉnh
import SafeAreaWrapper from "../components/layout/SafeAreaWrapper"; // Component bọc ngoài để đảm bảo nội dung nằm trong vùng an toàn
import RippleButton from "../components/common/RippleButton"; // Button với hiệu ứng gợn sóng
import { ScreensName } from "../constants/ScreensName"; // Danh sách tên các màn hình trong ứng dụng

// Import các hình ảnh
import sadCactusIcon from "../../assets/image/sad_cactus.png"; // Biểu tượng xương rồng buồn
import happyCactusIcon from "../../assets/image/happy_cactus.png"; // Biểu tượng xương rồng vui vẻ
// Import các service liên quan đến xác thực
import { forgetPassword, verifyOtp } from "../services/authService"; 
import OTPInput from "../components/common/OtpInput"; // Component nhập OTP
import { useTheme } from "../contexts/ThemeContext"; // Hook để sử dụng theme
import { secondsToMinutes } from "../utils/common"; // Hàm chuyển đổi giây thành phút:giây

// Lấy kích thước màn hình
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

// Component chính VerifyEmail
function VerifyEmail({ navigation, route }) {
  // Khai báo các state cần thiết
  const [email, setEmail] = useState(""); // Lưu email người dùng
  const [verificationCode, setVerificationCode] = useState(""); // Lưu mã xác thực OTP
  const [otpAmount] = useState(4); // Số lượng ô nhập OTP (4 chữ số)
  const [isCodeSent, setIsCodeSent] = useState(false); // Trạng thái đã gửi mã hay chưa
  const [countTime, setCountTime] = useState(0); // Thời gian đếm ngược (giây)
  const [errorMessage, setErrorMessage] = useState(""); // Thông báo lỗi
  const [attemptCount, setAttemptCount] = useState(0); // Số lần thử nhập OTP
  const [isBlocked, setIsBlocked] = useState(false); // Trạng thái bị khóa do nhập sai nhiều lần
  const [isNetworkError, setIsNetworkError] = useState(false); // Trạng thái lỗi mạng
  const intervalRef = useRef(null); // Tham chiếu để lưu interval của đồng hồ đếm ngược
  const { theme } = useTheme(); // Lấy theme hiện tại

  // Reset tất cả states khi màn hình được focus lại
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

  // Hook để xử lý đồng hồ đếm ngược
  useEffect(() => {
    if (isCodeSent && countTime > 0) {
      // Tạo interval để giảm thời gian mỗi giây
      intervalRef.current = setInterval(() => {
        setCountTime((prev) => {
          if (prev <= 1) {
            // Nếu thời gian đã hết, xóa interval và đặt lại về 0
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1; // Giảm thời gian đi 1 giây
        });
      }, 1000);
    }

    // Cleanup function để xóa interval khi component unmount hoặc deps thay đổi
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCodeSent, countTime]);

  // Hàm xử lý gửi email để yêu cầu mã OTP
  const handleSubmitEmail = async () => {
    try {
      setErrorMessage(""); // Xóa thông báo lỗi cũ
      setIsNetworkError(false); // Reset lỗi mạng

      // Kiểm tra nếu email trống
      if (!email.trim()) {
        setErrorMessage("Vui lòng nhập địa chỉ email.");
        return;
      }

      // Gọi API quên mật khẩu để gửi OTP
      const response = await forgetPassword({ email: email.trim() });
      if (response.status === 200) {
        // Nếu thành công, đặt trạng thái đã gửi mã
        setIsCodeSent(true);
        setCountTime(300); // Đặt thời gian đếm ngược 5 phút (300 giây)
        setAttemptCount(0); // Reset số lần thử
      } else {
        console.log(response);
        setErrorMessage("Không thể gửi mã OTP. Vui lòng thử lại.");
      }
    } catch (error) {
      // Xử lý lỗi mạng
      console.error("Network error:", error);
      setIsNetworkError(true);
      setErrorMessage(
        "Không thể gửi mã OTP. Kiểm tra kết nối mạng và thử lại."
      );
    }
  };

  // Hàm xác thực mã OTP
  const handleVerifyCode = async (value) => {
    try {
      setErrorMessage(""); // Xóa thông báo lỗi cũ
      setIsNetworkError(false); // Reset lỗi mạng

      // Kiểm tra nếu người dùng đã bị khóa do nhập sai nhiều lần
      if (isBlocked) {
        setErrorMessage(
          "Bạn đã nhập sai quá số lần cho phép. Vui lòng thử lại sau."
        );
        return;
      }

      // Kiểm tra nếu mã OTP đã hết hạn
      if (countTime === 0) {
        setErrorMessage("Mã OTP đã hết hạn.");
        return;
      }

      // Gọi API xác thực OTP
      const response = await verifyOtp({
        email: email.trim(),
        otp: value ?? verificationCode, // Sử dụng giá trị được truyền vào hoặc state hiện tại
      });

      if (response.status === 200) {
        // Nếu thành công, chuyển đến màn hình đặt lại mật khẩu
        navigation.navigate(ScreensName.resetPassword, { email: email });
      } else {
        // Tăng số lần thử và kiểm tra nếu đã đạt tối đa
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 3) {
          // Nếu đã nhập sai 3 lần, khóa không cho nhập nữa
          setIsBlocked(true);
          setErrorMessage(
            "Bạn đã nhập sai quá số lần cho phép. Vui lòng thử lại sau."
          );
        } else {
          setErrorMessage("Invalid Otp. Please retype code.");
        }
      }
    } catch (error) {
      // Xử lý lỗi mạng
      console.error("Network error:", error);
      setIsNetworkError(true);
      setErrorMessage(
        "Không thể xác thực mã OTP. Kiểm tra kết nối mạng và thử lại."
      );
    }
  };

  // Hàm gửi lại mã OTP
  const handleResendCode = async () => {
    // Chỉ cho phép gửi lại nếu đã qua 60 giây kể từ lần gửi trước (300-240=60)
    if (countTime - 240 > 0) {
      Alert.alert(
        "Notificate",
        `Please wait ${secondsToMinutes(countTime - 240)} before resent code.`
      );
      return;
    }

    setIsBlocked(false); // Reset trạng thái bị khóa
    setAttemptCount(0); // Reset số lần thử
    await handleSubmitEmail(); // Gọi hàm gửi email để nhận OTP mới
  };

  // Hàm quay lại màn hình nhập email
  const handleBackToEmail = () => {
    setIsCodeSent(false); // Đặt lại trạng thái chưa gửi mã
    setVerificationCode(""); // Xóa mã xác thực đã nhập
    setErrorMessage(""); // Xóa thông báo lỗi
    setAttemptCount(0); // Reset số lần thử
    setIsBlocked(false); // Reset trạng thái bị khóa
    setIsNetworkError(false); // Reset lỗi mạng
  };

  // Hàm xử lý khi mã OTP thay đổi
  const handleCodeChange = (value) => {
    setVerificationCode(value);
    // if (value.length === otpAmount) {
    //   console.log("Complete OTP:", value);
    //   handleVerifyCode(value);
    // }
  };

  // Render UI
  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        style={{
          ...styles.container,
          backgroundColor: theme.editModalbackgroundColor,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Hành vi khác nhau tùy theo nền tảng
      >
        <View style={styles.card}>
          {/* Hiển thị hình ảnh xương rồng khác nhau tùy trạng thái */}
          <Image
            source={isCodeSent ? happyCactusIcon : sadCactusIcon}
            style={styles.cactusIcon}
          />

          {/* Tiêu đề thay đổi theo trạng thái */}
          <Text style={{ ...styles.title, color: theme.textColor }}>
            {isCodeSent ? "Verify OTP" : "Forgot password"}
          </Text>

          {/* Tiêu đề phụ thay đổi theo trạng thái */}
          <Text style={{ ...styles.subtitle, color: theme.greyTextColor }}>
            {isCodeSent
              ? "Please check your email \n to create new password"
              : "Type your signup email"}
          </Text>

          {/* Hiển thị thông báo lỗi nếu có */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Hiển thị màn hình nhập email hoặc màn hình nhập OTP tùy trạng thái */}
          {!isCodeSent ? (
            <>
              {/* Màn hình nhập email */}
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

              {/* Nút gửi mã */}
              <RippleButton
                buttonStyle={styles.submitButton}
                buttonText="Send code"
                textStyle={styles.buttonText}
                onPress={handleSubmitEmail}
              />

              {/* Liên kết đến trang đăng nhập */}
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
              {/* Màn hình nhập OTP */}
              <View style={styles.codeContainer}>
                <OTPInput
                  length={otpAmount}
                  value={verificationCode}
                  onChange={handleCodeChange}
                  disabled={isBlocked || countTime === 0} // Vô hiệu hóa nếu bị khóa hoặc hết thời gian
                />
              </View>

              {/* Hiển thị đồng hồ đếm ngược */}
              <Text style={{ ...styles.timerText, color: theme.textColor }}>
                {countTime > 0
                  ? `Time left: ${secondsToMinutes(countTime)}`
                  : "OTP code exprided"}
              </Text>

              {/* Tùy chọn gửi lại mã OTP */}
              <Text style={{ ...styles.bottomText, color: theme.textColor }}>
                Can't get email? ?{" "}
                <Text
                  style={[
                    styles.linkText,
                    countTime - 240 > 0 && { // Vô hiệu hóa nếu chưa đủ thời gian để gửi lại
                      color: "#888",
                      textDecorationLine: "none",
                    },
                  ]}
                  onPress={handleResendCode}
                >
                  Resubmit
                </Text>
              </Text>

              {/* Các nút xử lý */}
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

// Định nghĩa các style cho component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    backgroundColor: "#FFFFFF", // Màu nền trắng
    paddingHorizontal: WIDTH * 0.075, // Padding ngang tương đối theo chiều rộng màn hình
    paddingVertical: 30, // Padding dọc cố định
  },
  card: {
    width: "100%", // Chiếm toàn bộ chiều rộng
    alignItems: "center", // Căn giữa các phần tử con theo chiều ngang
  },
  cactusIcon: {
    width: WIDTH * 0.8, // Chiều rộng tương đối theo màn hình
    height: HEIGHT * 0.25, // Chiều cao tương đối theo màn hình
    resizeMode: "contain", // Đảm bảo toàn bộ hình ảnh vừa khung
    marginVertical: 20, // Margin trên dưới
  },
  title: {
    fontSize: 24, // Kích thước font
    fontFamily: "Aleo_700Bold", // Font chữ đậm
    color: "#191C32", // Màu chữ
    marginBottom: 10, // Margin dưới
  },
  subtitle: {
    fontSize: 16, // Kích thước font
    fontFamily: "Aleo_400Regular", // Font chữ thường
    color: "#666", // Màu chữ xám
    textAlign: "center", // Căn giữa theo chiều ngang
    marginBottom: 30, // Margin dưới
    lineHeight: 22, // Chiều cao dòng
  },
  errorText: {
    color: "red", // Màu chữ đỏ cho thông báo lỗi
    marginBottom: 15, // Margin dưới
    textAlign: "center", // Căn giữa theo chiều ngang
    fontFamily: "Aleo_400Regular", // Font chữ thường
    fontSize: 14, // Kích thước font
  },
  label: {
    alignSelf: "flex-start", // Tự căn về bên trái
    fontSize: 16, // Kích thước font
    fontFamily: "Aleo_400Regular", // Font chữ thường
    color: "#666", // Màu chữ xám
    marginBottom: 8, // Margin dưới
  },
  emailInput: {
    width: "100%", // Chiếm toàn bộ chiều rộng
    height: 50, // Chiều cao cố định
    backgroundColor: "#F5F5F5", // Màu nền
    borderRadius: 12, // Bo góc
    paddingHorizontal: 15, // Padding ngang
    fontSize: 16, // Kích thước font
    fontFamily: "Aleo_400Regular", // Font chữ thường
    marginBottom: 20, // Margin dưới
  },
  codeContainer: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    justifyContent: "center", // Căn giữa theo chiều ngang
    gap: 10, // Khoảng cách giữa các phần tử
    width: "100%", // Chiếm toàn bộ chiều rộng
    marginBottom: 20, // Margin dưới
    paddingHorizontal: 20, // Padding ngang
  },
  timerText: {
    fontSize: 14, // Kích thước font
    fontFamily: "Aleo_400Regular", // Font chữ thường
    marginBottom: 20, // Margin dưới
  },
  submitButton: {
    width: "100%", // Chiếm toàn bộ chiều rộng
    backgroundColor: "#32B768", // Màu nền xanh lá
    padding: 15, // Padding đều
    borderRadius: 12, // Bo góc
    marginBottom: 20, // Margin dưới
  },
  buttonList: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    gap: 12, // Khoảng cách giữa các nút
  },
  backButton: {
    flex: 1, // Chia đều không gian
    backgroundColor: "#32B768", // Màu nền xanh lá
    padding: 15, // Padding đều
    borderRadius: 12, // Bo góc
    marginTop: 10, // Margin trên
  },
  buttonText: {
    color: "#FFFFFF", // Màu chữ trắng
    fontSize: 18, // Kích thước font
    fontFamily: "Aleo_700Bold", // Font chữ đậm
    textAlign: "center", // Căn giữa theo chiều ngang
  },
  backButtonText: {
    color: "white", // Màu chữ trắng
  },
  bottomText: {
    fontSize: 16, // Kích thước font
    fontFamily: "Aleo_400Regular", // Font chữ thường
    color: "#666", // Màu chữ xám
    marginVertical: 16, // Margin trên dưới
  },
  linkText: {
    color: "#40B491", // Màu chữ xanh lá đậm
    textDecorationLine: "underline", // Gạch chân
  },
});

export default VerifyEmail; // Export component để sử dụng ở nơi khác