import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/30">
        {/* Overlay */}
        <TouchableOpacity className="absolute inset-0" onPress={onCancel} activeOpacity={1} />

        {/* Dialog Box */}
        <View className="bg-white rounded-lg shadow-lg p-5 w-11/12 max-w-sm">
          <Text className="text-lg font-semibold mb-3">{message}</Text>
          <View className="flex-row justify-center gap-3">
            <TouchableOpacity onPress={onCancel} className="px-4 py-2 bg-gray-200 rounded">
              <Text className="text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} className="px-4 py-2 bg-blue-600 rounded">
              <Text className="text-white">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationDialog;
