import { FiMessageCircle, FiX } from "react-icons/fi";
import ChatWindow from "./ChatWindow";
import { useState, useEffect } from "react";
import ChatService from "../../services/chat.service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";

const UserChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const { user } = useSelector(selectAuth);

  useEffect(() => {
    const fetchConversation = async () => {
      if (user?._id) {
        try {
          const response = await ChatService.getUserConversations(user._id);
          // Kiểm tra nếu có cuộc trò chuyện trong response.data.data
          if (response?.data?.data && response.data.data.length > 0) {
            const conversation = response.data.data[0]; // Lấy conversation đầu tiên
            setCurrentConversation(conversation);
            localStorage.setItem("currentConversation", JSON.stringify(conversation));
          }
        } catch (error) {
          console.error("Lỗi lấy cuộc trò chuyện:", error);
        }
      } else {
        setCurrentConversation(null);
        localStorage.removeItem("currentConversation");
      }
    };

    // Chỉ lấy savedConversation khi có user
    if (user?._id) {
      const savedConversation = localStorage.getItem("currentConversation");
      if (savedConversation) {
        setCurrentConversation(JSON.parse(savedConversation));
      }
      fetchConversation();
    }
  }, [user?._id]);

  const handleStartChat = async (selectedTopic) => {
    try {
      if (!user?._id) {
        console.error("Không tìm thấy userId, vui lòng đăng nhập!");
        return;
      }

      if (!selectedTopic) {
        console.error("Vui lòng chọn một chủ đề tư vấn!");
        return;
      }

      // Tạo cuộc trò chuyện mới với đúng format API yêu cầu
      const response = await ChatService.createConversation({
        userId: user._id,
        topic: selectedTopic,
      });

      // Kiểm tra response và lấy data đúng cấu trúc
      if (response?.data?.data) {
        setCurrentConversation(response.data.data);
        localStorage.setItem("currentConversation", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Lỗi tạo cuộc trò chuyện:", error);
    }
  };

  // Form bắt đầu chat
  const StartChatForm = ({ onSubmit, onClose }) => {
    const [selectedTopic, setSelectedTopic] = useState("");
    const [customTopic, setCustomTopic] = useState(""); // Thêm state mới cho chủ đề tùy chỉnh

    const topics = [
      "Tôi muốn tư vấn chế độ ăn!",
      "Tôi muốn tư vấn giảm cân",
      "Tôi muốn tư vấn tăng cân",
      "Tôi muốn tư vấn dinh dưỡng cho bệnh lý",
      "Khác",
    ];

    const handleSubmit = () => {
      // Kiểm tra nếu chọn "Khác" thì sử dụng customTopic
      const finalTopic = selectedTopic === "Khác" ? customTopic : selectedTopic;

      if (finalTopic.trim()) {
        onSubmit(finalTopic); // Gửi chủ đề cuối cùng vào hàm onSubmit
      } else {
        console.error("Chủ đề không hợp lệ!");
      }
    };

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bắt đầu tư vấn</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn chủ đề tư vấn
            </label>
            <select
              value={selectedTopic} // Truyền state selectedTopic
              onChange={(e) => setSelectedTopic(e.target.value)} // Cập nhật state khi chọn chủ đề
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn chủ đề --</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {selectedTopic === "Khác" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập chủ đề khác
              </label>
              <input
                type="text"
                value={customTopic} // Liên kết với state customTopic
                onChange={(e) => setCustomTopic(e.target.value)} // Cập nhật state khi nhập chủ đề
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập chủ đề cần tư vấn..."
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!(selectedTopic && (selectedTopic !== "Khác" || customTopic.trim()))} // Kiểm tra điều kiện hợp lệ
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bắt đầu tư vấn
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Nút chat cố định góc phải */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 z-50"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[380px] bg-white rounded-lg shadow-xl z-40">
          {currentConversation ? (
            <ChatWindow conversation={currentConversation} />
          ) : user?._id ? (
            <StartChatForm onSubmit={handleStartChat} onClose={() => setIsOpen(false)} />
          ) : (
            <div className="p-4 text-center text-gray-600">
              Vui lòng đăng nhập để bắt đầu tư vấn
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default UserChatButton;
