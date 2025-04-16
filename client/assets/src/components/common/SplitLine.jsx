
import React from "react";
import { View, Text, StyleSheet } from "react-native";


const SplitLine = ({ text, textStyle, lineStyle }) => {
  return (
   
    <View style={styles.container}>
      
      <View style={[styles.line, lineStyle]} />

      
      <Text style={[styles.text, textStyle]}>{text}</Text>

      
      <View style={[styles.line, lineStyle]} />
    </View>
  );
};


const styles = StyleSheet.create({ 
  container: {
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: 16, 
  },
  line: {
    height: 1, 
    backgroundColor: "#D6D6D6", 
    borderRadius: 1, 
  },
  text: {
    marginHorizontal: 8, 
    fontSize: 16, 
    color: "#D6D6D6", 
    fontFamily: "Aleo_400Regular",
  },
});


export default SplitLine;
