
import * as WebBrowser from "expo-web-browser"; 
import * as Google from "expo-auth-session/providers/google"; 
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { useState, useEffect } from "react";
import { Platform, Modal, View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview"; 


WebBrowser.maybeCompleteAuthSession();


const googleConfig = {
  
  androidClientId:
    "155145337295-8k2hph51rqh94qmi1lpp93ro72vg1kva.apps.googleusercontent.com",
 
  iosClientId:
    "155145337295-voo79g6h7n379738rce0ipoo4qoj1dom.apps.googleusercontent.com",
  scopes: ["openid", "profile", "email"], 
};


export const useGoogleAuth = () => {

  const [userInfo, setUserInfo] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [authUrl, setAuthUrl] = useState(""); 

  
  const [request, response, promptAsync] = Google.useAuthRequest({
    ...googleConfig,
    selectAccount: true, 
    usePKCE: true, 
    responseType: "code", 
    redirectUri: "com.tructht.HealthyFoodApp://", 
  });

 
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleSuccessfulLogin(authentication.accessToken);
      setShowModal(false);
    } else if (response?.type === "error") {
      setError(response.error?.message || "Authentication failed");
      setShowModal(false);
    }
  }, [response]);

 
  const handleSuccessfulLogin = async (accessToken) => {
    try {
    
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const userData = await userInfoResponse.json();

      
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await AsyncStorage.setItem("googleToken", accessToken);

      setUserInfo(userData);
    } catch (err) {
      setError("Failed to fetch user info");
      console.error(err);
    }
  };

 
  const handleNavigationStateChange = (navState) => {
    
    if (navState.url.includes("access_token=")) {
      const accessToken = navState.url.split("access_token=")[1].split("&")[0];
      handleSuccessfulLogin(accessToken);
      setShowModal(false);
    }

    if (navState.url.includes("error=")) {
      setShowModal(false);
      setError("Authentication cancelled");
    }
  };


  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const authUrlResult = await promptAsync({
        useProxy: false,
        showInRecents: false,
        returnUrl: false,
      });

      if (authUrlResult?.url) {
        setAuthUrl(authUrlResult.url);
        setShowModal(true);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const signOut = async () => {
    try {
     
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("googleToken");
      setUserInfo(null);
    } catch (error) {
      setError(error.message);
    }
  };

  
  const AuthModal = () => (
    <Modal
      visible={showModal}
      onRequestClose={() => setShowModal(false)}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <WebView
            source={{ uri: authUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            style={styles.webview}
            incognito={true} 
            sharedCookiesEnabled={false} 
          />
        </View>
      </View>
    </Modal>
  );


  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          setUserInfo(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
      }
    };
    checkExistingSession();
  }, []);

  return {
    signIn,
    signOut,
    userInfo,
    loading,
    error,
    AuthModal,
  };
};


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  webview: {
    flex: 1, 
  },
});
