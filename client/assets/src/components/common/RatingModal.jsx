import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const RatingModal = ({
  visible,
  onClose,
  rating,
  setRating,
  comment,
  setComment,
  handleRate, 
  submitComment,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Rating Recipe</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  setRating({ ...rating, star });
                  handleRate(star);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.star,
                    {
                      color:
                        star <= (rating?.star || 0) ? "#FFD700" : "#ccc",
                    },
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Leave a comment... (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={styles.textInput}
          />

          {comment.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                submitComment(comment);
                onClose();
                setComment(""); // clear
              }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit Comment</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RatingModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  star: {
    fontSize: 32,
    marginHorizontal: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 20,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    alignItems: "center",
  },
  closeText: {
    color: "#888",
    fontSize: 14,
  },
});
