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
} from "react-native";
import AntDesignIcon from "../common/VectorIcons/AntDesignIcon";
import ShowToast from "../common/CustomToast";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";

const ConfirmDeleteAccountModal = ({ visible, onClose, onSubmit, title }) => {
  const [confirmUserName, setConfirmUserName] = useState("");
  const user = useSelector(userSelector);

  useEffect(() => {
    setConfirmUserName("");
  }, [visible]);

  const handleSubmit = () => {
    if (user.username !== confirmUserName) {
      ShowToast("error", "Username not match");
    } else {
      onSubmit();
    }
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
        <View style={styles.modalView}>
          <View style={styles.modalIcon}>
            <AntDesignIcon name="delete" size={28} color="#DE0A0A" />
          </View>
          <Text style={styles.modalTitle}>{title || "Delete Account"}</Text>
          <Text style={styles.modalWarning}>
            WARNING this is permanent and cannot be undone!
          </Text>
          <Text style={styles.modalDescription}>
            All of your cards will be immediately deleted.
          </Text>
          <Text style={styles.modalDescription}>
            Any cards you have created that have been shared with others will
            also be deleted.
          </Text>
          <Text style={styles.modalDescription}>Confirm username:</Text>
          <TextInput
            style={styles.input}
            value={confirmUserName}
            onChangeText={setConfirmUserName}
            placeholder={"Type here..."}
            autoFocus={true}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Start Deletion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 50,
  },
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    paddingVertical: 40,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    minWidth: "40%",
  },
  submitButton: {
    backgroundColor: "rgba(222,10,10,70)",
  },
  submitButtonText: {
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
