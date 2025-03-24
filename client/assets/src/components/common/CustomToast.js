import Toast from "react-native-toast-message"; 


const ShowToast = (type = "info", message = "", options = {}) => {
  

  Toast.show({
    type: type, 
    position: "top", 
    text1: type.charAt(0).toUpperCase() + type.slice(1), 
    text2: message,
    topOffset: 60,
    props: {
      text2Style: {
        numberOfLines: 2, 
        ellipsizeMode: "tail", 
      },
    },
    visibilityTime: 3000, 
  });
};

export default ShowToast;
