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
import UserService from "../../services/user.service";

export const loginWithGoogle = (credential) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const result = await AuthService.googleAuth(credential);

    if (!result.data?.user) {
      throw new Error("User data not found in response");
    }

    if (result.data.user.isBan) {
      toast.error("Your account has been locked. Please contact the administrator.");
      return false;
    }

    dispatch(
      loginSuccess({
        user: result.data.user,
        token: result.token,
      })
    );

    toast.success(result.message || "Login successful!");
    return true;
  } catch (error) {
    const data = error?.response?.data;
    console.error("Lỗi đăng nhập:", data || error);
    dispatch(loginFailure(data?.message || "Login failed!"));
    toast.error(data?.message || "Something went wrong. Please try again!");
    return false;
  }
};

export const loginWithEmail = (formData) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await AuthService.login(formData);

    if (response.success) {
      if (response.user.isBan) {
        toast.error("Your account has been locked. Please contact the administrator.");
        dispatch(loginFailure("Your account has been locked."));
        return false;
      }

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );

      toast.success("Signin successfully!");
      return response;
    } else {
      dispatch(loginFailure(response.message));
      toast.error(response.message || "Login failed!");
      return false;
    }
  } catch (error) {
    dispatch(loginFailure("Login failed!")); // Reset trạng thái loading
    toast.error("Login failed!");
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
};

export const updateUser = (userData) => async (dispatch) => {
  try {
    const { _id, ...data } = userData; // Extract _id and the rest as data
    if (!_id) {
      toast.error("User ID not found!");
      return false;
    }

    const response = await UserService.updateUser(_id, data);

    if (response.success) {
      dispatch(updateUserSuccess(response.user)); // Cập nhật Redux state
      toast.success("Avatar update successful!");
      return response.user; // Trả về user mới
    } else {
      toast.error(response.message || "Update failed!");
      return false;
    }
  } catch (error) {
    console.error("User update error:", error);
    toast.error(error.message || "Something went wrong. Please try again!");
    return false;
  }
};
