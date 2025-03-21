
import React, { useState } from "react";
import {
  Text, 
  View, 
  StyleSheet, 
  Image, 
  TextInput, 
  Dimensions,
  KeyboardAvoidingView,
  Platform, 
} from "react-native";


import SafeAreaWrapper from "../components/layout/SafeAreaWrapper"; 
import RippleButton from "../components/common/RippleButton"; 
import proundCactusIcon from "../../assets/image/pround_cactus.png"; 
import ShowToast from "../components/common/CustomToast"; 
import { changePassword } from "../services/authService"; 
import { ScreensName } from "../constants/ScreensName"; 

// Lấy kích thước màn hình
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function ChangePassword({ navigation, route }) {
  // Lấy email từ params của route
  const email = route.params?.email;
  // Khởi tạo state cho mật khẩu mới và xác nhận mật khẩu
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Hàm xử lý đổi mật khẩu
  const handleResetPassword = async () => {
    // Kiểm tra các trường có trống không
    if (!newPassword || !confirmPassword) {
      ShowToast("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Kiểm tra mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      ShowToast("error", "Mật khẩu không khớp");
      return;
    }

    // Gọi API đổi mật khẩu
    console.log({
      email: email?.trim(),
      password: newPassword,
      passwordConfirm: confirmPassword,
    });

    // Xử lý response từ API
    const response = await changePassword({
      email: email.trim(),
      password: newPassword,
      passwordConfirm: confirmPassword,
    });
    console.log(response.status);

    // Kiểm tra kết quả và điều hướng
    if (response.status === 200) {
      ShowToast("success", "Đổi mật khẩu thành công");
      console.log("Password reset:", newPassword);
      navigation.navigate(ScreensName.signin);
    }
  };

  // Render giao diện
  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          {/* Tiêu đề */}
          <Text style={styles.title}>Change New Password</Text>

          {/* Phụ đề */}
          <Text style={styles.subtitle}>
            Enter a different password with{"\n"}the previous
          </Text>

          {/* Container chứa các input */}
          <View style={styles.inputContainer}>
            {/* Input mật khẩu mới */}
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#666"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            {/* Input xác nhận mật khẩu */}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Container chứa hình minh họa */}
          <View style={styles.illustrationContainer}>
            <Image source={proundCactusIcon} style={styles.cactusIcon} />
            {/* Các phần tử trang trí */}
            <View style={styles.decorations}>
              <View style={[styles.star, styles.starOrange]} />
              <View style={[styles.star, styles.starYellow]} />
              <View style={[styles.dot]} />
            </View>
          </View>

          {/* Nút đổi mật khẩu */}
          <RippleButton
            buttonStyle={styles.submitButton}
            buttonText="Reset Password"
            textStyle={styles.buttonText}
            onPress={handleResetPassword}
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
    backgroundColor: "#FFFFFF",
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
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "Aleo_400Regular",
    marginBottom: 20,
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Aleo_700Bold",
    textAlign: "center",
  },
});

export default ChangePassword;
