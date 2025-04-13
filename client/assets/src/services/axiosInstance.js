import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";
import ShowToast from "../components/common/CustomToast";
import { useNavigation } from "@react-navigation/native";
import { ScreensName } from "../constants/ScreensName";
import { navigate } from "../utils/NavigationService";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  responseType: "json",
  timeout: 30000,
  validateStatus: (status) => status >= 200 && status < 300,
});
console.log(process.env.EXPO_PUBLIC_API_URL);

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      ShowToast("error", "Session expired. Please log in again.");
      await AsyncStorage.removeItem("accessToken");

      // Điều hướng về màn hình SignIn
      navigate(ScreensName.signin);
    } else {
      //ShowToast("error", error?.response?.data?.message || "Something went wrong.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
