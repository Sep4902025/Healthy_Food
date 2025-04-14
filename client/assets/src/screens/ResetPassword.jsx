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
import { changePassword, resetPassword } from "../services/authService";
import { ScreensName } from "../constants/ScreensName";
import { useTheme } from "../contexts/ThemeContext";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function ResetPassword({ navigation, route }) {
  const email = route.params?.email;
  const { theme } = useTheme();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      ShowToast("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      ShowToast("error", "Mật khẩu không khớp");
      return;
    }

    const response = await resetPassword({
      email: email.trim(),
      password: newPassword,
      passwordConfirm: confirmPassword,
    });

    if (response.status === 200) {
      ShowToast("success", "Đổi mật khẩu thành công");
      console.log("Password reset:", newPassword);
      navigation.navigate(ScreensName.signin);
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
            Change New Password
          </Text>
          <Text style={{ ...styles.subtitle, color: theme.greyTextColor }}>
            Enter a different password with{"\n"}the previous
          </Text>

          <View style={styles.inputContainer}>
            <Text style={{ ...styles.label, color: theme.greyTextColor }}>
              New Password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#666"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={{ ...styles.label, color: theme.greyTextColor }}>
              Confirm Password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
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

export default ResetPassword;
