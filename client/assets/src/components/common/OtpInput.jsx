// Import các hook và component cần thiết từ React và React Native
import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Clipboard } from "react-native";

// Component OTPInput nhận props: độ dài mã OTP, giá trị hiện tại, và hàm xử lý thay đổi
const OTPInput = ({ length = 6, value = "", onChange }) => {
  // inputRefs để lưu ref của từng ô nhập OTP
  const inputRefs = useRef([]);

  // State `otp` để lưu các ký tự đã nhập, khởi tạo mảng rỗng theo độ dài
  const [otp, setOtp] = useState(new Array(length).fill(""));

  // Xử lý dán nội dung (paste clipboard)
  const handlePaste = async (index) => {
    try {
      const paste = await Clipboard.getString(); // Lấy nội dung clipboard
      if (paste && /^\d+$/.test(paste)) {
        // Kiểm tra nếu chỉ chứa số
        const pasteArray = paste.slice(0, length).split(""); // Cắt chuỗi thành mảng từng số
        const newOtp = [...otp];

        // Gán từng ký tự từ clipboard vào các ô tương ứng
        pasteArray.forEach((digit, idx) => {
          if (idx < length) {
            newOtp[idx + index] = digit;
          }
        });

        setOtp(newOtp); // Cập nhật state OTP
        onChange(newOtp.join("")); // Gửi giá trị mới ra ngoài qua onChange prop

        // Tự động focus vào ô tiếp theo sau khi dán xong
        const nextIndex = Math.min(index + pasteArray.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    } catch (error) {
      console.log("Paste error:", error); // Bắt lỗi nếu có
    }
  };

  // Xử lý thay đổi khi người dùng gõ từng ký tự
  const handleChange = (index, digit) => {
    if (/^\d?$/.test(digit)) {
      // Chỉ chấp nhận 1 số (hoặc rỗng khi xóa)
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);
      onChange(newOtp.join(""));

      // Tự động chuyển sang ô tiếp theo nếu có nhập ký tự
      if (digit !== "" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Xử lý khi nhấn phím Backspace
  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
      // Nếu ô hiện tại rỗng và bấm xóa -> focus ô trước
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      onChange(newOtp.join(""));
    }
  };

  // UI: render dãy các ô nhập OTP
  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)} // Gán ref cho từng ô
          style={styles.input}
          value={digit}
          onChangeText={(value) => handleChange(index, value)} // Xử lý khi người dùng nhập
          onKeyPress={(event) => handleKeyPress(event, index)} // Xử lý khi nhấn phím
          onPaste={() => handlePaste(index)} // Dán (nếu hỗ trợ trên platform)
          keyboardType="number-pad" // Chỉ hiển thị bàn phím số
          maxLength={1} // Mỗi ô chỉ nhập 1 ký tự
          selectTextOnFocus // Tự động chọn text khi focus để dễ ghi đè
          selectionColor="#007AFF" // Màu con trỏ chọn
        />
      ))}
    </View>
  );
};

// Style cho component
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Các ô hiển thị theo chiều ngang
    justifyContent: "center",
    alignItems: "center",
    gap: 8, // Khoảng cách giữa các ô
  },
  input: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    textAlign: "center", // Căn giữa số
    fontSize: 20,
    fontWeight: "500",
    backgroundColor: "#FFFFFF",
  },
});

// Export component để dùng ngoài
export default OTPInput;
