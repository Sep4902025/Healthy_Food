import React, { useState } from "react"; // Import React và hook useState để quản lý state
import {
  StyleSheet, // Import để tạo và áp dụng styles cho component
  Text, // Import component Text để hiển thị văn bản
  View, // Import component View để tạo container
  Dimensions, // Import để lấy kích thước màn hình thiết bị
  Image, // Import component Image để hiển thị hình ảnh
  ScrollView, // Import component ScrollView để tạo cuộn nội dung
  KeyboardAvoidingView, // Import component để tránh bàn phím che phủ input fields
  Platform, // Import để kiểm tra nền tảng (iOS hoặc Android)
} from "react-native";

import SafeAreaWrapper from "../components/layout/SafeAreaWrapper"; // Import wrapper bảo đảm hiển thị an toàn trên các thiết bị có notch
import SigninInputField from "../components/common/SigninInputField"; // Import component input field tùy chỉnh
import Ionicons from "../components/common/VectorIcons/Ionicons"; // Import icon từ thư viện Ionicons
import MaterialIcons from "../components/common/VectorIcons/MaterialIcons"; // Import icon từ thư viện MaterialIcons
import { TouchableOpacity } from "react-native"; // Import component cho phép xử lý sự kiện chạm
import RippleButton from "../components/common/RippleButton"; // Import button tùy chỉnh có hiệu ứng gợn sóng

import googleIcon from "../../assets/image/google_icon.png"; // Import hình ảnh biểu tượng Google
import loginHeaderIcon from "../../assets/image/login_bg.png"; // Import hình ảnh background header của màn hình đăng nhập
import { ScreensName } from "../constants/ScreensName"; // Import danh sách tên các màn hình trong ứng dụng
import ShowToast from "../components/common/CustomToast"; // Import component hiển thị thông báo toast
import { loginThunk } from "../redux/actions/userThunk"; // Import action thunk để xử lý đăng nhập
import { useDispatch } from "react-redux"; // Import hook để gửi action tới Redux store
import { useGoogleAuth } from "../hooks/useGoogleAuth"; // Import hook tùy chỉnh để xử lý đăng nhập Google
import NonBottomTabWrapper from "../components/layout/NonBottomTabWrapper"; // Import wrapper cho màn hình không có bottom tab
import { normalize } from "../utils/common"; // Import hàm normalize để đảm bảo kích thước tương thích trên nhiều loại màn hình

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window"); // Lấy chiều rộng và chiều cao của màn hình thiết bị

