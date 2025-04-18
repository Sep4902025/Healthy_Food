import { createSlice } from "@reduxjs/toolkit";
import { loginGoogleThunk, loginThunk } from "../actions/userThunk";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  user: null,
  accessToken: null, // Store accessToken separately
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    updateUserAct: (state, action) => {
      // Preserve accessToken when updating user
      state.user = {
        ...state.user, // Keep existing user properties
        ...action.payload, // Update with new properties
      };
    },
    removeUser: (state) => {
      AsyncStorage.removeItem("accessToken");
      state.user = null;
      state.accessToken = null; // Clear accessToken
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload?.data?.data?.user;
        state.accessToken = action.payload?.data?.token; // Store accessToken separately
        state.loading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(loginGoogleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginGoogleThunk.fulfilled, (state, action) => {
        state.user = action.payload?.data?.data?.user;
        state.accessToken = action.payload?.data?.token; // Store accessToken separately
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
