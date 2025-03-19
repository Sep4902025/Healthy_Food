import React from "react";
import { View, Text, StyleSheet, Dimensions, Modal } from "react-native";
import { useToast } from "react-native-toast-notifications";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const CustomToast = ({ title, message, type }) => {
  let backgroundColor = "green";

  if (type === "error") {
    backgroundColor = "red";
  } else if (type === "warning") {
    backgroundColor = "#FF8C00";
  }

  return (
    <View style={styles.container}>
      <View style={[styles.Line, { backgroundColor }]}></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: WIDTH * 0.85,
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    // borderRadius: 10,
    backgroundColor: "white",
    // overflow: "hidden",
    zIndex: 9999,
    borderRadius: 12,
    overflow: "hidden",
  },
  Line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
    // color: 'white',
  },
  message: {
    fontSize: 14,
    opacity: 0.5,
    // color: 'white',
  },
});

const useCustomToast = () => {
  const toast = useToast();

  const showToast = ({ title, message, type, position }) => {
    toast.show(<CustomToast title={title} message={message} type={type} />, {
      type: type,
      placement: position || "top",
      duration: 3000,
      animationType: "slide-in",
      style: {
        backgroundColor: "",
        zIndex: 9999,
      },
    });
  };

  return showToast;
};

export default useCustomToast;
