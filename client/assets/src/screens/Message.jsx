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
  const { theme, themeMode } = useTheme();
  const flatListRef = useRef(null);

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedViewImage, setSelectedViewImage] = useState(null);

  useEffect(() => {
    messageSocket.init({ userId: user?._id, token: user?.accessToken });
    loadConversation();

    const handleReceiveMessage = (message) => {
      console.log("Receive Message : ", message);

      const messageToReceived = {
        id: message._id,
        text: message.text,
        sender: message.senderId === user?._id ? "me" : "other",
        timestamp: message.updatedAt,
        imageUrl: message.imageUrl || [],
      };

      setMessages((previousMessages) => {
        if (previousMessages.some((msg) => msg.id === messageToReceived.id)) {
          return previousMessages;
        }
        return [...previousMessages, messageToReceived];
      });
    };

    messageSocket.on("receive_message", handleReceiveMessage);

    return () => {
      messageSocket.disconnect();
      messageSocket.off("receive_message", handleReceiveMessage);
    };
  }, [user?._id, user?.accessToken]);

  const loadConversation = async () => {
    const response = await getUserConversations(user?._id);
    if (response.status === 200) {
      if (response.data?.data[0]) {
        setConversation(response.data?.data[0]);
        if (response.data?.data[0]?._id) {
          loadMessgageHistory(response.data?.data[0]._id);
        }
      } else {
        handleCreateConversation("defaultTopic");
      }
    } else {
      handleCreateConversation("defaultTopic");
    }
  };

  const loadMessgageHistory = async (conversationId) => {
    const response = await getConversationMessage(conversationId);
    if (response.status === 200) {
      setMessages(
        response.data?.data?.map((item) => ({
          ...item,
          id: item._id,
          sender: item.senderId === user?._id ? "me" : "other",
        }))
      );
    }
  };

  const getStarted = () => {
    if (conversation) {
      setScreenState("chat");
      ShowToast("success", "Topic : " + conversation.topic);
    } else {
      setVisible({ ...visible, inputTopic: true });
    }
  };

  const handleCreateConversation = async (topic) => {
    const response = await createConversation(user?._id, topic);
    if (response.status === 200) {
      setScreenState("chat");
      setConversation(response.data?.data);
      setVisible({ ...visible, inputTopic: false });
    }
  };

  const handleImagePress = (imageUrl) => {
    setSelectedViewImage(imageUrl);
    setImageViewerVisible(true);
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
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
  };

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleUploadImages = async () => {
    if (selectedImages.length > 0) {
      const imageFiles = selectedImages.map((img) => ({
        uri: img.uri,
        type: "image/jpeg",
        name: `image_${Date.now()}.jpg`,
      }));

      const uploadedImages = await uploadImages(imageFiles);
      return uploadedImages;
    }
    return [];
  };

  const onSend = async () => {
    if (inputText.trim() === "" && selectedImages.length === 0) return;

    try {
      const uploadedImages = await handleUploadImages();
      console.log("Receive Message : ", {
        conversationId: conversation._id,
        senderId: user?._id,
        receiverId: "",
        text: inputText,
        imageUrl: arrayToString(uploadedImages.map((item) => item.url)),
        createdAt: new Date(),
      });

      messageSocket.emit("send_message", {
        conversationId: conversation._id,
        senderId: user?._id,
        receiverId: "",
        text: inputText,
        imageUrl: arrayToString(uploadedImages.map((item) => item.url)),
        createdAt: new Date(),
      });

      setInputText("");
      setSelectedImages([]);
    } catch (error) {
      console.error("Send message error:", error);
      ShowToast("error", "Có lỗi xảy ra khi gửi tin nhắn");
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender === "me";

    return (
      <View
        style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}
        key={index}
      >
        <Text style={[styles.messageSender, isMyMessage && styles.mySender]}>{item.text}</Text>

        {/* Hiển thị các ảnh trong tin nhắn */}
        {item.imageUrl && (
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
        {introduceText.map((item, key) => {
          return (
            <TouchableOpacity
              style={{ margin: 6 }}
              onPress={() => {
                setInputText(item);
              }}
              key={key}
            >
              <Text
                style={{
                  ...styles.introduceText,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
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
            keyExtractor={(item) => {
              if (!item.id) {
                console.warn("Message missing id:", item);
                return `temp-${Date.now()}-${Math.random()}`;
              }
              return item.id;
            }}
            style={{
              ...styles.messagesList,
              backgroundColor: theme.editModalbackgroundColor,
            }}
            contentContainerStyle={styles.messagesListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Hiển thị ảnh đã chọn */}
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
              <TouchableOpacity style={styles.attachButton} onPress={pickImages}>
                <Ionicons name="image-outline" size={24} color="#999" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() === "" &&
                    selectedImages.length === 0 &&
                    styles.sendButtonDisabled,
                ]}
                onPress={onSend}
                disabled={inputText.trim() === "" && selectedImages.length === 0}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Image Viewer Modal */}
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
