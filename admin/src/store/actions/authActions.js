import { toast } from "react-toastify";
import { googleLogout } from "@react-oauth/google";
import AuthService from "../../services/auth.service";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserSuccess,
} from "../slices/authSlice";

export const loginWithGoogle = (credential) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const result = await AuthService.googleAuth(credential);

    if (!result.data?.user) {
      throw new Error("User data not found in response");
    }

    if (result.data.user.isBan) {
      toast.error(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
      );
      return false;
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
    dispatch(loginStart());
    const response = await AuthService.login(formData);

    if (response.success) {
      if (response.user.isBan) {
        toast.error(
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
        );
        dispatch(loginFailure("Tài khoản bị khóa"));
        return false;
      }

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );

      toast.success("Đăng nhập thành công!");
      return response;
    } else {
      dispatch(loginFailure(response.message));
      toast.error(response.message || "Đăng nhập thất bại!");
      return false;
    }
  } catch (error) {
    dispatch(loginFailure("Đăng nhập thất bại!")); // Reset trạng thái loading
    toast.error("Đăng nhập thất bại!");
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
