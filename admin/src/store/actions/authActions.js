import { toast } from "react-toastify";
import { googleLogout } from "@react-oauth/google";
import AuthService from "../../services/auth.service";
import { loginStart, loginSuccess, loginFailure, logout, updateUserSuccess } from "../slices/authSlice";

export const loginWithGoogle = (credential) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const result = await AuthService.googleAuth(credential);

    if (!result.data?.user) {
      throw new Error("User data not found in response");
    }

    dispatch(
      loginSuccess({
        user: result.data.user,
        token: result.token,
      })
    );

    toast.success(result.message || "Đăng nhập thành công!");
    return true;
  } catch (error) {
    const data = error?.response?.data;
    console.error("Lỗi đăng nhập:", data || error);
    dispatch(loginFailure(data?.message || "Đăng nhập thất bại"));
    toast.error(data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
    return false;
  }
};

export const loginWithEmail = (formData) => async (dispatch) => {
  try {
    dispatch(loginStart()); // Đánh dấu loading
    const response = await AuthService.login(formData);

    if (response.success) {
      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );

      toast.success("Đăng nhập thành công!");
      return response; // Trả về response để lấy thông tin role
    } else {
      dispatch(loginFailure(response.message));
      toast.error(response.message || "Đăng nhập thất bại!");
      return false;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Đăng nhập thất bại!";
    dispatch(loginFailure(errorMessage));
    toast.error(errorMessage);
    return false;
  }
};

export const logoutUser = () => (dispatch) => {
  // Đăng xuất khỏi Google
  googleLogout();

  // Clear localStorage
  localStorage.clear();

  // Clear Redux state
  dispatch(logout());

  // Xóa cookie Google
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  toast.success("Đăng xuất thành công!");
};

export const updateUser = (userData) => async (dispatch) => {
  try {
    const response = await AuthService.updateUser(userData);

    if (response.success) {
      dispatch(updateUserSuccess(response.user)); // Cập nhật Redux state
      toast.success("Cập nhật thông tin thành công!");
      return response.user; // Trả về user mới
    } else {
      toast.error(response.message || "Cập nhật thất bại!");
      return false;
    }
  } catch (error) {
    console.error("Lỗi cập nhật user:", error);
    toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
    return false;
  }
};
