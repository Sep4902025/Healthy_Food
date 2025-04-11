// PHẦN 1: IMPORTS
import { combineReducers } from "redux";
// ↑ Import hàm combineReducers từ thư viện Redux
// combineReducers là một hàm quan trọng được sử dụng để gộp nhiều reducers nhỏ
// thành một reducer lớn (rootReducer)

import userReducer from "./userReducer";
import favoriteReducer from "./favoriteReducer";
import drawerReducer from "./drawerReducer";
// ↑ Import reducer xử lý các actions liên quan đến user
// userReducer sẽ quản lý các state như thông tin đăng nhập, profile user,...

// PHẦN 2: TẠO ROOT REDUCER
const rootReducer = combineReducers({
  user: userReducer,
  favorite: favoriteReducer,
  drawer: drawerReducer,
});
// ↑ Tạo rootReducer bằng cách kết hợp các reducers con
// - Khóa 'user' xác định tên của state slice trong Redux store
// - Khi truy cập state, ta sẽ dùng: state.user
// - Ví dụ: state.user.profile, state.user.isLoggedIn,...
// - Có thể thêm nhiều reducers khác như: auth: authReducer, cart: cartReducer,...

export default rootReducer;
// ↑ Export rootReducer để sử dụng trong store configuration
// Thường sẽ được import trong file store.js để tạo Redux store
