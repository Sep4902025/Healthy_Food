import React, { useState, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import messageSocket from "../services/messageSocket";
import { userSelector } from "../redux/selectors/selector";
import { useSelector } from "react-redux";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import { useTheme } from "../contexts/ThemeContext";
import ShowToast from "../components/common/CustomToast";
import { uploadImages } from "../services/cloundaryService";
import { arrayToString, stringToArray } from "../utils/common";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import ConversationStarter from "../components/modal/ConversationStarter";
import { ScreensName } from "../constants/ScreensName";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const MessageItem = memo(({ item, index, theme, handleImagePress }) => {
  const isMyMessage = item.sender === "me";

  return (
    <View
      style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}
      key={index}
    >
      {item.type === "text" && item.text && (
        <Text style={[styles.messageSender, isMyMessage && styles.mySender]}>{item.text}</Text>
      )}

      {item.type === "image" && item.imageUrl && (
        <View style={styles.messageImageContainer}>
          {stringToArray(item.imageUrl).map((image, imgIndex) => (
            <TouchableOpacity
              key={`${item._id}-image-${imgIndex}`}
              onPress={() => handleImagePress(image.url || image)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: image.url || image }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.timestamp, isMyMessage && styles.mySender]}>
        {new Date(item.updatedAt || item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
});

function Message({ navigation }) {
  const user = useSelector(userSelector);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [inputText, setInputText] = useState("");
  const [visible, setVisible] = useState({ inputTopic: false }); // Initialize to false
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { theme, themeMode } = useTheme();
  const flatListRef = useRef(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedViewImage, setSelectedViewImage] = useState(null);

  useEffect(() => {
    if (!user?._id || !user?.accessToken) {
      setInitialLoading(false);
      setVisible({ ...visible, inputTopic: true }); // Show modal if no user
      return;
    }

    messageSocket.init({
      userId: user._id,
      token: user.accessToken,
      conversationId: conversation?._id,
    });

    loadConversation();

    return () => {
      messageSocket.disconnect();
    };
  }, [user?._id, user?.accessToken]);

  useEffect(() => {
    if (!conversation?._id) return;

    messageSocket.init({
      userId: user._id,
      token: user.accessToken,
      conversationId: conversation._id,
    });

    const handleReceiveMessage = (message) => {
      if (message.conversationId === conversation._id) {
        let adjustedType = message.type || "text";
        if (message.imageUrl && !message.videoUrl && adjustedType === "text") {
          adjustedType = "image";
        } else if (message.videoUrl && adjustedType === "text") {
          adjustedType = "video";
        }

        const messageToReceived = {
          _id: message._id,
          text: message.text,
          sender: message.senderId === user._id ? "me" : "other",
          timestamp: message.updatedAt || new Date().toISOString(),
          imageUrl: message.imageUrl || null,
          type: adjustedType,
        };

        setMessages((previousMessages) => {
          const exists = previousMessages.some((msg) => msg._id === message._id);
          if (exists) return previousMessages;

          const updatedMessages = [...previousMessages, messageToReceived];
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return updatedMessages;
        });
      }
    };

    const handleConversationUpdated = (updatedConversation) => {
      if (updatedConversation._id === conversation._id) {
        setConversation(updatedConversation);
      }
    };

    messageSocket.on("receive_message", handleReceiveMessage);
    messageSocket.on("conversationUpdated", handleConversationUpdated);

    return () => {
      messageSocket.off("receive_message", handleReceiveMessage);
      messageSocket.off("conversationUpdated", handleConversationUpdated);
    };
  }, [conversation?._id, user?._id]);

  const loadConversation = async () => {
    try {
      setInitialLoading(true);
      const response = await messageSocket.getUserConversations(user?._id);
      console.log("Load conversation response:", response);

      if (response.data?.data?.length > 0) {
        // Check if data array has items
        const latestConversation = response.data.data[0];
        setConversation(latestConversation);
        setVisible({ ...visible, inputTopic: false }); // Hide modal
        await loadMessageHistory(latestConversation._id);
      } else {
        setConversation(null); // Clear conversation if none exists
        setMessages([]); // Clear messages
        setVisible({ ...visible, inputTopic: true }); // Show modal only if no conversation
      }
    } catch (error) {
      console.error("Load conversation error:", error);
      ShowToast("error", "Failed to load conversations");
      setVisible({ ...visible, inputTopic: true });
    } finally {
      setInitialLoading(false);
    }
  };

  const loadMessageHistory = async (conversationId) => {
    try {
      const response = await messageSocket.getMessages(conversationId);
      console.log("Load message history response:", response); // Debug log
      if (response.status === 200) {
        const newMessages = response.data?.data?.map((item) => {
          let adjustedType = item.type || "text";
          if (item.imageUrl && !item.videoUrl && adjustedType === "text") {
            adjustedType = "image";
          } else if (item.videoUrl && adjustedType === "text") {
            adjustedType = "video";
          }
          return {
            ...item,
            _id: item._id,
            sender: item.senderId === user?._id ? "me" : "other",
            type: adjustedType,
          };
        });

        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((msg) => msg._id));
          const filteredMessages = newMessages.filter((msg) => !existingIds.has(msg._id));
          return [...prevMessages, ...filteredMessages];
        });
      }
    } catch (error) {
      console.error("Load message history error:", error);
      ShowToast("error", "Failed to load message history");
    }
  };

  const handleCreateConversation = async (topic) => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const response = await messageSocket.createConversation(user?._id, topic);
      console.log("Create conversation response:", response);

      if (response.data?.status === 200 && response.data?.data) {
        const newConversation = response.data.data;
        setConversation(newConversation);
        setVisible({ ...visible, inputTopic: false }); // Hide modal permanently
        ShowToast("success", "Conversation started");

        // Send initial message
        const initialMessage = {
          conversationId: newConversation._id,
          senderId: user._id,
          text: `${topic}`,
          imageUrl: null,
          videoUrl: null,
          type: "text",
        };
        await messageSocket.sendMessage(newConversation._id, initialMessage);

        // Load message history to include initial message
        await loadMessageHistory(newConversation._id);

        // Reinitialize socket
        messageSocket.init({
          userId: user._id,
          token: user.accessToken,
          conversationId: newConversation._id,
        });
      } else if (response.data?.status === 400 && response.data?.data) {
        // Handle existing conversation
        const existingConversation = response.data.data;
        setConversation(existingConversation);
        setVisible({ ...visible, inputTopic: false }); // Hide modal permanently
        ShowToast("info", `Continuing with existing topic: ${existingConversation.topic}`);
        await loadMessageHistory(existingConversation._id);
        messageSocket.init({
          userId: user._id,
          token: user.accessToken,
          conversationId: existingConversation._id,
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Create conversation error:", error);
      const errorMessage = error.message || error.data?.message || "Failed to start conversation";
      ShowToast("error", errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    navigation.navigate(ScreensName.home);
    ShowToast("info", "You need to start a conversation to chat");
  };

  const handleImagePress = (imageUrl) => {
    setSelectedViewImage(imageUrl);
    setImageViewerVisible(true);
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "The app needs access to your photo library to select images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        ShowToast("error", "Photo library access required");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImages(result.assets);
      }
    } catch (error) {
      console.error("Error in pickImages:", error);
      ShowToast("error", "Failed to select images");
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) return [];

    const imageFiles = selectedImages.map((img) => ({
      uri: img.uri,
      type: "image/jpeg",
      name: `image_${Date.now()}.jpg`,
    }));

    try {
      const uploadedImages = await uploadImages(imageFiles, (progress) => {
        setUploadProgress(progress);
      });
      return uploadedImages;
    } catch (error) {
      console.error("Upload images error:", error);
      ShowToast("error", "Failed to upload images");
      throw error;
    }
  };

  const onSend = async () => {
    if (!conversation) {
      ShowToast("error", "Please start a conversation first");
      setVisible({ ...visible, inputTopic: true });
      return;
    }

    if (inputText.trim() === "" && selectedImages.length === 0) return;
    if (isSending) return;

    setIsSending(true);

    try {
      let messageData;

      if (inputText.trim()) {
        messageData = {
          conversationId: conversation._id,
          senderId: user._id,
          text: inputText,
          imageUrl: null,
          videoUrl: null,
          type: "text",
        };

        await messageSocket.sendMessage(conversation._id, messageData);
      }

      if (selectedImages.length > 0) {
        const uploadedImages = await handleUploadImages();
        for (const image of uploadedImages) {
          const imageUrl = image?.url;
          if (!imageUrl) {
            throw new Error("Failed to upload image: No URL returned");
          }

          messageData = {
            conversationId: conversation._id,
            senderId: user._id,
            text: "",
            imageUrl: imageUrl,
            videoUrl: null,
            type: "image",
          };

          await messageSocket.sendMessage(conversation._id, messageData);
        }
      }

      setInputText("");
      setSelectedImages([]);
      setUploadProgress(0);
    } catch (error) {
      console.error("Send message error:", error);
      ShowToast("error", "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    return (
      <MessageItem item={item} index={index} theme={theme} handleImagePress={handleImagePress} />
    );
  };

  const renderIntroduce = () => {
    const introduceText = ["Hello", "I need some help", "Healthy food", "Dishes for today"];

    return (
      <ScrollView
        style={{
          ...styles.introduceTextContainer,
          backgroundColor: theme.editModalbackgroundColor,
        }}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
      >
        {introduceText.map((item, key) => (
          <TouchableOpacity
            style={{ margin: 6 }}
            onPress={() => {
              setInputText(item);
            }}
            key={key}
          >
            <Text style={{ ...styles.introduceText }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (initialLoading) {
    return (
      <MainLayoutWrapper headerHidden={true}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </MainLayoutWrapper>
    );
  }

  return (
    <MainLayoutWrapper headerHidden={true}>
      {conversation ? (
        <>
          <View style={styles.topicHeader}>
            <Text style={styles.topicHeaderText}>{conversation.topic}</Text>
          </View>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item._id || item.tempId || `temp-${uuidv4()}-${index}`}
            style={{
              ...styles.messagesList,
              backgroundColor: theme.editModalbackgroundColor,
            }}
            contentContainerStyle={styles.messagesListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={21}
            removeClippedSubviews={true}
          />

          {selectedImages.length > 0 && (
            <View
              style={{
                ...styles.selectedImagesContainer,
                backgroundColor: theme.editModalbackgroundColor,
              }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.selectedImageWrapper}>
                    <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <View style={styles.progressOverlay}>
                        <Text style={styles.progressText}>{uploadProgress}%</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            {!messages[0] && renderIntroduce()}
            <View
              style={{
                ...styles.inputContainer,
                backgroundColor: theme.editModalbackgroundColor,
                borderTopWidth: themeMode === "light" ? 1 : 0,
              }}
            >
              <TouchableOpacity
                style={[styles.attachButton, isSending ? styles.attachButtonDisabled : {}]}
                onPress={pickImages}
                disabled={isSending || !conversation}
              >
                <Ionicons name="image-outline" size={24} color={isSending ? "#ccc" : "#999"} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                multiline
                editable={!isSending && !!conversation}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (inputText.trim() === "" && selectedImages.length === 0) ||
                  isSending ||
                  !conversation
                    ? styles.sendButtonDisabled
                    : {},
                ]}
                onPress={onSend}
                disabled={
                  (inputText.trim() === "" && selectedImages.length === 0) ||
                  isSending ||
                  !conversation
                }
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : null}

      <ConversationStarter
        visible={visible.inputTopic}
        onClose={() => setVisible({ ...visible, inputTopic: false })}
        onStartConversation={handleCreateConversation}
        onBack={handleBack}
        title="Start Consultation"
        placeholder="Enter your consultation topic..."
      />
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
  topicHeader: {
    padding: 15,
    backgroundColor: "#A4DC5D",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  topicHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  messagesList: {
    flex: 1,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  messagesListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
  },
  myMessage: {
    backgroundColor: "#A4DC5D",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  otherMessage: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageSender: {
    color: "#5D6066",
  },
  mySender: {
    color: "white",
  },
  messageImageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 18,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    backgroundColor: "#A4DC5D",
    borderRadius: 50,
  },
  sendButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  attachButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    marginRight: 5,
  },
  attachButtonDisabled: {
    opacity: 0.5,
  },
  selectedImagesContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  selectedImageWrapper: {
    position: "relative",
    marginRight: 10,
  },
  selectedImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: WIDTH,
    height: HEIGHT * 0.7,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  introduceTextContainer: {
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 12,
  },
  introduceText: {
    padding: 12,
    paddingVertical: 6,
    borderRadius: 50,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  progressOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  progressText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default Message;
