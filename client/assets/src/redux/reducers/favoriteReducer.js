
import { createSlice } from "@reduxjs/toolkit";
import { loadFavorites, toggleFavorite } from "../actions/favoriteThunk";



const initialState = {
  favoriteList: [], 
  isLoading: false, 
  error: null, 
};


const favoritesSlice = createSlice({
  name: "favorites", 
  initialState,

  
  reducers: {
    
    clearError: (state) => {
      state.error = null;
    },
  },

  
  extraReducers: (builder) => {
    builder
      
      .addCase(loadFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.favoriteList = action.payload;
        state.isLoading = false;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

     
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favoriteList = action.payload;
        state.isLoading = false;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});


export const { clearError } = favoritesSlice.actions;


export default favoritesSlice.reducer;
