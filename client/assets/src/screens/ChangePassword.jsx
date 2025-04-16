// Import các thư viện và components từ React và React Native
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
  PixelRatio,
  ScrollView,
} from "react-native";

// Import các components tùy chỉnh từ ứng dụng
import SafeAreaWrapper from "../components/layout/SafeAreaWrapper"; // Component bọc ngoài để đảm bảo nội dung nằm trong vùng an toàn
import RippleButton from "../components/common/RippleButton"; // Nút có hiệu ứng gợn sóng khi nhấn
import proundCactusIcon from "../../assets/image/pround_cactus.png"; // Hình ảnh xương rồng cho minh họa
import ShowToast from "../components/common/CustomToast"; // Component hiển thị thông báo toast
import { changePassword } from "../services/authService"; // Service xử lý thay đổi mật khẩu
import { ScreensName } from "../constants/ScreensName"; // Các hằng số tên màn hình
import { useTheme } from "../contexts/ThemeContext"; // Hook sử dụng theme
import { Feather } from "@expo/vector-icons"; // Thư viện icon
import { normalize } from "../utils/common"; // Hàm chuẩn hóa kích thước theo màn hình

// Component màn hình thay đổi mật khẩu
function ChangePassword({ navigation, route }) {
  const email = route.params?.email; // Lấy email từ params nếu có
  const { theme } = useTheme(); // Lấy theme hiện tại

  // Các state để lưu trữ thông tin mật khẩu
  const [presentPassword, setPresentPassword] = useState(""); // Mật khẩu hiện tại
  const [newPassword, setNewPassword] = useState(""); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu mới
  const [showPresentPassword, setShowPresentPassword] = useState(false); // Trạng thái hiển thị mật khẩu hiện tại
  const [showNewPassword, setShowNewPassword] = useState(false); // Trạng thái hiển thị mật khẩu mới
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Trạng thái hiển thị xác nhận mật khẩu

  // Theo dõi trạng thái các trường đã được tương tác hay chưa
  const [touched, setTouched] = useState({
    presentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // State lưu các lỗi cho từng trường
  const [errors, setErrors] = useState({
    presentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false); // Trạng thái form hợp lệ

  // Hàm kiểm tra độ mạnh của mật khẩu
  const checkPasswordStrength = (password) => {
    let strength = 0;
    const hasLowerCase = /[a-z]/.test(password); // Kiểm tra có chữ thường
    const hasUpperCase = /[A-Z]/.test(password); // Kiểm tra có chữ hoa
    const hasNumbers = /\d/.test(password); // Kiểm tra có số
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Kiểm tra có ký tự đặc biệt

    // Tính điểm độ mạnh của mật khẩu
    if (password.length >= 8) strength++;
    if (hasLowerCase) strength++;
    if (hasUpperCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChars) strength++;

    // Nếu mật khẩu và độ mạnh < 3, trả về không đủ mạnh
    if (password && strength < 3) {
      return {
        isStrong: false,
        message:
          "Password is too weak. Include uppercase, lowercase, numbers, and special characters.",
      };
    }

    return { isStrong: true, message: "" }; // Mật khẩu đủ mạnh
  };

  // Chạy kiểm tra form mỗi khi có thay đổi ở các trường mật khẩu
  useEffect(() => {
    validateForm();
  }, [presentPassword, newPassword, confirmPassword]);

  // Hàm kiểm tra tính hợp lệ của form
  const validateForm = () => {
    const newErrors = {
      presentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    // Kiểm tra mật khẩu hiện tại
    if (!presentPassword.trim()) {
      newErrors.presentPassword = "Current password is required";
      isValid = false;
    }

    // Kiểm tra mật khẩu mới
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

    // Kiểm tra xác nhận mật khẩu
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors); // Cập nhật state lỗi
    setIsFormValid(isValid); // Cập nhật trạng thái form
    return isValid;
  };

  // Xử lý khi trường được tương tác
  const handleFieldTouch = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Xử lý khi nhấn nút đổi mật khẩu
  const handleResetPassword = async () => {
    // Đánh dấu tất cả các trường đã được chạm vào khi cố gắng gửi
    setTouched({
      presentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Kiểm tra lại form trước khi gửi
    if (!validateForm()) {
      ShowToast("error", "Complete form to change password");
      return;
    }

    // Gọi API đổi mật khẩu
    const response = await changePassword({
      currentPassword: presentPassword,
      newPassword: newPassword,
      newPasswordConfirm: confirmPassword,
    });

    // Xử lý phản hồi từ API
    if (response.status === 200) {
      ShowToast("success", "Password changed successfully");
      console.log("Password reset:", newPassword);
      navigation.navigate(ScreensName.signin); // Chuyển đến màn hình đăng nhập
    } else {
      // Hiển thị thông báo lỗi
      ShowToast(
        "error",
        response?.response?.data?.message || "Failed to change password"
      );
    }
  };

  return (
    <SafeAreaWrapper>
      {/* KeyboardAvoidingView giúp form không bị che khuất bởi bàn phím */}
      <KeyboardAvoidingView
        style={{
          ...styles.container,
          backgroundColor: theme.editModalbackgroundColor,
        }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? normalize(64) : 0}
      >
        {/* ScrollView cho phép cuộn nội dung khi không đủ không gian */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Tiêu đề và phụ đề */}
            <Text style={[styles.title, { color: theme.textColor }]}>
              Change Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.greyTextColor }]}>
              Enter a different password from{"\n"}your previous one
            </Text>

            <View style={styles.inputContainer}>
              {/* Trường mật khẩu hiện tại */}
              <Text style={[styles.label, { color: theme.greyTextColor }]}>
                Current Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  touched.presentPassword && errors.presentPassword
                    ? styles.inputError
                    : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor="#666"
                  value={presentPassword}
                  onChangeText={(text) => {
                    setPresentPassword(text);
                    if (!touched.presentPassword) {
                      handleFieldTouch("presentPassword");
                    }
                  }}
                  secureTextEntry={!showPresentPassword}
                  onBlur={() => handleFieldTouch("presentPassword")}
                />
                {/* Nút hiển thị/ẩn mật khẩu */}
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPresentPassword(!showPresentPassword)}
                >
                  <Feather
                    name={showPresentPassword ? "eye" : "eye-off"}
                    size={normalize(24)}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {/* Hiển thị thông báo lỗi nếu có */}
              {touched.presentPassword && errors.presentPassword ? (
                <Text style={styles.errorText}>{errors.presentPassword}</Text>
              ) : null}

              {/* Trường mật khẩu mới */}
              <Text style={[styles.label, { color: theme.greyTextColor }]}>
                New Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  touched.newPassword && errors.newPassword
                    ? styles.inputError
                    : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor="#666"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (!touched.newPassword) {
                      handleFieldTouch("newPassword");
                    }
                  }}
                  secureTextEntry={!showNewPassword}
                  onBlur={() => handleFieldTouch("newPassword")}
                />
                {/* Nút hiển thị/ẩn mật khẩu mới */}
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Feather
                    name={showNewPassword ? "eye" : "eye-off"}
                    size={normalize(24)}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {/* Hiển thị thông báo lỗi nếu có */}
              {touched.newPassword && errors.newPassword ? (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              ) : null}

              {/* Trường xác nhận mật khẩu */}
              <Text style={[styles.label, { color: theme.greyTextColor }]}>
                Confirm Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  touched.confirmPassword && errors.confirmPassword
                    ? styles.inputError
                    : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (!touched.confirmPassword) {
                      handleFieldTouch("confirmPassword");
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  onBlur={() => handleFieldTouch("confirmPassword")}
                />
                {/* Nút hiển thị/ẩn xác nhận mật khẩu */}
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={normalize(24)}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {/* Hiển thị thông báo lỗi nếu có */}
              {touched.confirmPassword && errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Phần minh họa với hình xương rồng và các trang trí */}
            <View style={styles.illustrationContainer}>
              <Image source={proundCactusIcon} style={styles.cactusIcon} />
              <View style={styles.decorations}>
                <View style={[styles.star, styles.starOrange]} />
                <View style={[styles.star, styles.starYellow]} />
                <View style={[styles.dot]} />
              </View>
            </View>

            {/* Nút thay đổi mật khẩu */}
            <RippleButton
              // buttonStyle={[
              //   styles.submitButton,
              //   !isFormValid ? styles.disabledButton : null,
              // ]}
              buttonStyle={{ ...styles.submitButton }}
              buttonText="Change Password"
              textStyle={styles.buttonText}
              onPress={handleResetPassword}
              disabled={!isFormValid} // Vô hiệu hóa nút nếu form không hợp lệ
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

// Định nghĩa các styles cho component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    backgroundColor: "#FFFFFF", // Màu nền trắng
  },
  scrollContainer: {
    flexGrow: 1, // Cho phép nội dung mở rộng
    paddingHorizontal: normalize(24), // Đệm ngang
    paddingVertical: normalize(20), // Đệm dọc
  },
  card: {
    width: "100%", // Chiếm toàn bộ chiều rộng
    alignItems: "center", // Căn giữa các phần tử con theo chiều ngang
  },
  title: {
    fontSize: normalize(24), // Kích thước font chữ tiêu đề
    fontFamily: "Aleo_700Bold", // Font chữ đậm
    color: "#191C32", // Màu chữ
    marginBottom: normalize(10), // Khoảng cách dưới
    alignSelf: "flex-start", // Căn trái
  },
  subtitle: {
    fontSize: normalize(16), // Kích thước font chữ phụ đề
    fontFamily: "Aleo_400Regular", // Font chữ thường
    color: "#666", // Màu chữ xám
    marginBottom: normalize(24), // Khoảng cách dưới
    lineHeight: normalize(22), // Khoảng cách giữa các dòng
    alignSelf: "flex-start", // Căn trái
  },
  inputContainer: {
    width: "100%", // Chiếm toàn bộ chiều rộng
    marginBottom: normalize(16), // Khoảng cách dưới
  },
  label: {
    fontSize: normalize(16), // Kích thước font chữ nhãn
    fontFamily: "Aleo_400Regular", // Font chữ thường
    color: "#666", // Màu chữ xám
    marginBottom: normalize(8), // Khoảng cách dưới
  },
  inputWrapper: {
    width: "100%", // Chiếm toàn bộ chiều rộng
    height: normalize(50), // Chiều cao trường nhập liệu
    backgroundColor: "#F5F5F5", // Màu nền xám nhạt
    borderRadius: normalize(12), // Bo góc
    flexDirection: "row", // Sắp xếp các phần tử con theo hàng ngang
    alignItems: "center", // Căn giữa theo chiều dọc
    borderWidth: 1, // Độ dày viền
    borderColor: "transparent", // Màu viền trong suốt (mặc định)
    marginBottom: normalize(5), // Khoảng cách dưới
  },
  inputError: {
    borderColor: "#FF6B6B", // Màu viền đỏ khi có lỗi
  },
  input: {
    flex: 1, // Mở rộng để chiếm hết không gian còn lại
    height: "100%", // Chiếm toàn bộ chiều cao
    paddingHorizontal: normalize(15), // Đệm ngang
    fontSize: normalize(16), // Kích thước font chữ
    fontFamily: "Aleo_400Regular", // Font chữ thường
  },
  eyeIcon: {
    paddingHorizontal: normalize(15), // Đệm ngang
    height: "100%", // Chiếm toàn bộ chiều cao
    justifyContent: "center", // Căn giữa theo chiều dọc
  },
  errorText: {
    color: "#FF6B6B", // Màu chữ đỏ cho thông báo lỗi
    fontSize: normalize(12), // Kích thước font chữ nhỏ
    fontFamily: "Aleo_400Regular", // Font chữ thường
    marginBottom: normalize(15), // Khoảng cách dưới
  },
  illustrationContainer: {
    position: "relative", // Vị trí tương đối
    width: "100%", // Chiếm toàn bộ chiều rộng
    aspectRatio: 2, // Tỷ lệ khung hình 2:1
    marginVertical: normalize(16), // Khoảng cách trên dưới
    alignItems: "center", // Căn giữa theo chiều ngang
    justifyContent: "center", // Căn giữa theo chiều dọc
  },
  cactusIcon: {
    width: "80%", // Chiều rộng 80% của container
    height: "80%", // Chiều cao 80% của container
    resizeMode: "contain", // Chế độ hiển thị hình ảnh
  },
  decorations: {
    position: "absolute", // Vị trí tuyệt đối
    width: "100%", // Chiếm toàn bộ chiều rộng
    height: "100%", // Chiếm toàn bộ chiều cao
  },
  star: {
    position: "absolute", // Vị trí tuyệt đối
    width: normalize(20), // Chiều rộng ngôi sao
    height: normalize(20), // Chiều cao ngôi sao
    borderRadius: normalize(4), // Bo góc
    transform: [{ rotate: "45deg" }], // Xoay 45 độ để tạo hình ngôi sao
  },
  starOrange: {
    backgroundColor: "#FF8A65", // Màu cam
    right: "20%", // Vị trí bên phải
    top: "10%", // Vị trí từ trên xuống
  },
  starYellow: {
    backgroundColor: "#FFD54F", // Màu vàng
    right: "35%", // Vị trí bên phải
    top: "15%", // Vị trí từ trên xuống
  },
  dot: {
    position: "absolute", // Vị trí tuyệt đối
    width: normalize(10), // Chiều rộng chấm
    height: normalize(10), // Chiều cao chấm
    borderRadius: normalize(5), // Bo tròn hoàn toàn
    backgroundColor: "#4CAF50", // Màu xanh lá
    right: "25%", // Vị trí bên phải
    top: "25%", // Vị trí từ trên xuống
  },
  submitButton: {
    width: "100%", // Chiếm toàn bộ chiều rộng
    backgroundColor: "#32B768", // Màu nền xanh lá
    padding: normalize(15), // Đệm
    borderRadius: normalize(12), // Bo góc
    marginTop: normalize(16), // Khoảng cách trên
  },
  disabledButton: {
    backgroundColor: "#A5D6A7", // Màu nền xanh lá nhạt khi nút bị vô hiệu hóa
    opacity: 0.7, // Độ mờ
  },
  buttonText: {
    color: "#FFFFFF", // Màu chữ trắng
    fontSize: normalize(18), // Kích thước font chữ
    fontFamily: "Aleo_700Bold", // Font chữ đậm
    textAlign: "center", // Căn giữa văn bản
  },
});

export default ChangePassword; // Xuất component để sử dụng trong ứng dụng