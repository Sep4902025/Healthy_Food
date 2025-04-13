// PHẦN 1: IMPORTS
import { createSlice } from "@reduxjs/toolkit";
// ↑ Import createSlice từ Redux Toolkit để tạo reducer và actions
import { loginThunk } from "../actions/userThunk";
import AsyncStorage from "@react-native-async-storage/async-storage";
// ↑ Import action creator xử lý đăng nhập đã tạo trước đó

// PHẦN 2: KHỞI TẠO STATE
const initialState = {
  user: null, // Thông tin user
  loading: false, // Trạng thái loading
  error: null, // Thông tin lỗi nếu có
};

// PHẦN 3: TẠO SLICE
const userSlice = createSlice({
  name: "user", // Tên của slice, sẽ là prefix cho các action
  initialState, // State ban đầu

  // Các reducers thông thường - xử lý sync actions
  reducers: {
    updateUserAct: (state, action) => {
      state.user = action.payload; // Cập nhật thông tin user
    },
    removeUser :  (state) => {
      AsyncStorage.removeItem("accessToken");
      state.user = null; // Xóa thông tin user (logout)
      return state
    },
  },

  // Xử lý các async actions từ thunk
  extraReducers: (builder) => {
    builder
      // Khi bắt đầu gọi API đăng nhập
      .addCase(loginThunk.pending, (state) => {
        state.loading = true; // Set loading
        state.error = null; // Reset error
      })
      // Khi API đăng nhập thành công
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = {
          ...action.payload?.data?.data?.user,
          accessToken: action.payload?.data?.token,
        }; // Lưu thông tin user
        state.loading = false; // Tắt loading
      })
      // Khi API đăng nhập thất bại
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.payload; // Lưu thông tin lỗi
        state.loading = false; // Tắt loading
      });
  },
});

// PHẦN 4: EXPORTS
// Export các action creators
export const { updateUserAct, removeUser } = userSlice.actions;
// Export reducer
export default userSlice.reducer;
