import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Clipboard } from "react-native";

const OTPInput = ({ length = 6, value = "", onChange }) => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(new Array(length).fill(""));

  
  const handlePaste = async (index) => {
    try {
      const paste = await Clipboard.getString();
      if (paste && /^\d+$/.test(paste)) {
        const pasteArray = paste.slice(0, length).split("");
        const newOtp = [...otp];

        pasteArray.forEach((digit, idx) => {
          if (idx < length) {
            newOtp[idx + index] = digit;
          }
        });

        setOtp(newOtp);
        onChange(newOtp.join(""));

        
        const nextIndex = Math.min(index + pasteArray.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    } catch (error) {
      console.log("Paste error:", error);
    }
  };

  
  const handleChange = (index, digit) => {
    if (/^\d?$/.test(digit)) {
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);
      onChange(newOtp.join(""));

     
      if (digit !== "" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  
  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      onChange(newOtp.join(""));
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={styles.input}
          value={digit}
          onChangeText={(value) => handleChange(index, value)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          onPaste={() => handlePaste(index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          selectionColor="#007AFF"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  input: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "500",
    backgroundColor: "#FFFFFF",
  },
});


export default OTPInput;
