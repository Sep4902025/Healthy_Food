import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";
import ShowToast from "../components/common/CustomToast";

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

  (error) => {
    ShowToast("error", error?.response?.data?.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
