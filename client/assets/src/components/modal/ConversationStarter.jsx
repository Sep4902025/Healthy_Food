import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, Dimensions } from "react-native";
import ShowToast from "../common/CustomToast";

const ConversationStarter = ({ visible, onStartConversation, onBack, title, placeholder }) => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const topics = [
    "I want dietary advice!",
    "I want weight loss advice",
    "I want weight gain advice",
    "I want nutrition advice for a medical condition",
    "Other",
  ];

  const handleSubmit = () => {
    const finalTopic = selectedTopic === "Other" ? customTopic : selectedTopic;
    if (finalTopic.trim()) {
      onStartConversation(finalTopic);
      setSelectedTopic("");
      setCustomTopic("");
    } else {
      ShowToast("error", "Please select or enter a valid topic");
    }
  };

  const handleClose = () => {
    onBack();
    ShowToast("info", "You need to start a conversation to continue chatting");
  };

  const { width, height } = Dimensions.get("window");
  const modalWidth = width * 0.7;
  const modalHeight = height * 0.7;

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View className="flex-1 justify-center items-center">
        <View
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-5"
          style={{
            width: modalWidth,
            maxHeight: modalHeight,
            zIndex: 10,
            paddingVertical: 10,
            paddingHorizontal: 15,
          }}
        >
          <View className="flex-row justify-between items-center mb-5">
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">{title}</Text>
          </View>

          <Text className="text-base font-medium mb-3" style={{ marginHorizontal: 5 }}>
            Select consultation topic
          </Text>
          <FlatList
            data={topics}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`p-3 rounded-lg border border-gray-200 mb-2 ${
                  selectedTopic === item ? "bg-custom-green border-custom-green" : ""
                }`}
                onPress={() => setSelectedTopic(item)}
              >
                <Text className={`text-base ${selectedTopic === item ? "text-white" : ""}`}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            className="max-h-[150]"
          />

          {selectedTopic === "Other" && (
            <TextInput
              className="border border-gray-200 rounded-lg p-2 mb-2"
              value={customTopic}
              onChangeText={setCustomTopic}
              placeholder={placeholder}
              autoFocus={true}
            />
          )}

          <TouchableOpacity
            className={`bg-custom-green rounded-lg items-center p-3 ${
              !(selectedTopic && (selectedTopic !== "Other" || customTopic.trim()))
                ? "bg-gray-400"
                : ""
            }`}
            onPress={handleSubmit}
            disabled={!(selectedTopic && (selectedTopic !== "Other" || customTopic.trim()))}
          >
            <Text className="text-white font-bold text-base">Start Conversation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConversationStarter;
