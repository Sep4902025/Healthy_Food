import { createSlice } from "@reduxjs/toolkit";
import { loginThunk, loginGoogleThunk } from "../actions/userThunk"; // Thêm import loginGoogleThunk
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUserAct: (state, action) => {
      state.user = action.payload;
    },
    removeUser: (state) => {
      AsyncStorage.removeItem("accessToken");
      state.user = null;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý loginThunk (giữ nguyên)
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = {
          ...action.payload?.data?.data?.user,
          accessToken: action.payload?.data?.token,
        };
        state.loading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Thêm xử lý cho loginGoogleThunk
      .addCase(loginGoogleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginGoogleThunk.fulfilled, (state, action) => {
        state.user = {
          ...action.payload?.data?.data?.user, // Dữ liệu người dùng từ backend
          accessToken: action.payload?.data?.token, // Lưu token vào state
        };
        state.loading = false;
      })
      .addCase(loginGoogleThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { updateUserAct, removeUser } = userSlice.actions;
export default userSlice.reducer;
