import Toast from "react-native-toast-message"; // import Toast from react-native-toast-message

// Simple ShowToast function that uses the default toast styles
const ShowToast = (type = "info", message = "", options = {}) => {
  // set type default là info
  // tạo mới trc options để về sau có thể custom thêm

  Toast.show({
    type: type, // success, error, or info
    position: "top", // vị trí của toast (top, bottom, bottom, center)
    text1: type.charAt(0).toUpperCase() + type.slice(1), // "Success", "Error", or "Info" : title của toast
    text2: message, // nội dung của toast
    topOffset: 60,
    props: {
      text2Style: {
        numberOfLines: 2, // ✅ Limits text2 to 2 lines
        ellipsizeMode: "tail", // ✅ Adds "..." if text overflows
      },
    },
    visibilityTime: 3000, //  thời gian hiển thị toast (ms) - 3000ms = 3s
  });
};

export default ShowToast;
