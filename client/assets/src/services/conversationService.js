// Import module axiosInstance đã được cấu hình từ file axiosInstance.js
import axiosInstance from "./axiosInstance";

// Hàm lấy danh sách cuộc hội thoại của một người dùng
export const getUserConversations = async (userId) => {
  try {
    // Gửi request GET đến endpoint '/conversations/{userId}' để lấy danh sách cuộc hội thoại
    const response = await axiosInstance.get(`/conversations/${userId}`);
    // Trả về toàn bộ response nhận được từ server
    return response;
  } catch (error) {
    // Ghi log lỗi nếu xảy ra exception trong quá trình gửi request
    console.log("getUserConversations in service/conversations error : ", error);
    // Trả về đối tượng lỗi để xử lý ở component gọi hàm này
    return error;
  }
};

// Hàm tạo mới một cuộc hội thoại
export const createConversation = async (userId, topic) => {
  try {
    // Chuẩn bị dữ liệu gửi đi bao gồm userId và chủ đề cuộc hội thoại
    const data = {
      userId: userId,
      topic: topic,
    };
    // Gửi request POST đến endpoint '/conversations' kèm dữ liệu data để tạo cuộc hội thoại mới
    const response = await axiosInstance.post(`/conversations`, data);
    // Trả về toàn bộ response nhận được từ server
    return response;
  } catch (error) {
    // Ghi log lỗi nếu xảy ra exception trong quá trình gửi request
    console.log("createConversation in service/conversations error : ", error);
    // Trả về đối tượng lỗi để xử lý ở component gọi hàm này
    return error;
  }
};

// Hàm lấy danh sách tin nhắn của một cuộc hội thoại cụ thể
export const getConversationMessage = async (conversationId) => {
  try {
    // Gửi request GET đến endpoint '/conversations/{conversationId}/messages' để lấy tin nhắn
    const response = await axiosInstance.get(`/conversations/${conversationId}/messages`);
    // Trả về toàn bộ response nhận được từ server
    return response;
  } catch (error) {
    // Ghi log lỗi nếu xảy ra exception trong quá trình gửi request
    console.log("getConversationMessage in service/conversations error : ", error);
    // Trả về đối tượng lỗi để xử lý ở component gọi hàm này
    return error;
  }
};