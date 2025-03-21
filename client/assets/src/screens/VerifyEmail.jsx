
import React, { use, useCallback, useState } from "react";
import {
  Text, 
  View, 
  StyleSheet, 
  Image, 
  TextInput, 
  Dimensions, 
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; 


import SafeAreaWrapper from "../components/layout/SafeAreaWrapper"; 
import RippleButton from "../components/common/RippleButton"; 
import { ScreensName } from "../constants/ScreensName"; 


import sadCactusIcon from "../../assets/image/sad_cactus.png"; 
import happyCactusIcon from "../../assets/image/happy_cactus.png"; 
import { forgetPassword, verifyOtp } from "../services/authService"; 
import OTPInput from "../components/common/OtpInput";


const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function VerifyEmail({ navigation }) {
 
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(""); 
  const [otpAmount] = useState(4); 
  const [isCodeSent, setIsCodeSent] = useState(false); 

 
  useFocusEffect(
    React.useCallback(() => {
      setIsCodeSent(false);
    }, [])
  );


  const handleSubmitEmail = async () => {
    const response = await forgetPassword({ email: email.trim() });
    if (response.status === 200) {
      setIsCodeSent(true);
    } else {
      console.log(response);
    }
  };


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

  
  const handleResendCode = async () => {
    await handleSubmitEmail();
  };


  const handleBackToEmail = () => {
    setIsCodeSent(false);
    setVerificationCode("");
  };


  const handleCodeChange = (value) => {
    setVerificationCode(value);
    if (value.length === otpAmount) {
      console.log("Complete OTP:", value);
      handleVerifyCode(value);
    }
  };

  return (
    <SafeAreaWrapper headerStyle={{ backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
         
          <Image
            source={isCodeSent ? happyCactusIcon : sadCactusIcon}
            style={styles.cactusIcon}
          />

         
          <Text style={styles.title}>
            {isCodeSent ? "Success" : "Forget Password"}
          </Text>


          <Text style={styles.subtitle}>
            {isCodeSent
              ? "Please check your email for create\na new password"
              : "Enter your registered email below"}
          </Text>

        
          {!isCodeSent ? (
            <>
             
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.emailInput}
                placeholder="emirhan.begg@gmail.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

          
              <RippleButton
                buttonStyle={styles.submitButton}
                buttonText="Submit"
                textStyle={styles.buttonText}
                onPress={handleSubmitEmail}
              />


              <Text style={styles.bottomText}>
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
            
              <View style={styles.codeContainer}>
                <OTPInput
                  length={otpAmount}
                  value={verificationCode}
                  onChange={handleCodeChange}
                />
              </View>

              
              <Text style={styles.bottomText}>
                Can't get email?{" "}
                <Text style={styles.linkText} onPress={handleResendCode}>
                  Resubmit
                </Text>
              </Text>

            
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F5F5F5",
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
    color: "#40B491",
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
