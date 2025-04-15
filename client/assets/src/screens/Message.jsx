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
import InputModal from "../components/modal/InputModal";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import { useTheme } from "../contexts/ThemeContext";
import ShowToast from "../components/common/CustomToast";
import { uploadImages } from "../services/cloundaryService";
import { arrayToString, stringToArray } from "../utils/common";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

// Component MessageItem tách riêng và bọc bằng memo
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
  const [conversation, setConversation] = useState({});
  const [screenState, setScreenState] = useState("chat");
  const [inputText, setInputText] = useState("");
  const [visible, setVisible] = useState({ inputTopic: false });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { theme, themeMode } = useTheme();
  const flatListRef = useRef(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedViewImage, setSelectedViewImage] = useState(null);

  useEffect(() => {
    if (!user?._id || !user?.accessToken) return;

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
      console.log("New message received on app:", message);
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
          timestamp: message.updatedAt,
          imageUrl: message.imageUrl || null,
          type: adjustedType,
        };

        setMessages((previousMessages) => {
          // Kiểm tra xem tin nhắn đã tồn tại chưa dựa trên _id
          const exists = previousMessages.some((msg) => msg._id === message._id);
          if (exists) {
            console.log("Duplicate message detected in handleReceiveMessage:", messageToReceived);
            return previousMessages; // Không thêm nếu đã tồn tại
          }

          const updatedMessages = [...previousMessages, messageToReceived];
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return updatedMessages;
        });
      } else {
        console.warn("Message ignored due to conversation ID mismatch:", {
          received: message.conversationId,
          expected: conversation._id,
        });
      }
    };

    const handleConversationUpdated = (updatedConversation) => {
      console.log("Conversation updated on app:", updatedConversation);
      if (updatedConversation._id === conversation._id) {
        setConversation(updatedConversation);
      }
    };

    const handleUserStatus = (status) => {
      console.log("User status updated on app:", status);
    };

    const handleTypingStatus = (typingData) => {
      console.log("Typing status on app:", typingData);
    };

    messageSocket.on("receive_message", handleReceiveMessage);
    messageSocket.on("conversationUpdated", handleConversationUpdated);
    messageSocket.on("user_status", handleUserStatus);
    messageSocket.on("typing_status", handleTypingStatus);

    return () => {
      messageSocket.off("receive_message", handleReceiveMessage);
      messageSocket.off("conversationUpdated", handleConversationUpdated);
      messageSocket.off("user_status", handleUserStatus);
      messageSocket.off("typing_status", handleTypingStatus);
    };
  }, [conversation?._id, user?._id]);

  const loadConversation = async () => {
    try {
      setInitialLoading(true);
      const response = await messageSocket.getUserConversations(user?._id);
      if (response.status === 200 && response.data?.data[0]) {
        setConversation(response.data.data[0]);
        loadMessageHistory(response.data.data[0]._id);
      } else {
        handleCreateConversation("defaultTopic");
      }
    } catch (error) {
      console.error("Load conversation error:", error);
      ShowToast("error", "Không thể tải cuộc trò chuyện");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadMessageHistory = async (conversationId) => {
    try {
      const response = await messageSocket.getMessages(conversationId);
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
      ShowToast("error", "Không thể tải lịch sử tin nhắn");
    }
  };

  const getStarted = () => {
    if (conversation) {
      setScreenState("chat");
      ShowToast("success", "Topic: " + conversation.topic);
    } else {
      setVisible({ ...visible, inputTopic: true });
    }
  };

  const handleCreateConversation = async (topic) => {
    try {
      const response = await messageSocket.createConversation(user?._id, topic);
      if (response.status === 200) {
        setScreenState("chat");
        setConversation(response.data?.data);
        setVisible({ ...visible, inputTopic: false });
        ShowToast("success", "Cuộc trò chuyện đã được tạo");
      }
    } catch (error) {
      console.error("Create conversation error:", error);
      ShowToast("error", "Không thể tạo cuộc trò chuyện");
    }
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
          "Quyền truy cập bị từ chối",
          "Ứng dụng cần quyền truy cập vào thư viện ảnh để chọn ảnh. Vui lòng cấp quyền trong cài đặt.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
          ],
          { cancelable: false }
        );
        ShowToast("error", "Cần quyền truy cập vào thư viện ảnh để sử dụng tính năng này");
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
      ShowToast("error", "Có lỗi xảy ra khi chọn ảnh. Vui lòng thử lại.");
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
      ShowToast("error", "Không thể tải ảnh lên. Vui lòng thử lại.");
      throw error;
    }
  };

  const onSend = async () => {
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

        // Gửi tin nhắn qua socket mà không thêm vào messages ngay
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

          // Gửi tin nhắn qua socket mà không thêm vào messages ngay
          await messageSocket.sendMessage(conversation._id, messageData);
        }
      }

      setInputText("");
      setSelectedImages([]);
      setUploadProgress(0);
    } catch (error) {
      console.error("Send message error:", error);
      ShowToast("error", "Có lỗi xảy ra khi gửi tin nhắn");
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
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </MainLayoutWrapper>
    );
  }

  if (!conversation) {
    return (
      <MainLayoutWrapper headerHidden={true}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Select a conversation to start</Text>
        </View>
      </MainLayoutWrapper>
    );
  }

  return (
    <MainLayoutWrapper headerHidden={true}>
      {screenState === "onboarding" ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          style={{
            ...styles.messagesList,
            paddingTop: HEIGHT * 0.05,
            alignItems: "center",
          }}
        >
          <Text style={styles.onboardingTitle}>Chatting App That Connects People</Text>
          <Text style={styles.onboardingDescription}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore.
          </Text>
          <TouchableOpacity style={styles.getStartedButton} onPress={getStarted}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      ) : (
        <>
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
                disabled={isSending}
              >
                <Ionicons name="image-outline" size={24} color={isSending ? "#ccc" : "#999"} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                multiline
                editable={!isSending}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (inputText.trim() === "" && selectedImages.length === 0) || isSending
                    ? styles.sendButtonDisabled
                    : {},
                ]}
                onPress={onSend}
                disabled={(inputText.trim() === "" && selectedImages.length === 0) || isSending}
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
      )}

      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setImageViewerVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {selectedViewImage && (
            <Image
              source={{ uri: selectedViewImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <InputModal
        visible={visible.inputTopic}
        onClose={() => {
          setVisible({ ...visible, inputTopic: false });
        }}
        onSubmit={handleCreateConversation}
        title={"Enter Topic Name"}
        placeholder={"Type here..."}
      />
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 60,
    backgroundColor: "#075E54",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    width: "70%",
  },
  onboardingDescription: {
    fontSize: 16,
    marginBottom: 20,
    color: "#6A6D75",
    textAlign: "center",
    width: "70%",
  },
  getStartedButton: {
    width: WIDTH * 0.9,
    backgroundColor: "#40B491",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: "center",
  },
  getStartedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backgroundImage: {
    position: "absolute",
    top: -HEIGHT * 0.15,
    left: 0,
    right: 0,
    width: WIDTH,
    height: HEIGHT,
  },
  backIcon: {
    position: "absolute",
    left: "8%",
    top: "8%",
    zIndex: 999,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  otherMessage: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
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
    position: "relative",
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
    width: "100%",
    padding: 12,
    paddingVertical: 6,
    borderRadius: 50,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default Message;
