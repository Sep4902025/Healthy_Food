
import { createAsyncThunk } from "@reduxjs/toolkit";
import { login, loginGoogle } from "../../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginThunk = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      if (response?.data?.token) {

        await AsyncStorage.setItem("accessToken", response.data.token);
      }
      return {
        data: response.data,
        status: response.status,
        message: response?.response?.data?.message,

      };

    } catch (error) {

      return rejectWithValue(error.response?.data || "Something went wrong");

    }
  }
);

export const loginGoogleThunk = createAsyncThunk(
  "user/loginGoogle",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginGoogle(credentials);
      if (response?.data?.token) {
        await AsyncStorage.setItem("accessToken", response.data.token);
      }
      return {
        data: response.data,
        status: response.status,
        message: response?.response?.data?.message,

      };

    } catch (error) {

      return rejectWithValue(error.response?.data || "Something went wrong");

    }
  }
);

 