function Signin({ navigation }) { // Khai báo component Signin với prop navigation
  const [email, setEmail] = useState(""); // Khai báo state email với giá trị ban đầu là rỗng
  const [password, setPassword] = useState(""); // Khai báo state password với giá trị ban đầu là rỗng
  const [loading, setLoading] = useState(false); // Khai báo state loading để hiển thị trạng thái đang xử lý
  const dispatch = useDispatch(); // Khởi tạo dispatch để gửi action tới Redux store
  const { signIn } = useGoogleAuth(); // Lấy hàm signIn từ hook useGoogleAuth

  const loginMethod = [ // Khai báo mảng chứa phương thức đăng nhập
    {
      name: "Google", // Tên phương thức đăng nhập
      icon: googleIcon, // Biểu tượng cho phương thức đăng nhập
      color: "#4285F4", // Màu sắc cho phương thức đăng nhập
      onPress: async () => { // Hàm được gọi khi nhấn vào phương thức đăng nhập
        await loginGoogle(); // Gọi hàm loginGoogle
      },
    },
  ];

  const loginGoogle = async () => { // Khai báo hàm xử lý đăng nhập bằng Google
    await signIn(); // Gọi hàm signIn từ hook useGoogleAuth
  };

  const handlePress = async () => { // Khai báo hàm xử lý khi nhấn nút Sign in
    setLoading(true); // Bật trạng thái loading
    const credentials = { // Tạo đối tượng chứa thông tin đăng nhập
      email: email, // Gán giá trị email từ state
      password: password, // Gán giá trị password từ state
    };

    try { // Bắt đầu khối try-catch để xử lý lỗi
      const responseLogin = await dispatch(loginThunk(credentials)); // Gọi action loginThunk và đợi kết quả
      if (
        responseLogin.type.endsWith("fulfilled") && // Kiểm tra xem action có thành công không
        responseLogin?.payload?.data?.status // Kiểm tra trạng thái response
      ) {
        const username = responseLogin?.payload?.data?.data?.user?.username; // Lấy tên người dùng từ response
        ShowToast("success", "Welcome back " + username); // Hiển thị thông báo chào mừng
        navigation.navigate(ScreensName.home); // Chuyển hướng đến màn hình home
      } else { // Nếu đăng nhập thất bại
        ShowToast(
          "error", // Loại thông báo là lỗi
          "Login fail : " + responseLogin?.payload?.message ?? // Hiển thị thông báo lỗi từ response
            "Unable to connect. Check your network connection and try again." // Hoặc thông báo mặc định nếu không có message
        );
      }
    } catch (error) { // Bắt lỗi nếu có
      console.log(error); // In lỗi ra console
      ShowToast("error", "Unexpected error"); // Hiển thị thông báo lỗi không xác định
    }
    setLoading(false); // Tắt trạng thái loading
  };

  const renderLoginMethod = () => { // Khai báo hàm render các phương thức đăng nhập
    return loginMethod.map((item, index) => ( // Map qua mảng loginMethod để render từng phương thức
      <RippleButton
        key={index} // Key duy nhất cho mỗi phần tử trong mảng
        buttonStyle={styles.loginMethod} // Style cho button
        backgroundColor={"rgab(0, 0, 0, 0.5)"} // Màu nền cho button
        onPress={() => { // Hàm được gọi khi nhấn button
          item?.onPress ? item.onPress() : null; // Gọi hàm onPress của item nếu có
        }}
      >
        <Image source={item.icon} style={styles.methodIcon} />
      </RippleButton>
    ));
  };

  return ( // Trả về JSX để render giao diện
    <NonBottomTabWrapper headerHidden={true} style={styles.container}>
      <KeyboardAvoidingView // Component giúp tránh bàn phím che phủ input fields
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Behavior tùy thuộc vào nền tảng
        style={styles.keyboardAvoidView} // Style cho KeyboardAvoidingView
      >
        <ScrollView // Component cho phép cuộn nội dung
          contentContainerStyle={styles.scrollContent} // Style cho content container của ScrollView
          showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
        >
          <View style={styles.headerContainer}>
            <Image source={loginHeaderIcon} style={styles.backgroundImage} />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>Sign in with email</Text>
            <View style={styles.formContainer}>
              <SigninInputField // Component input field tùy chỉnh cho email
                state={email} // Giá trị hiện tại của email
                setState={setEmail} // Hàm để cập nhật giá trị email
                icon={ // Icon cho input field
                  <Ionicons name="mail-outline" size={20} color="#5FC88F" />
                }
                iconBackgroundcolor="#DEF5E9" // Màu nền cho icon
                placeholder="Email" // Placeholder cho input field
                inputType="email-address" // Loại input là email
                keyboardType="email-address" // Loại bàn phím là email
              />

              <SigninInputField // Component input field tùy chỉnh cho password
                state={password} // Giá trị hiện tại của password
                setState={setPassword} // Hàm để cập nhật giá trị password
                icon={ // Icon cho input field
                  <MaterialIcons name="lock-open" size={20} color="#9F9DF3" /> // Icon khóa
                }
                iconBackgroundcolor="#EBECFF" // Màu nền cho icon
                placeholder="Password" // Placeholder cho input field
                secureTextEntry // Ẩn văn bản nhập vào (cho password)
              />

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity // Component xử lý sự kiện chạm
                  onPress={() => { // Hàm được gọi khi nhấn vào "Quên mật khẩu"
                    navigation.navigate(ScreensName.verifyEmail, { // Chuyển hướng đến màn hình xác minh email
                      type: "resetPassword", // Với loại là reset mật khẩu
                    });
                  }}
                >
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <RippleButton // Button đăng nhập với hiệu ứng gợn sóng
                onPress={handlePress} // Gọi hàm handlePress khi nhấn button
                buttonText="Sign in" // Text hiển thị trên button
                buttonStyle={styles.signinButton} // Style cho button
                textStyle={styles.signinButtonText} // Style cho text trong button
                loading={loading} // Trạng thái loading của button
              />
            </View>

            <View style={styles.loginMethodContainer}>
              {renderLoginMethod()}
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.alreadyText}>
                Don't have account?{" "}
                <Text // Text "Đăng ký"
                  style={styles.registerText} // Style cho text đăng ký
                  onPress={() => navigation.navigate(ScreensName.signup)} // Chuyển hướng đến màn hình đăng ký khi nhấn
                >
                  Register
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </NonBottomTabWrapper>
  );
}

