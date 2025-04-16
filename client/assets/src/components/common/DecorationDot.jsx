
import React from "react";
import { View } from "react-native";


function DecorationDot({
  size = 20, 
  backgroundColor = "#000000", 
  opacity = 1, 
  zIndex = 1, 
  top, 
  bottom, 
  left, 
  right, 
  transform, 
}) {
  return (
     
    <View
      style={{
        width: size, 
        height: size, 
        backgroundColor, 
        opacity, 
        zIndex,
        position: "absolute", 
        top, 
        bottom, 
        left, 
        right, 
        borderRadius: 500, 
        transform: transform ? transform : [], 
      }}
    />
  );
}

export default DecorationDot;
