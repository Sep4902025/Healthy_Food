// Import hàm createAsyncThunk từ thư viện Redux Toolkit để tạo các thunk actions xử lý bất đồng bộ
import { createAsyncThunk } from "@reduxjs/toolkit";

// Import các hàm service để thao tác với API liên quan đến danh sách yêu thích
import {
  addDishFavorite,    // Hàm thêm món ăn vào danh sách yêu thích
  getFavoriteList,    // Hàm lấy danh sách món ăn yêu thích
  removeDishFavorite, // Hàm xóa món ăn khỏi danh sách yêu thích
} from "../../services/favoriteService";
// Import component hiển thị thông báo toast
import ShowToast from "../../components/common/CustomToast";

// Tạo thunk action để tải danh sách món ăn yêu thích
export const loadFavorites = createAsyncThunk(
  "favorites/loadFavorites", // Định danh action
  async (_, { getState, rejectWithValue }) => { // Hàm thực thi với tham số rỗng và các helper từ Redux Toolkit
    try {
      // Gọi API lấy danh sách yêu thích của người dùng đang đăng nhập
      const response = await getFavoriteList(getState()?.user?.user?._id);
      if (response.status === 200) { // Nếu API trả về thành công
        // Chuyển đổi dữ liệu response thành danh sách chỉ chứa ID của các món ăn
        const idxList = response?.data?.data.map((item) => {
          return item.dishId._id; // Lấy ID của món ăn
        });
        return idxList; // Trả về danh sách ID
      } else {
        return []; // Trả về mảng rỗng nếu có lỗi hoặc không có dữ liệu
      }
    } catch (error) {
      // Ghi log lỗi vào console
      console.error("Lỗi khi tải danh sách yêu thích:", error);
      // Trả về lỗi thông qua rejectWithValue để xử lý trong reducer
      return rejectWithValue("Không thể tải danh sách yêu thích");
    }
  }
);

// Tạo thunk action để thêm/xóa món ăn khỏi danh sách yêu thích (toggle)
export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite", // Định danh action
  async ({ id }, { getState, rejectWithValue }) => { // Hàm thực thi với id món ăn và các helper
    try {
      // Kiểm tra nếu người dùng chưa đăng nhập thì hiển thị thông báo
      if (!getState()?.user?.user) {
        ShowToast("error", "Please, login to use this feature");
        return []; // Trả về mảng rỗng
      }
      
      // Lấy danh sách món ăn yêu thích hiện tại từ state
      const favoriteList = getState().favorite.favoriteList;

      // Kiểm tra nếu món ăn đã có trong danh sách yêu thích
      if (favoriteList?.includes(id)) {
        // Nếu đã có thì gọi API xóa khỏi danh sách yêu thích
        const response = await removeDishFavorite(
          getState()?.user?.user?._id, // ID người dùng
          id // ID món ăn
        );
        if (response?.status === 200) { // Nếu API trả về thành công
          // Hiển thị thông báo thành công
          ShowToast("success", "Remove from favorite successfull");
          // Trả về danh sách mới đã loại bỏ món ăn
          return favoriteList.filter((itemId) => itemId !== id);
        }
      } else {
        // Nếu chưa có thì gọi API thêm vào danh sách yêu thích
        const response = await addDishFavorite(getState()?.user?.user?._id, id);
       
        if (response?.status === 201) { // Nếu API trả về thành công
          // Hiển thị thông báo thành công
          ShowToast("success", "Add to favorite successfull");
          // Trả về danh sách mới đã thêm món ăn
          return [...favoriteList, id];
        }
      }
    } catch (error) {
      // Ghi log lỗi vào console
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
      // Trả về lỗi thông qua rejectWithValue để xử lý trong reducer
      return rejectWithValue("Không thể lưu danh sách yêu thích");
    }
  }
);