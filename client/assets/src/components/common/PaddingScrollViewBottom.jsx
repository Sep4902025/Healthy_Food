import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const HEIGHT = Dimensions.get("window").height;

const PaddingScrollViewBottom = () => {
  return <View style={styles.container}></View>;
};


const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: HEIGHT * 0.1,
  },
});


export default PaddingScrollViewBottom; 
