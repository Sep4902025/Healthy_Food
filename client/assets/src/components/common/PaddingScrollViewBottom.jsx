import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const HEIGHT = Dimensions.get("window").height;

const PaddingScrollViewBottom = () => {
  return <View style={styles.container}></View>;
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: HEIGHT * 0.1,
  },
});

// Export component để sử dụng ở nơi khác
export default PaddingScrollViewBottom;