const styles = StyleSheet.create({ // Tạo stylesheet cho component
  container: { // Style cho container chính
    flex: 1, // Chiếm toàn bộ không gian có sẵn
  },
  keyboardAvoidView: { // Style cho KeyboardAvoidingView
    flex: 1, // Chiếm toàn bộ không gian có sẵn
  },
  scrollContent: { // Style cho content container của ScrollView
    flexGrow: 1, // Cho phép nội dung mở rộng nếu cần
    alignItems: "center", // Căn giữa các phần tử theo chiều ngang
    paddingBottom: 20, // Padding dưới cùng
  },
  headerContainer: { // Style cho phần header
    width: "100%", // Chiếm toàn bộ chiều rộng
    alignItems: "center", // Căn giữa các phần tử theo chiều ngang
    justifyContent: "center", // Căn giữa các phần tử theo chiều dọc
    height: HEIGHT * 0.25, // Chiều cao bằng 25% chiều cao màn hình
    maxHeight: 220, // Chiều cao tối đa là 220
    minHeight: 150, // Chiều cao tối thiểu là 150
  },
  backgroundImage: { // Style cho hình ảnh background
    width: "80%", // Chiều rộng bằng 80% container
    height: "100%", // Chiếm toàn bộ chiều cao container
    resizeMode: "contain", // Chế độ resize là contain
  },
  formSection: { // Style cho phần form
    width: "100%", // Chiếm toàn bộ chiều rộng
    alignItems: "center", // Căn giữa các phần tử theo chiều ngang
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    paddingTop: 10, // Padding trên cùng
  },
  title: { // Style cho tiêu đề
    fontSize: Platform.OS === "ios" ? 28 : 26, // Kích thước font tùy thuộc vào nền tảng
    textAlign: "center", // Căn giữa văn bản
    marginBottom: HEIGHT * 0.02, // Margin dưới bằng 2% chiều cao màn hình
    color: "#191C32", // Màu văn bản
    fontFamily: "Aleo_700Bold", // Font chữ
  },
  formContainer: { // Style cho container chứa các input field
    width: "100%", // Chiếm toàn bộ chiều rộng
    justifyContent: "space-around", // Phân bố đều các phần tử
    alignItems: "center", // Căn giữa các phần tử theo chiều ngang
    gap: HEIGHT * 0.015, // Khoảng cách giữa các phần tử
    marginTop: HEIGHT * 0.01, // Margin trên bằng 1% chiều cao màn hình
  },
  forgotPasswordContainer: { // Style cho container chứa "Quên mật khẩu"
    flexDirection: "row", // Sắp xếp các phần tử theo hàng ngang
    justifyContent: "flex-end", // Căn phải các phần tử
    width: "80%", // Chiều rộng bằng 80% container
    marginTop: 5, // Margin trên cùng
  },
  forgotPassword: { // Style cho text "Quên mật khẩu"
    textAlign: "right", // Căn phải văn bản
    fontWeight: "600", // Độ đậm của font
    color: "#555", // Màu văn bản
    fontSize: 14, // Kích thước font
  },
  signinButton: { // Style cho button đăng nhập
    width: "85%", // Chiều rộng bằng 85% container
    backgroundColor: "#191C32", // Màu nền
    padding: HEIGHT * 0.018, // Padding bằng 1.8% chiều cao màn hình
    borderRadius: 50, // Bo tròn góc
    overflow: "hidden", // Ẩn nội dung tràn ra ngoài
    marginTop: HEIGHT * 0.02, // Margin trên bằng 2% chiều cao màn hình
  },
  signinButtonText: { // Style cho text trong button đăng nhập
    textAlign: "center", // Căn giữa văn bản
    color: "#fff", // Màu văn bản
    fontSize: 16, // Kích thước font
    fontFamily: "Aleo_700Bold", // Font chữ
  },
  loginMethodContainer: { // Style cho container chứa các phương thức đăng nhập
    flexDirection: "row", // Sắp xếp các phần tử theo hàng ngang
    justifyContent: "center", // Căn giữa các phần tử theo chiều ngang
    alignItems: "center", // Căn giữa các phần tử theo chiều dọc
    marginTop: HEIGHT * 0.03, // Margin trên bằng 3% chiều cao màn hình
  },
  loginMethod: { // Style cho button phương thức đăng nhập
    backgroundColor: "white", // Màu nền
    borderRadius: 50, // Bo tròn góc
    padding: 0, // Không có padding
    width: WIDTH * 0.15, // Chiều rộng bằng 15% chiều rộng màn hình
    height: WIDTH * 0.15, // Chiều cao bằng 15% chiều rộng màn hình
    maxWidth: 70, // Chiều rộng tối đa
    maxHeight: 70, // Chiều cao tối đa
    minWidth: 50, // Chiều rộng tối thiểu
    minHeight: 50, // Chiều cao tối thiểu
    justifyContent: "center", // Căn giữa các phần tử theo chiều dọc
    alignItems: "center", // Căn giữa các phần tử theo chiều ngang
    shadowColor: "#000", // Màu bóng đổ
    shadowOffset: { // Vị trí bóng đổ
      width: 0, // Độ lệch theo chiều ngang
      height: 2, // Độ lệch theo chiều dọc
    },
    shadowOpacity: 0.1, // Độ mờ của bóng đổ
    shadowRadius: 3, // Bán kính của bóng đổ
    elevation: 2, // Độ nổi (cho Android)
  },
  methodIcon: { // Style cho biểu tượng phương thức đăng nhập
    width: normalize(32), // Chiều rộng đã được normalize để tương thích trên nhiều loại màn hình
    height: normalize(32), // Chiều cao đã được normalize để tương thích trên nhiều loại màn hình
    resizeMode: "contain", // Chế độ resize là contain
  },
  registerContainer: { // Style cho container chứa phần đăng ký
    marginTop: HEIGHT * 0.03, // Margin trên bằng 3% chiều cao màn hình
  },
  alreadyText: { // Style cho text "Chưa có tài khoản?"
    fontSize: 14, // Kích thước font
    fontFamily: "Aleo_400Regular", // Font chữ
    textAlign: "center", // Căn giữa văn bản
  },
  registerText: { // Style cho text "Đăng ký"
    textDecorationLine: "underline", // Gạch chân văn bản
    fontSize: 15, // Kích thước font
    fontWeight: "600", // Độ đậm của font
    color: "#191C32", // Màu văn bản
  },
});

export default Signin; // Export component Signin để sử dụng ở nơi khác