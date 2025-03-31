export const userSelector = (state) => state.user?.user;
export const favorSelector = (state) => state.favorite;
export const drawerSelector = (state) => state.drawer;

// ↑ Tạo và export một selector function để lấy thông tin user từ Redux store

// CHI TIẾT:
// 1. state: Tham số đầu vào là toàn bộ Redux state tree
// 2. state.user: Truy cập vào slice 'user' trong store (định nghĩa bởi rootReducer)
// 3. state.user.user: Truy cập vào property 'user' trong user slice
