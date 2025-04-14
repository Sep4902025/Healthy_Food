import React, { useState, useRef, useEffect } from "react";
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
import {
  createConversation,
  getConversationMessage,
  getUserConversations,
} from "../services/conversationService";
import InputModal from "../components/modal/InputModal";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import { useTheme } from "../contexts/ThemeContext";
import ShowToast from "../components/common/CustomToast";
import { arrayToString, stringToArray } from "../utils/common";
import { uploadImages } from "../services/cloundaryService";
import MessageService from "../services/messageService";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function Message({ navigation }) {
  const user = useSelector(userSelector);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState({});
  const [screenState, setScreenState] = useState("chat");
  const [inputText, setInputText] = useState("");
  const [visible, setVisible] = useState({ inputTopic: false });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSending, setIsSending] = useState(false);
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

    const handleReceiveMessage = (message) => {
      console.log("Receive Message:", message);
      // Chỉ xử lý tin nhắn từ người khác
      if (message.conversationId === conversation._id && message.senderId !== user._id) {
        let adjustedType = message.type || "text";
        if (message.imageUrl && !message.videoUrl && adjustedType === "text") {
          adjustedType = "image";
        } else if (message.videoUrl && adjustedType === "text") {
          adjustedType = "video";
        }

        const messageToReceived = {
          id: message._id,
          text: message.text,
          sender: "other",
          timestamp: message.updatedAt,
          imageUrl: message.imageUrl || null,
          type: adjustedType,
        };

        setMessages((previousMessages) => {
          // Kiểm tra trùng lặp dựa trên id
          if (previousMessages.some((msg) => msg.id === messageToReceived.id)) {
            console.log("Duplicate message detected:", messageToReceived);
            return previousMessages;
          }
          return [...previousMessages, messageToReceived];
        });
      }
    };

    messageSocket.on("receive_message", handleReceiveMessage);

    return () => {
      messageSocket.disconnect();
      messageSocket.off("receive_message", handleReceiveMessage);
    };
  }, [user?._id, user?.accessToken, conversation?._id]);

  const loadConversation = async () => {
    try {
      const response = await getUserConversations(user?._id);
      if (response.status === 200 && response.data?.data[0]) {
        setConversation(response.data.data[0]);
        loadMessgageHistory(response.data.data[0]._id);
      } else {
        handleCreateConversation("defaultTopic");
      }
    } catch (error) {
      console.error("Load conversation error:", error);
      ShowToast("error", "Không thể tải cuộc trò chuyện");
    }
  };

  const loadMessgageHistory = async (conversationId) => {
    try {
      const response = await getConversationMessage(conversationId);
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
            id: item._id,
            sender: item.senderId === user?._id ? "me" : "other",
            type: adjustedType,
          };
        });

        setMessages((prevMessages) => {
          // Chỉ thêm tin nhắn mới, tránh trùng lặp
          const existingIds = new Set(prevMessages.map((msg) => msg.id));
          const filteredMessages = newMessages.filter((msg) => !existingIds.has(msg.id));
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
      const response = await MessageService.createConversation(user?._id, topic);
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
      const uploadedImages = await uploadImages(imageFiles);
      return uploadedImages;
    } catch (error) {
      console.error("Upload images error:", error);
      throw error;
    }
  };

  const onSend = async () => {
    if (inputText.trim() === "" && selectedImages.length === 0) return;
    if (isSending) return;

    setIsSending(true);

    try {
      let messageData;

      if (selectedImages.length > 0) {
        const uploadedImages = await handleUploadImages();
        const imageUrl = arrayToString(uploadedImages.map((item) => item.url));

        messageData = {
          conversationId: conversation._id,
          senderId: user._id,
          text: "",
          imageUrl: imageUrl || null,
          videoUrl: null,
          type: "image",
        };
      } else {
        messageData = {
          conversationId: conversation._id,
          senderId: user._id,
          text: inputText,
          imageUrl: null,
          videoUrl: null,
          type: "text",
        };
      }
      //#####GỬI TIN NHẮN MỚI#####
      const response = await MessageService.sendMessage(conversation._id, messageData);
      if (response.status === 201 && response.data?.data) {
        const newMessage = response.data.data;

        setMessages((previousMessages) => {
          // Kiểm tra trùng lặp trước khi thêm
          if (previousMessages.some((msg) => msg.id === newMessage._id)) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            {
              id: newMessage._id,
              text: newMessage.text,
              sender: "me",
              timestamp: newMessage.updatedAt,
              imageUrl: newMessage.imageUrl || null,
              type: newMessage.type,
            },
          ];
        });
      }

      setInputText("");
      setSelectedImages([]);
    } catch (error) {
      console.error("Send message error:", error);
      ShowToast("error", "Có lỗi xảy ra khi gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }) => {
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
                key={`${item.id}-image-${imgIndex}`}
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
            keyExtractor={(item) => item.id || `temp-${Date.now()}-${Math.random()}`}
            style={{
              ...styles.messagesList,
              backgroundColor: theme.editModalbackgroundColor,
            }}
            contentContainerStyle={styles.messagesListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
});

export default Message;
