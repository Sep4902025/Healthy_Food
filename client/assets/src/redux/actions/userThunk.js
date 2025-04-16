// Import hàm createAsyncThunk từ Redux Toolkit để tạo các thunk action xử lý bất đồng bộ
import { createAsyncThunk } from "@reduxjs/toolkit";
// Import các hàm service để xử lý đăng nhập từ API
import { login, loginGoogle } from "../../services/authService";
// Import AsyncStorage từ thư viện React Native để lưu trữ dữ liệu cục bộ
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tạo thunk action để xử lý đăng nhập thông thường
export const loginThunk = createAsyncThunk(
 "user/login", // Định danh action
 async (credentials, { rejectWithValue }) => { // Hàm thực thi với thông tin đăng nhập và helper
   try {
     // Gọi API đăng nhập với thông tin đăng nhập từ người dùng
     const response = await login(credentials);
     if (response?.data?.token) {
       // Nếu đăng nhập thành công và nhận được token, lưu token vào AsyncStorage
       await AsyncStorage.setItem("accessToken", response.data.token);
     }
     // Trả về dữ liệu phản hồi bao gồm thông tin người dùng, trạng thái và thông báo
     return {
       data: response.data,
       status: response.status,
       message: response?.response?.data?.message,
     };

   } catch (error) {
     // Nếu có lỗi, trả về thông báo lỗi từ API hoặc thông báo mặc định
     return rejectWithValue(error.response?.data || "Something went wrong");
   }
 }
);

// Tạo thunk action để xử lý đăng nhập bằng Google
export const loginGoogleThunk = createAsyncThunk(
 "user/loginGoogle", // Định danh action
 async (credentials, { rejectWithValue }) => { // Hàm thực thi với thông tin xác thực Google và helper
   try {
     // Gọi API đăng nhập Google với thông tin xác thực từ người dùng
     const response = await loginGoogle(credentials);
     if (response?.data?.token) {
       // Nếu đăng nhập thành công và nhận được token, lưu token vào AsyncStorage
       await AsyncStorage.setItem("accessToken", response.data.token);
     }
     // Trả về dữ liệu phản hồi bao gồm thông tin người dùng, trạng thái và thông báo
     return {
       data: response.data,
       status: response.status,
       message: response?.response?.data?.message,
     };

   } catch (error) {
     // Nếu có lỗi, trả về thông báo lỗi từ API hoặc thông báo mặc định
     return rejectWithValue(error.response?.data || "Something went wrong");
   }
 }
);