// Import thư viện để xử lý trình duyệt web trong ứng dụng Expo
import * as WebBrowser from "expo-web-browser";
// Import các công cụ xác thực Google từ expo-auth-session
import * as Google from "expo-auth-session/providers/google";
// Import AsyncStorage để lưu trữ dữ liệu cục bộ
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import hooks từ React
import { useState, useEffect } from "react";
// Import các hàm tiện ích từ expo-auth-session
import { makeRedirectUri, ResponseType } from "expo-auth-session";
// Import hàm gọi API đăng nhập Google
import { loginGoogle } from "../services/authService";
// Import hook useDispatch từ react-redux để gửi actions
import { useDispatch } from "react-redux";
// Import action thunk cho đăng nhập Google
import { loginGoogleThunk } from "../redux/actions/userThunk";

// Hoàn thành phiên xác thực nếu đang trong quá trình xác thực
WebBrowser.maybeCompleteAuthSession();

// Custom hook để xử lý xác thực Google
export const useGoogleAuth = () => {
  // State lưu trữ thông tin người dùng
  const [userInfo, setUserInfo] = useState(null);
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(false);
  // State quản lý lỗi
  const [error, setError] = useState(null);
  // Hook dispatch để gửi actions đến Redux store
  const dispatch = useDispatch()

  // Sử dụng hook useAuthRequest từ expo-auth-session để cấu hình xác thực Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '155145337295-8k2hph51rqh94qmi1lpp93ro72vg1kva.apps.googleusercontent.com', // Client ID cho Android
    iosClientId: '155145337295-voo79g6h7n379738rce0ipoo4qoj1dom.apps.googleusercontent.com', // Client ID cho iOS
    expoClientId: '155145337295-9479lepiisp13mebfporopgbcdpe64hi.apps.googleusercontent.com', // Client ID cho Expo
    redirectUri: makeRedirectUri({ native: 'com.tructht.healthyfoodapp:/oauthredirect' }), // URL chuyển hướng sau khi xác thực
    scopes: ['openid', 'profile', 'email'], // Phạm vi quyền truy cập yêu cầu
    responseType: ResponseType.Code,  // Loại phản hồi: Yêu cầu mã xác thực thay vì token trực tiếp
    usePKCE: true,  // Bật PKCE (Proof Key for Code Exchange) để tăng bảo mật
  });

  // Xử lý phản hồi từ Google sau khi xác thực
  useEffect(() => {
    console.log(response);

    if (response?.type === "success") {
      const idToken = response?.authentication?.idToken
      
      // Nếu có idToken, gọi hàm xử lý dữ liệu người dùng
      if (idToken) getUserDataByIdtoken(idToken);
    } else if (response?.type === "error") {
      setError("Authentication failed"); // Đặt thông báo lỗi nếu xác thực thất bại
    }
  }, [response]);

  // Hàm bắt đầu quá trình đăng nhập
  const signIn = async () => {
    setLoading(true); // Bắt đầu trạng thái loading
    setError(null); // Xóa lỗi cũ (nếu có)
    try {
      await promptAsync({ useProxy: false }); // Hiển thị màn hình xác thực Google
    } catch (err) {
      setError(err.message); // Lưu thông báo lỗi nếu có
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };

  // Hàm xử lý dữ liệu người dùng từ idToken
  const getUserDataByIdtoken = async (idtoken) => {
    const credentials = {
      idToken: idtoken,
    };
    // Gửi action thunk để xử lý đăng nhập Google
    dispatch(loginGoogleThunk(credentials))
  }

  // Hàm đăng xuất
  const signOut = async () => {
    // Xóa dữ liệu người dùng và token từ AsyncStorage
    await AsyncStorage.multiRemove(["userData", "googleToken"]);
    // Đặt lại state userInfo về null
    setUserInfo(null);
  };

  // Tự động tải dữ liệu người dùng từ AsyncStorage khi component được mount
  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("userData");
      if (data) setUserInfo(JSON.parse(data));
    };
    loadUser();
  }, []);

  // Trả về các giá trị và hàm cần thiết để sử dụng trong components
  return { signIn, signOut, userInfo, loading, error };
};