import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import OTPInput from "../common/OtpInput";

const InputOtpModal = ({
  title = "Verify OTP",
  isOpen,
  onClose,
  onVerify,
  otpAmount = 6,
}) => {
  const [verificationCode, setVerificationCode] = useState("");

 
  const handleCodeChange = (code) => {
    setVerificationCode(code);
  };

  
  const handleVerify = () => {
    onVerify(verificationCode);
    setVerificationCode("");
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.otpContainer}>
            <OTPInput
              length={otpAmount}
              value={verificationCode}
              onChange={handleCodeChange}
            />
          </View>

          
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>

         
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  inputField: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 18,
    textAlign: "center",
    marginHorizontal: 5,
  },
  verifyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default InputOtpModal;
