
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
  PixelRatio,
} from "react-native";


import { LinearGradient } from "expo-linear-gradient";


import SafeAreaWrapper from "../components/layout/SafeAreaWrapper";
import RippleButton from "../components/common/RippleButton";
import SplitLine from "../components/common/SplitLine";

import backgroundImage from "../../assets/image/welcome_bg.png";
import googleIcon from "../../assets/image/google_icon.png";
import fbIcon from "../../assets/image/fb_logo_square.png";
import appleIcon from "../../assets/image/apple_logo.png";
import { ScreensName } from "../constants/ScreensName";
import { TouchableOpacity } from "react-native";


const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;


function Welcome({ navigation }) {
  const [buttonWidth, setButtonWidth] = useState(WIDTH);


  const onPressGoogleButton = () => {
   
  };

  const onPressFacebookButton = () => {
   
  };

  const onPressAppleButton = () => {
 
  };

  const onPressSignupButton = () => {
    navigation.navigate(ScreensName.signup);
  };

  const getTextWidth = (text, fontSize, fontFamily) => {
    const scaledFontSize = fontSize * PixelRatio.getFontScale();
    
    const extraPadding = 0; 
    return text.length * scaledFontSize * 0.6 + extraPadding; 
  };

  const calculateMaxButtonWidth = () => {
    const buttonTexts = [
      "Sign up with email",
      "Continue with Google",
      "Continue with Facebook",
      "Continue with Apple",
    ];

    const textWidths = buttonTexts.map((text) =>
      getTextWidth(text, 18, "Aleo_700Bold")
    );

 
    const maxWidth = Math.min(Math.max(...textWidths), WIDTH * 0.8);

    setButtonWidth(maxWidth);
  };


  useEffect(() => {
    calculateMaxButtonWidth();
  }, []);


  const buttonList = [
    {
      text: "Continue with Google",
      icon: (
        <Image
          source={googleIcon}
          style={{ width: 20, height: 20, ...styles.iconStyle }}
        />
      ),
      onPress: onPressGoogleButton,
    },
    {
      text: "Continue with Facebook",
      icon: (
        <Image
          source={fbIcon}
          style={{ width: 20, height: 20, ...styles.iconStyle }}
        />
      ),
      onPress: onPressFacebookButton,
    },
    {
      text: "Continue with Apple",
      icon: (
        <Image
          source={appleIcon}
          style={{ width: 20, height: 20, ...styles.iconStyle }}
        />
      ),
      textStyle: { transform: [{ translateY: 3 }] },
      onPress: onPressAppleButton,
    },
  ];

 
  return (
    <SafeAreaWrapper
      headerStyle={{ theme: "light", backgroundColor: "transparent" }}
    >
     
      <Image source={backgroundImage} style={styles.backgroundImage} />

     
      <LinearGradient
        colors={[
          "transparent",
          "rgba(64, 180, 145, 0.2)",
          "rgba(64, 180, 145, 0.4)",
          "rgba(64, 180, 145,0.6)",
          "rgba(64, 180, 145, 0.8)",
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
       
        <View style={styles.view}>
          {/* Sign up with email button */}
          <RippleButton
            buttonStyle={{
              ...styles.socialButtonStyle,
              backgroundColor: "#191C32",
              justifyContent: "center",
            }}
            buttonText={"Sign up with email"}
            textStyle={{ ...styles.textStyle, color: "#ffffff" }}
            onPress={onPressSignupButton}
          />

          
          <SplitLine
            text="or use social sign up"
            textStyle={styles.splitTextStyle}
            lineStyle={styles.splitLineStyle}
          />

          
          {buttonList.map((item, index) => (
            <RippleButton
              key={index}
              buttonStyle={{
                ...styles.socialButtonStyle,
                ...item.buttonStyle,
              }}
              leftButtonIcon={item.icon}
              buttonText={item.text}
              textStyle={{ ...styles.textStyle, ...item.textStyle }}
              contentContainerStyle={{
                ...styles.buttonContainerStyle,
                width: buttonWidth,
              }}
              onPress={item.onPress}
              backgroundColor={"rgba(0, 0, 0, 0.2)"}
            />
          ))}

          
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
      </LinearGradient>
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
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 50,
  },
  socialButtonStyle: {
    flexDirection: "row",
    width: "80%",
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

export default Welcome;
