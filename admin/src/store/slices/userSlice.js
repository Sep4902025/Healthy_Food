import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  username: "",
  email: "",
  avatarUrl: "",
  role: "", //
  token: "",
  onlineUser: [],
  socketConnection: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state._id = action.payload._id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.avatarUrl = action.payload.avatarUrl;
      state.role = action.payload.role;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state._id = "";
      state.username = "";
      state.email = "";
      state.avatarUrl = "";
      state.role = "";
      state.token = "";
      state.socketConnection = null;
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
  },
});

// Export actions
export const { setUser, setToken, logout, setOnlineUser, setSocketConnection } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
