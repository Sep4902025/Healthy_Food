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
    iosClientId: "568478966262-63s7pm2ultokmuvieevje9ctjdk0lj1e.apps.googleusercontent.com",
    expoClientId: "568478966262-63s7pm2ultokmuvieevje9ctjdk0lj1e.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({ native: "com.tructht.healthyfoodapp:/oauthredirect" }),
    scopes: ["openid", "profile", "email"],
    responseType: ResponseType.Code, // Chỉnh sửa tại đây
    usePKCE: true, // Bật PKCE nếu sử dụng responseType.Code
  });
  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response?.authentication?.idToken;
      if (idToken) getUserDataByIdtoken(idToken);
    } else if (response?.type === "error") {
      setError("Authentication failed");
    }
  }, [response]);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await promptAsync({ useProxy: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserDataByIdtoken = async (idtoken) => {
    const credentials = {
      idToken: idtoken,
    };
    dispatch(loginGoogleThunk(credentials));
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(["userData", "googleToken"]);
    setUserInfo(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("userData");
      if (data) setUserInfo(JSON.parse(data));
    };
    loadUser();
  }, []);

  return { signIn, signOut, userInfo, loading, error };
};
