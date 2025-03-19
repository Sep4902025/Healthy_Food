import { configureStore } from "@reduxjs/toolkit";
// Import rootReducer - là tập hợp tất cả các reducers của ứng dụng được combine lại
import rootReducer from "./reducers/rootReducer";

// Tạo Redux store sử dụng configureStore
// configureStore tự động setup một số middleware hữu ích như redux-thunk và redux-devtools
const store = configureStore({
  // Truyền rootReducer vào để quản lý state của toàn bộ ứng dụng
  reducer: rootReducer,
});

export default store;
