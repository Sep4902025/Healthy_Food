import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { makeRedirectUri, ResponseType } from "expo-auth-session";
import { loginGoogle } from "../services/authService";
import { useDispatch } from "react-redux";
import { loginGoogleThunk } from "../redux/actions/userThunk";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "568478966262-63s7pm2ultokmuvieevje9ctjdk0lj1e.apps.googleusercontent.com",
    iosClientId: "155145337295-voo79g6h7n379738rce0ipoo4qoj1dom.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({ native: "com.tructht.HealthyFoodApp:/oauthredirect" }),
    scopes: ["openid", "profile", "email"],
    responseType: ResponseType.Code,
    usePKCE: true,
    // Add prompt: "select_account" to force account picker
    prompt: "select_account",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response?.authentication?.idToken;
      if (idToken) {
        getUserDataByIdtoken(idToken);
      } else {
        console.error("No idToken found:", response);
        setError("Failed to retrieve login information");
      }
    } else if (response?.type === "error") {
      console.error("Google Sign-In Error:", response.error);
      setError(response.error?.message || "Sign-in failed");
    }
  }, [response]);

  const signIn = async () => {
    if (loading || !request) return; // Prevent multiple calls
    setLoading(true);
    setError(null);
    try {
      await promptAsync({ useProxy: false });
    } catch (err) {
      console.error("Error during promptAsync:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserDataByIdtoken = async (idToken) => {
    try {
      const credentials = { idToken };
      await dispatch(loginGoogleThunk(credentials));
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(["userData", "googleToken"]);
      setUserInfo(null);
      // Clear WebBrowser session to ensure Google forgets the previous account
      await WebBrowser.clearAllSessionsAsync();
    } catch (err) {
      console.error("Error during sign-out:", err);
      setError("Failed to sign out");
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem("userData");
        if (data) setUserInfo(JSON.parse(data));
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };
    loadUser();
  }, []);

  return { signIn, signOut, userInfo, loading, error };
};
