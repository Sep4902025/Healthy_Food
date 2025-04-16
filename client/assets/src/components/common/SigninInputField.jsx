
import React, { useState, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  View,
  Animated,
} from "react-native";


const WIDTH = Dimensions.get("window").width;


function SigninInputField({
  state, 
  setState, 
  icon = null, 
  placeholder = "Enter text", 
  inputType = "default", 
  secureTextEntry = false, 
  maxLength, 
  keyboardType, 
  style, 
  iconBackgroundcolor = "#ffffff", 
}) {
 
  const animation = useRef(new Animated.Value(WIDTH * 0.85)).current;

  
  const handleFocus = () => {
    Animated.timing(animation, {
      toValue: WIDTH * 0.88, 
      duration: 200, 
      useNativeDriver: false, 
    }).start(); 
  };

  
  const handleBlur = () => {
    Animated.timing(animation, {
      toValue: WIDTH * 0.85, 
      duration: 200, 
      useNativeDriver: false,
    }).start();
  };

  return (
    
    <Animated.View
      style={[
        styles.container,
        style,
        {
          width: animation,
        },
      ]}
    >
      
      {icon && (
        <View style={[styles.icon, { backgroundColor: iconBackgroundcolor }]}>
          {icon}
        </View>
      )}

      
      <TextInput
        value={state}
        onChangeText={setState}
        style={[styles.inputField, icon ? { marginLeft: 10 } : null]}
        placeholder={placeholder}
        keyboardType={keyboardType || inputType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        placeholderTextColor="#999"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row", 
    alignItems: "center", 
    padding: 10, 
    borderRadius: 24, 
    backgroundColor: "#ffffff", 
   
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4.65,
    elevation: 6, 
  },
  icon: {
    marginRight: 10, 
    padding: 12, 
    borderRadius: 1000, 
  },
  inputField: {
    flex: 1, 
    fontSize: 18,
    color: "#000", 
    fontFamily: "Aleo_400Regular",
  },
});

export default SigninInputField;
