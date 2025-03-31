
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  visible: false,
};
const drawerSlice = createSlice({
  initialState,
  name: "drawer",
  reducers: {
    toggleVisible: (state) => {
      if (state.visible) {
        state.visible = false;
      } else {
        state.visible = true;
      }
    },
    updateVisible: (state, action) => {
      state.visible = action.payload?.visible;
    },
  },
});

export const { toggleVisible, updateVisible } = drawerSlice.actions;

export default drawerSlice.reducer;
