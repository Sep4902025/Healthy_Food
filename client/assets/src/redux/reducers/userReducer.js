
import { createSlice } from "@reduxjs/toolkit";

import { loginThunk } from "../actions/userThunk";
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
      state.user = null; 
    },
  },

  
  extraReducers: (builder) => {
    builder
      
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
      });
  },
});


export const { updateUserAct, removeUser } = userSlice.actions;

export default userSlice.reducer;
