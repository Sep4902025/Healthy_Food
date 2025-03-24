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
          if (response?.data?.data && response.data.data.length > 0) {
            const conversation = response.data.data[0];
            setCurrentConversation(conversation);
            localStorage.setItem("currentConversation", JSON.stringify(conversation));
          }
        } catch (error) {
          console.error("Error fetching conversation:", error);
        }
      } else {
        setCurrentConversation(null);
        localStorage.removeItem("currentConversation");
      }
    };

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
        console.error("User ID not found, please sign in!");
        return;
      }

      if (!selectedTopic) {
        console.error("Please select a consultation topic!");
        return;
      }

      const response = await ChatService.createConversation({
        userId: user._id,
        topic: selectedTopic,
      });

      if (response?.data?.data) {
        setCurrentConversation(response.data.data);
        localStorage.setItem("currentConversation", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const StartChatForm = ({ onSubmit, onClose }) => {
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
        onSubmit(finalTopic);
      } else {
        console.error("Invalid topic!");
      }
    };

    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Start Consultation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select consultation topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select topic --</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {selectedTopic === "Other" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter custom topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your consultation topic..."
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!(selectedTopic && (selectedTopic !== "Other" || customTopic.trim()))}
          className="w-full py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Consultation
        </button>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 z-50"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[380px] h-[400px] bg-white rounded-lg shadow-xl z-40 overflow-hidden">
          {currentConversation ? (
            <ChatWindow
              conversation={currentConversation}
              setCurrentConversation={setCurrentConversation}
            />
          ) : user?._id ? (
            <StartChatForm onSubmit={handleStartChat} onClose={() => setIsOpen(false)} />
          ) : (
            <div className="p-4 text-center text-gray-600">
              Please sign in to start a consultation
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default UserChatButton;
