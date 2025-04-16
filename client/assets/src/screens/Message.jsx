import React, { useState, useRef, useEffect } from "react"; // Import các hook cơ bản từ React
import {
  View, // Component để tạo khung bố cục
  Text, // Component để hiển thị văn bản
  TextInput, // Component để nhập liệu
  TouchableOpacity, // Component tạo vùng có thể nhấn
  FlatList, // Component hiển thị danh sách có thể cuộn với hiệu suất cao
  KeyboardAvoidingView, // Component giúp nội dung không bị che khi bàn phím mở
  Platform, // API để xác định nền tảng đang chạy
  StyleSheet, // API để tạo và quản lý style
  Image, // Component hiển thị hình ảnh
  Dimensions, // API lấy kích thước màn hình
  ScrollView, // Component tạo vùng có thể cuộn
  Modal, // Component hiển thị cửa sổ pop-up
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Import thư viện chọn ảnh từ Expo
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper"; // Import component layout chính
import messageSocket from "../services/messageSocket"; // Import service xử lý socket tin nhắn
import { userSelector } from "../redux/selectors/selector"; // Import selector để lấy thông tin user từ Redux
import { useSelector } from "react-redux"; // Hook để truy cập dữ liệu từ Redux store
import {
  createConversation, // Hàm tạo cuộc trò chuyện mới
  getConversationMessage, // Hàm lấy tin nhắn của cuộc trò chuyện
  getUserConversations, // Hàm lấy danh sách cuộc trò chuyện của người dùng
} from "../services/conversationService";
import InputModal from "../components/modal/InputModal"; // Import modal nhập liệu
import Ionicons from "../components/common/VectorIcons/Ionicons"; // Import icon từ Ionicons
import { useTheme } from "../contexts/ThemeContext"; // Import hook để sử dụng theme
import ShowToast from "../components/common/CustomToast"; // Import component hiển thị thông báo
import { arrayToString, stringToArray } from "../utils/common"; // Import các hàm tiện ích xử lý dữ liệu
import { uploadImages } from "../services/cloundaryService"; // Import service để tải lên hình ảnh

const WIDTH = Dimensions.get("window").width; // Lấy chiều rộng màn hình
const HEIGHT = Dimensions.get("window").height; // Lấy chiều cao màn hình

function Message({ navigation }) { // Component chính của màn hình tin nhắn
  const user = useSelector(userSelector); // Lấy thông tin người dùng từ Redux

  const [messages, setMessages] = useState([]); // State lưu danh sách tin nhắn
  const [conversation, setConversation] = useState({}); // State lưu thông tin cuộc trò chuyện
  const [screenState, setScreenState] = useState("chat"); // State để quản lý trạng thái màn hình
  const [inputText, setInputText] = useState(""); // State lưu nội dung đang nhập
  const [visible, setVisible] = useState({ inputTopic: false }); // State quản lý hiển thị modal
  const [selectedImages, setSelectedImages] = useState([]); // State lưu danh sách ảnh đã chọn
  const { theme, themeMode } = useTheme(); // Lấy theme hiện tại
  const flatListRef = useRef(null); // Tham chiếu đến FlatList để điều khiển cuộn

  const [imageViewerVisible, setImageViewerVisible] = useState(false); // State quản lý hiển thị modal xem ảnh
  const [selectedViewImage, setSelectedViewImage] = useState(null); // State lưu ảnh đang xem

  useEffect(() => { // Hook chạy khi component được mount
    messageSocket.init({ userId: user?._id, token: user?.accessToken }); // Khởi tạo kết nối socket
    loadConversation(); // Tải dữ liệu cuộc trò chuyện

    const handleReceiveMessage = (message) => { // Hàm xử lý khi nhận tin nhắn mới
      console.log("Receive Message : ", message);

      const messageToReceived = { // Định dạng lại tin nhắn nhận được
        id: message._id,
        text: message.text,
        sender: message.senderId === user?._id ? "me" : "other", // Xác định người gửi là ai
        timestamp: message.updatedAt,
        imageUrl: message.imageUrl || [],
      };

      setMessages((previousMessages) => { // Cập nhật danh sách tin nhắn
        if (previousMessages.some((msg) => msg.id === messageToReceived.id)) { // Kiểm tra tin nhắn đã tồn tại chưa
          return previousMessages;
        }
        return [...previousMessages, messageToReceived]; // Thêm tin nhắn mới vào danh sách
      });
    };

    messageSocket.on("receive_message", handleReceiveMessage); // Đăng ký lắng nghe sự kiện nhận tin nhắn

    return () => { // Hàm dọn dẹp khi component unmount
      messageSocket.disconnect(); // Ngắt kết nối socket
      messageSocket.off("receive_message", handleReceiveMessage); // Hủy đăng ký lắng nghe
    };
  }, [user?._id, user?.accessToken]);

  const loadConversation = async () => { // Hàm tải dữ liệu cuộc trò chuyện
    const response = await getUserConversations(user?._id); // Gọi API lấy danh sách cuộc trò chuyện
    if (response.status === 200) { // Nếu thành công
      if (response.data?.data[0]) { // Nếu có cuộc trò chuyện
        setConversation(response.data?.data[0]); // Lưu thông tin cuộc trò chuyện đầu tiên
        if (response.data?.data[0]?._id) { // Nếu có ID cuộc trò chuyện
          loadMessgageHistory(response.data?.data[0]._id); // Tải lịch sử tin nhắn
        }
      } else { // Nếu không có cuộc trò chuyện nào
        handleCreateConversation("defaultTopic"); // Tạo cuộc trò chuyện mới với chủ đề mặc định
      }
    } else { // Nếu có lỗi
      handleCreateConversation("defaultTopic"); // Tạo cuộc trò chuyện mới với chủ đề mặc định
    }
  };

  const loadMessgageHistory = async (conversationId) => { // Hàm tải lịch sử tin nhắn
    const response = await getConversationMessage(conversationId); // Gọi API lấy tin nhắn
    if (response.status === 200) { // Nếu thành công
      setMessages( // Định dạng lại và lưu danh sách tin nhắn
        response.data?.data?.map((item) => ({
          ...item,
          id: item._id,
          sender: item.senderId === user?._id ? "me" : "other", // Xác định người gửi là ai
        }))
      );
    }
  };

  const getStarted = () => { // Hàm xử lý khi bắt đầu trò chuyện
    if (conversation) { // Nếu đã có cuộc trò chuyện
      setScreenState("chat"); // Chuyển sang trạng thái chat
      ShowToast("success", "Topic : " + conversation.topic); // Hiển thị thông báo chủ đề
    } else { // Nếu chưa có cuộc trò chuyện
      setVisible({ ...visible, inputTopic: true }); // Hiển thị modal nhập chủ đề
    }
  };

  const handleCreateConversation = async (topic) => { // Hàm tạo cuộc trò chuyện mới
    const response = await createConversation(user?._id, topic); // Gọi API tạo cuộc trò chuyện
    if (response.status === 200) { // Nếu thành công
      setScreenState("chat"); // Chuyển sang trạng thái chat
      setConversation(response.data?.data); // Lưu thông tin cuộc trò chuyện mới
      setVisible({ ...visible, inputTopic: false }); // Ẩn modal nhập chủ đề
    }
  };

  const handleImagePress = (imageUrl) => { // Hàm xử lý khi nhấn vào ảnh
    setSelectedViewImage(imageUrl); // Lưu URL ảnh được chọn
    setImageViewerVisible(true); // Hiển thị modal xem ảnh
  };

  const pickImages = async () => { // Hàm chọn ảnh từ thư viện
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); // Yêu cầu quyền truy cập thư viện ảnh

    if (status !== "granted") { // Nếu không được cấp quyền
      ShowToast(
        "error",
        "Cần quyền truy cập vào thư viện ảnh để sử dụng tính năng này"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({ // Mở thư viện ảnh
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Chỉ chọn ảnh
      allowsMultipleSelection: true, // Cho phép chọn nhiều ảnh
      aspect: [4, 3], // Tỷ lệ khung hình
      quality: 1, // Chất lượng ảnh
    });

    if (!result.canceled) { // Nếu người dùng đã chọn ảnh
      setSelectedImages(result.assets); // Lưu danh sách ảnh đã chọn
    }
  };

  const removeImage = (index) => { // Hàm xóa ảnh đã chọn
    const newImages = [...selectedImages]; // Tạo bản sao của danh sách ảnh
    newImages.splice(index, 1); // Xóa ảnh tại vị trí index
    setSelectedImages(newImages); // Cập nhật danh sách ảnh
  };

  const handleUploadImages = async () => { // Hàm tải lên ảnh đã chọn
    if (selectedImages.length > 0) { // Nếu có ảnh đã chọn
      const imageFiles = selectedImages.map((img) => ({ // Định dạng lại dữ liệu ảnh
        uri: img.uri,
        type: "image/jpeg",
        name: `image_${Date.now()}.jpg`,
      }));

      const uploadedImages = await uploadImages(imageFiles); // Gọi API tải lên ảnh
      return uploadedImages; // Trả về kết quả
    }
    return []; // Trả về mảng rỗng nếu không có ảnh
  };

  const onSend = async () => { // Hàm gửi tin nhắn
    if (inputText.trim() === "" && selectedImages.length === 0) return; // Không làm gì nếu không có nội dung

    try {
      const uploadedImages = await handleUploadImages(); // Tải lên ảnh đã chọn
      console.log("Receive Message : ", { // In ra thông tin tin nhắn
        conversationId: conversation._id,
        senderId: user?._id,
        receiverId: conversation?.nutritionistId ?? "",
        text: inputText,
        imageUrl: arrayToString(uploadedImages.map((item) => item.url)),
        createdAt: new Date(),
      });

      messageSocket.emit("send_message", { // Gửi tin nhắn qua socket
        conversationId: conversation._id,
        senderId: user?._id,
        receiverId: conversation?.nutritionistId ?? "",
        text: inputText,
        imageUrl: arrayToString(uploadedImages.map((item) => item.url)),
        createdAt: new Date(),
      });

      setInputText(""); // Xóa nội dung đã nhập
      setSelectedImages([]); // Xóa danh sách ảnh đã chọn
    } catch (error) { // Xử lý lỗi
      console.error("Send message error:", error);
      ShowToast("error", "Có lỗi xảy ra khi gửi tin nhắn");
    }
  };

  const renderMessage = ({ item, index }) => { // Hàm render mỗi tin nhắn
    const isMyMessage = item.sender === "me"; // Kiểm tra tin nhắn của mình hay người khác

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage, // Áp dụng style khác nhau cho tin nhắn của mình và người khác
        ]}
        key={index}
      >
        <Text style={[styles.messageSender, isMyMessage && styles.mySender]}>
          {item.text}
        </Text>

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

  const renderIntroduce = () => { // Hàm render phần giới thiệu
    const introduceText = [ // Danh sách các gợi ý tin nhắn
      "Hello",
      "I need some help",
      "Healthy food",
      "Dishes for today",
    ];

    return (
      <ScrollView
        style={{
          ...styles.introduceTextContainer,
          backgroundColor: theme.editModalbackgroundColor, // Áp dụng màu nền từ theme
        }}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
      >
        {introduceText.map((item, key) => { // Render từng mục gợi ý
          return (
            <TouchableOpacity
              style={{ margin: 6 }}
              onPress={() => {
                setInputText(item); // Khi nhấn vào gợi ý, đặt nội dung vào ô nhập liệu
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
    <MainLayoutWrapper headerHidden={true}> {/* Sử dụng layout chính không hiển thị header */}
      {screenState === "onboarding" ? ( // Nếu đang ở trạng thái onboarding
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"} // Xử lý khác nhau cho iOS và Android
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Offset cho iOS
          style={{
            ...styles.messagesList,

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
      ) : ( // Nếu đang ở trạng thái chat
        <>
          <FlatList
            ref={flatListRef} // Gán tham chiếu để điều khiển cuộn
            data={messages} // Dữ liệu danh sách tin nhắn
            renderItem={renderMessage} // Hàm render từng tin nhắn
            keyExtractor={(item) => { // Hàm tạo key cho mỗi mục
              if (!item.id) { // Xử lý trường hợp không có id
                console.warn("Message missing id:", item);
                return `temp-${Date.now()}-${Math.random()}`; // Tạo id tạm thời
              }
              return item.id;
            }}
            style={{
              ...styles.messagesList,
              backgroundColor: theme.editModalbackgroundColor, // Áp dụng màu nền từ theme
            }}
            contentContainerStyle={styles.messagesListContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true }) // Cuộn xuống cuối khi nội dung thay đổi
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true }) // Cuộn xuống cuối khi layout hoàn thành
            }
          />

          {/* Hiển thị ảnh đã chọn */}
          {selectedImages.length > 0 && (
            <View
              style={{
                ...styles.selectedImagesContainer,
                backgroundColor: theme.editModalbackgroundColor, // Áp dụng màu nền từ theme
              }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.selectedImageWrapper}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.selectedImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)} // Xóa ảnh khi nhấn nút
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} // Xử lý khác nhau cho iOS và Android
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Offset cho iOS
          >
            {!messages[0] && renderIntroduce()} {/* Hiển thị phần giới thiệu nếu không có tin nhắn */}
            <View
              style={{
                ...styles.inputContainer,
                backgroundColor: theme.editModalbackgroundColor, // Áp dụng màu nền từ theme
                borderTopWidth: themeMode === "light" ? 1 : 0, // Hiển thị viền nếu đang ở chế độ sáng
              }}
            >
              <TouchableOpacity
                style={styles.attachButton}
                onPress={pickImages} // Chọn ảnh khi nhấn nút
              >
                <Ionicons name="image-outline" size={24} color="#999" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText} // Cập nhật nội dung khi nhập liệu
                placeholder="Type a message..."
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() === "" &&
                    selectedImages.length === 0 &&
                    styles.sendButtonDisabled, // Áp dụng style khác nếu không có nội dung
                ]}
                onPress={onSend} // Gửi tin nhắn khi nhấn nút
                disabled={
                  inputText.trim() === "" && selectedImages.length === 0 // Vô hiệu hóa nút nếu không có nội dung
                }
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible} // Hiển thị modal nếu imageViewerVisible là true
        transparent={true} // Modal trong suốt
        animationType="fade" // Hiệu ứng fade khi hiển thị
        onRequestClose={() => setImageViewerVisible(false)} // Đóng modal khi nhấn nút back
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)} // Đóng modal khi nhấn nút đóng
          >
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
        visible={visible.inputTopic} // Hiển thị modal nếu visible.inputTopic là true
        onClose={() => {
          setVisible({ ...visible, inputTopic: false }); // Đóng modal khi nhấn nút đóng
        }}
        onSubmit={handleCreateConversation} // Tạo cuộc trò chuyện mới khi xác nhận
        title={"Enter Topic Name"}
        placeholder={"Type here..."}
      />
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({ // Định nghĩa các style
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

export default Message; // Export component Message để sử dụng ở nơi khác