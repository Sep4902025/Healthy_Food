import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import SafeAreaWrapper from "../components/layout/SafeAreaWrapper";
import SigninInputField from "../components/common/SigninInputField";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import MaterialIcons from "../components/common/VectorIcons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import RippleButton from "../components/common/RippleButton";

import googleIcon from "../../assets/image/google_icon.png";
import loginHeaderIcon from "../../assets/image/login_bg.png";
import { ScreensName } from "../constants/ScreensName";
import ShowToast from "../components/common/CustomToast";
import { loginThunk } from "../redux/actions/userThunk";
import { useDispatch } from "react-redux";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import NonBottomTabWrapper from "../components/layout/NonBottomTabWrapper";
import { normalize } from "../utils/common";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

function Signin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { signIn } = useGoogleAuth();

  const loginMethod = [
    {
      name: "Google",
      icon: googleIcon,
      color: "#4285F4",
      onPress: async () => {
        await loginGoogle();
      },
    },
  ];

  const loginGoogle = async () => {
    await signIn();
  };

  const handlePress = async () => {
    setLoading(true);
    const credentials = {
      email: email,
      password: password,
    };

    try {
      const responseLogin = await dispatch(loginThunk(credentials));
      if (
        responseLogin.type.endsWith("fulfilled") &&
        responseLogin?.payload?.data?.status
      ) {
        const username = responseLogin?.payload?.data?.data?.user?.username;
        ShowToast("success", "Welcome back " + username);
        navigation.navigate(ScreensName.home);
      } else {
        ShowToast(
          "error",
          "Login fail : " + responseLogin?.payload?.message ??
            "Unable to connect. Check your network connection and try again."
        );
      }
    } catch (error) {
      console.log(error);
      ShowToast("error", "Unexpected error");
    }
    setLoading(false);
  };

  const renderLoginMethod = () => {
    return loginMethod.map((item, index) => (
      <RippleButton
        key={index}
        buttonStyle={styles.loginMethod}
        backgroundColor={"rgab(0, 0, 0, 0.5)"}
        onPress={() => {
          item?.onPress ? item.onPress() : null;
        }}
      >
        <Image source={item.icon} style={styles.methodIcon} />
      </RippleButton>
    ));
  };

  return (
    <NonBottomTabWrapper headerHidden={true} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Image source={loginHeaderIcon} style={styles.backgroundImage} />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>Sign in with email</Text>

            <View style={styles.formContainer}>
              <SigninInputField
                state={email}
                setState={setEmail}
                icon={
                  <Ionicons name="mail-outline" size={20} color="#5FC88F" />
                }
                iconBackgroundcolor="#DEF5E9"
                placeholder="Email"
                inputType="email-address"
                keyboardType="email-address"
              />

              <SigninInputField
                state={password}
                setState={setPassword}
                icon={
                  <MaterialIcons name="lock-open" size={20} color="#9F9DF3" />
                }
                iconBackgroundcolor="#EBECFF"
                placeholder="Password"
                secureTextEntry
              />

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(ScreensName.verifyEmail, {
                      type: "resetPassword",
                    });
                  }}
                >
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <RippleButton
                onPress={handlePress}
                buttonText="Sign in"
                buttonStyle={styles.signinButton}
                textStyle={styles.signinButtonText}
                loading={loading}
              />
            </View>

            <View style={styles.loginMethodContainer}>
              {renderLoginMethod()}
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.alreadyText}>
                Don't have account?{" "}
                <Text
                  style={styles.registerText}
                  onPress={() => navigation.navigate(ScreensName.signup)}
                >
                  Register
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </NonBottomTabWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: HEIGHT * 0.25,
    maxHeight: 220,
    minHeight: 150,
  },
  backgroundImage: {
    width: "80%",
    height: "100%",
    resizeMode: "contain",
  },
  formSection: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    paddingTop: 10,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 28 : 26,
    textAlign: "center",
    marginBottom: HEIGHT * 0.02,
    color: "#191C32",
    fontFamily: "Aleo_700Bold",
  },
  formContainer: {
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    gap: HEIGHT * 0.015,
    marginTop: HEIGHT * 0.01,
  },
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "80%",
    marginTop: 5,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
  },
  signinButton: {
    width: "85%",
    backgroundColor: "#191C32",
    padding: HEIGHT * 0.018,
    borderRadius: 50,
    overflow: "hidden",
    marginTop: HEIGHT * 0.02,
  },
  signinButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontFamily: "Aleo_700Bold",
  },
  loginMethodContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: HEIGHT * 0.03,
  },
  loginMethod: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 0,
    width: WIDTH * 0.15,
    height: WIDTH * 0.15,
    maxWidth: 70,
    maxHeight: 70,
    minWidth: 50,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  methodIcon: {
    width: normalize(32),
    height: normalize(32),
    resizeMode: "contain",
  },
  registerContainer: {
    marginTop: HEIGHT * 0.03,
  },
  alreadyText: {
    fontSize: 14,
    fontFamily: "Aleo_400Regular",
    textAlign: "center",
  },
  registerText: {
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "600",
    color: "#191C32",
  },
});

export default Signin;
