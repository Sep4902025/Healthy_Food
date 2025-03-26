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
} from "react-native";
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

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function Message({ navigation }) {
  const user = useSelector(userSelector);

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState({});
  const [screenState, setScreenState] = useState("chat"); // onboarding
  const [inputText, setInputText] = useState("");
  const [visible, setVisible] = useState({ inputTopic: false });
  const { theme, themeMode } = useTheme();
  const flatListRef = useRef(null);

  useEffect(() => {
    messageSocket.init({ userId: user?._id, token: user?.accessToken });
    loadConversation();

    const handleReceiveMessage = (message) => {
      console.log("New message received:", message);
      const messageToReceived = {
        id: message._id,
        text: message.text,
        sender: message.senderId === user?._id ? "me" : "other", // Check senderId to determine if it's the user's message
        timestamp: message.updatedAt,
      };

      setMessages((previousMessages) => {
        if (previousMessages.some((msg) => msg.id === messageToReceived.id)) {
          return previousMessages; // Skip adding the duplicate message
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
      setConversation(response.data?.data[0]);
      if (response.data?.data[0]?._id) {
        loadMessgageHistory(response.data?.data[0]._id);
      }
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

  const onSend = () => {
    messageSocket.emit("send_message", {
      conversationId: conversation._id,
      senderId: user?._id,
      receiverId: "",
      text: inputText,
      createdAt: new Date(),
    });
    setInputText("");
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender === "me";

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={[styles.messageSender, isMyMessage && styles.mySender]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, isMyMessage && styles.mySender]}>
          {new Date(item.updatedAt || item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <MainLayoutWrapper headerHidden={true}>
      <Image
        source={
          themeMode === "light"
            ? require("../../assets/image/ChatBG.png")
            : require("../../assets/image/ChatBG-dark.png")
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      {/* {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={32}
            color={theme.backButtonColor}
          />
        </TouchableOpacity>
      )} */}
      {screenState === "onboarding" ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          style={{
            ...styles.messagesList,
            marginTop: HEIGHT * 0.6,
            paddingTop: HEIGHT * 0.05,
            alignItems: "center",
          }}
        >
          <Text style={styles.onboardingTitle}>
            Chatting App That Connects People
          </Text>
          <Text style={styles.onboardingDescription}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore.
          </Text>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={getStarted}
          >
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
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={{
              ...styles.inputContainer,
              backgroundColor: theme.editModalbackgroundColor,
              borderTopWidth: themeMode === "light" ? 1 : 0,
            }}
          >
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={onSend}
              disabled={inputText.trim() === ""}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </>
      )}
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
    marginTop: HEIGHT * 0.06,
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
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Message;
