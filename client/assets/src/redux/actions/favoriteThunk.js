import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  addDishFavorite,
  getFavoriteList,
  removeDishFavorite,
} from "../../services/favoriteService";
import ShowToast from "../../components/common/CustomToast";

export const loadFavorites = createAsyncThunk(
  "favorites/loadFavorites",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await getFavoriteList(getState()?.user?.user?._id);
      if (response.status === 200) {
        const idxList = response?.data?.data.map((item) => {
          return item.dishId._id;
        });
        return idxList;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error);
      return rejectWithValue("Không thể tải danh sách yêu thích");
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async ({ id }, { getState, rejectWithValue }) => {
    try {
      if (!getState()?.user?.user) {
        ShowToast("error", "Please, login to use this feature");
        return [];
      }
      
      const favoriteList = getState().favorite.favoriteList;

      if (favoriteList?.includes(id)) {
        
        const response = await removeDishFavorite(
          getState()?.user?.user?._id,
          id
        );
        if (response?.status === 200) {
          ShowToast("success", "Remove from favorite successfull");
          return favoriteList.filter((itemId) => itemId !== id);
        }
      } else {
        const response = await addDishFavorite(getState()?.user?.user?._id, id);
       
        if (response?.status === 201) {
          ShowToast("success", "Add to favorite successfull");
          return [...favoriteList, id];
        }
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
      return rejectWithValue("Không thể lưu danh sách yêu thích");
    }
  }
);
