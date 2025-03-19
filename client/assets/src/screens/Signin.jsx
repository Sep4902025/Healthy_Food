
import React, { use, useEffect, useState } from "react";
import {
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  Image,
  Platform, 
  KeyboardAvoidingView, 
} from "react-native";


import SafeAreaWrapper from "../components/layout/SafeAreaWrapper"; 
import SigninInputField from "../components/common/SigninInputField"; 
import Ionicons from "../components/common/VectorIcons/Ionicons"; 
import MaterialIcons from "../components/common/VectorIcons/MaterialIcons"; 
import DecorationDot from "../components/common/DecorationDot"; 
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


const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function Signin({ navigation }) {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch(); 
  const { signIn, userInfo, error } = useGoogleAuth();

  
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
      
      ShowToast("success", "Đăng nhập thành công");
      if (
        responseLogin.type.endsWith("fulfilled") &&
        responseLogin?.payload?.data?.status
      ) {
        const username = responseLogin?.payload?.data?.data?.user?.username;
        ShowToast("success", "Welcome back " + username);
        navigation.navigate(ScreensName.home);
      } else {
        ShowToast("error", "Login fail : " + responseLogin?.payload?.message);
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
        <Image
          source={item.icon}
          style={{
            width: 32,
            height: 32,
            resizeMode: "contain",
          }}
        />
      </RippleButton>
    ));
  };

  
  return (
    <NonBottomTabWrapper headerHidden={true} style={styles.container}>
      
      <Image source={loginHeaderIcon} style={styles.backgroundImage} />
      <Text style={styles.title}>Sign in with email</Text>

      
      <View style={styles.formContainer}>
        
        <SigninInputField
          state={email}
          setState={setEmail}
          icon={<Ionicons name="mail-outline" size={20} color="#5FC88F" />}
          iconBackgroundcolor="#DEF5E9"
          placeholder="Email"
          inputType="email-address"
          keyboardType="email-address"
        />
        
        <SigninInputField
          state={password}
          setState={setPassword}
          icon={<MaterialIcons name="lock-open" size={20} color="#9F9DF3" />}
          iconBackgroundcolor="#EBECFF"
          placeholder="Password"
          secureTextEntry
        />
       
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(ScreensName.verifyEmail);
          }}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <RippleButton
          onPress={handlePress}
          buttonText="Sign in"
          buttonStyle={styles.signinButton}
          textStyle={styles.signinButtonText}
          loading={loading}
        />
      </View>

    
      <View style={styles.loginMethodContainer}>{renderLoginMethod()}</View>
      <Text style={styles.alreadyText}>
        Don't have account?{" "}
        <Text
          style={{
            textDecorationLine: "underline",
            fontSize: 16, 
          }}
          onPress={() => navigation.navigate(ScreensName.signup)}
        >
          Register
        </Text>
      </Text>
    </NonBottomTabWrapper>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  backgroundImage: {
   
    height: "30%", 
    resizeMode: "contain", 
    
  
  },
  title: {
    fontSize: 30, 
    textAlign: "center", 
    marginBottom: 20, 
    color: "#191C32", 
    fontFamily: "Aleo_700Bold",
  },
  formContainer: {
    width: WIDTH, 
    justifyContent: "space-around", 
    alignItems: "center", 
    gap: 20, 
  },
  forgotPassword: {
    width: WIDTH * 0.85, 
    textAlign: "right", 
    fontWeight: "600", 
    transform: [{ translateY: -10 }], 
  },
  signinButton: {
    width: WIDTH * 0.85, 
    backgroundColor: "#191C32", 
    padding: 18, 
    borderRadius: 50, 
    overflow: "hidden", 
  },
  signinButtonText: {
    textAlign: "center", 
    color: "#fff", 
    fontSize: 18, 
    
    fontFamily: "Aleo_700Bold",
  },
  loginMethodContainer: {
    flexDirection: "row", 
    gap: 20,
    justifyContent: "center",
    alignItems: "center", 
    marginTop: 20, 
  },
  loginMethod: {
    backgroundColor: "white",
    borderRadius: 50, 
    padding: 20, 
    width: 80, 
    height: 80, 
    justifyContent: "center", 
    alignItems: "center", 
  },
  alreadyText: {
    marginHorizontal: 8, 
    marginVertical: 24, 
    fontSize: 16, 
    fontFamily: "Aleo_400Regular", 
    zIndex: 10,
  },
});

export default Signin;
