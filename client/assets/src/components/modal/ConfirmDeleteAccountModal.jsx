import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AntDesignIcon from "../common/VectorIcons/AntDesignIcon";
import ShowToast from "../common/CustomToast";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { forgetPassword, verifyOtp } from "../../services/authService";
import OTPInput from "../common/OtpInput";

const ConfirmDeleteAccountModal = ({ visible, onClose, onSubmit, title }) => {
  const [confirmUserName, setConfirmUserName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countTime, setCountTime] = useState(300); // 5 minutes countdown
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);

  const user = useSelector(userSelector);

  useEffect(() => {
    // Reset states when modal opens/closes
    if (visible) {
      setConfirmUserName("");
      setOtpCode("");
      setIsOtpSent(false);
      setErrorMessage("");
      setAttemptCount(0);
      setIsBlocked(false);
      setIsNetworkError(false);
    }
  }, [visible]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    let interval;
    if (isOtpSent && countTime > 0) {
      interval = setInterval(() => {
        setCountTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (countTime === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, countTime]);

  // Format seconds to minutes:seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleUsernameSubmit = async () => {
    if (user.email.trim() != confirmUserName.trim()) {
      ShowToast("error", "Email does not match");
      setErrorMessage("Email does not match");
      return;
    }

    // Username matched, send OTP
    try {
      setIsLoading(true);
      setErrorMessage("");
      setIsNetworkError(false);

      const response = await forgetPassword({ email: user.email?.trim() });
      if (response.status === 200) {
        setCountTime(300); // 5 minutes countdown
        setAttemptCount(0);
      } else {
        console.log(response);
        setErrorMessage("Không thể gửi mã OTP. Vui lòng thử lại.");
      }

      setIsOtpSent(true);
      setCountTime(300); // 5 minutes countdown
      setAttemptCount(0);
      ShowToast("success", "OTP code has been sent to your email");
    } catch (error) {
      console.error("Network error:", error);
      setIsNetworkError(true);
      setErrorMessage(
        "Cannot send OTP code. Check your network connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setIsNetworkError(false);

      // Check if user is blocked due to too many attempts
      if (isBlocked) {
        setErrorMessage(
          "You have exceeded the maximum number of attempts. Please try again later."
        );
        return;
      }

      // Check if OTP has expired
      if (countTime === 0) {
        setErrorMessage("OTP code has expired.");
        return;
      }

      // Simulate OTP verification - replace with actual API call
      const response = await verifyOtp({
        email: user.email,
        otp: otpCode,
      });

      if (response.status === 200) {
        // OTP verification successful, proceed with account deletion
        onSubmit();
      } else {
        // Increment attempt count and check if max attempts reached
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 3) {
          setIsBlocked(true);
          setErrorMessage(
            "You have exceeded the maximum number of attempts. Please try again later."
          );
        } else {
          setErrorMessage(
            `Invalid OTP code. Please try again. (Attempt ${newAttemptCount}/3)`
          );
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setIsNetworkError(true);
      setErrorMessage(
        "Cannot verify OTP code. Check your network connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setIsNetworkError(false);

      await forgetPassword({ email: user.email?.trim() });

      setCountTime(300); // Reset 5 minutes countdown
      setAttemptCount(0); // Reset attempt count
      setIsBlocked(false); // Unblock if was blocked
      ShowToast("success", "New OTP code has been sent to your email");
    } catch (error) {
      console.error("Network error:", error);
      setIsNetworkError(true);
      setErrorMessage(
        "Cannot resend OTP code. Check your network connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value) => {
    setOtpCode(value);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <TouchableOpacity style={styles.backGroundView} onPress={onClose} activeOpacity={1}/>
        <View style={styles.modalView}>
          <View style={styles.modalIcon}>
            <AntDesignIcon name="delete" size={28} color="#DE0A0A" />
          </View>
          <Text style={styles.modalTitle}>{title || "Delete Account"}</Text>
          <Text style={styles.modalWarning}>
            WARNING this action is permanent and cannot be undone!
          </Text>

          {!isOtpSent ? (
            // Username confirmation screen
            <>
              <Text style={styles.modalDescription}>
                All your information will be deleted immediately.
              </Text>
              <Text style={styles.modalDescription}>
                Any data you have shared with others will also be deleted.
              </Text>
              <Text style={styles.modalDescription}>Confirm your email:</Text>
              <TextInput
                style={styles.input}
                value={confirmUserName}
                onChangeText={setConfirmUserName}
                placeholder="Enter your email..."
                autoFocus={true}
              />

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.nextButton]}
                  onPress={handleUsernameSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.nextButtonText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // OTP verification screen
            <>
              <Text style={styles.modalDescription}>
                A 4-digit verification code has been sent to your email.
              </Text>
              <Text style={styles.modalDescription}>
                Please enter the code to confirm account deletion.
              </Text>

              <Text style={styles.otpTimeText}>
                Time remaining: {formatTime(countTime)}
              </Text>

              <OTPInput
                length={4}
                value={otpCode}
                onChange={handleCodeChange}
                disabled={isBlocked || countTime === 0}
              />

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={countTime > 0 && countTime < 290} // Prevent spam clicking
              >
                <Text style={styles.resendButtonText}>Resend OTP code</Text>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading || otpCode.length !== 4}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Confirm Deletion
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    position: "relative",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backGroundView: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIcon: {
    alignSelf: "center",
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#D9D9D9",
    borderRadius: 50,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalWarning: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#DE0A0A",
  },
  modalDescription: {
    fontSize: 15,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#C4C4C4",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  otpInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#C4C4C4",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 5,
  },
  otpTimeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
    marginBottom: 15,
  },
  errorText: {
    color: "#DE0A0A",
    marginBottom: 15,
    fontSize: 14,
  },
  resendButton: {
    alignSelf: "center",
    marginVertical: 20,
  },
  resendButtonText: {
    color: "#3592E7",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    minWidth: "40%",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "rgba(222,10,10,0.7)",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#DE0A0A",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#C4C4C4",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  cancelButtonText: {
    color: "#000000",
    textAlign: "center",
  },
});

export default ConfirmDeleteAccountModal;
