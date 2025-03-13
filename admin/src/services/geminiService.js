import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Lấy câu hỏi từ AI
export const getQuizQuestions = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        Hãy tạo 10 câu hỏi khảo sát đơn giản về sở thích ăn uống của người dùng.
        Câu hỏi chỉ liên quan đến các yếu tố như: loại thịt yêu thích, vị giác (cay, mặn, ngọt...), thói quen ăn uống.
        Mỗi lần làm lại hãy hỏi các câu đa dạng hơn.
        Mỗi câu có 4 lựa chọn, định dạng như sau:  
        "Câu hỏi? | Đáp án A | Đáp án B | Đáp án C | Đáp án D"  
        Chỉ trả về danh sách câu hỏi đúng định dạng, không có số thứ tự, không có giải thích.
      `;
      const result = await model.generateContent(prompt);
      const responseText = await result.response.text().trim(); // Xóa khoảng trắng dư thừa
  
      // 🛠 Tách câu hỏi bằng dấu "|"
      const questions = responseText.split("\n").map((q, index) => {
        const parts = q.split(" | ");
        if (parts.length === 5) {
          return {
            id: index + 1, // Reset lại số thứ tự
            question: parts[0].trim(), // Câu hỏi
            options: [parts[1], parts[2], parts[3], parts[4]].map(opt => opt.trim()), // 4 đáp án
          };
        }
        return null;
      }).filter(q => q !== null); // Lọc bỏ câu hỏi lỗi
  
      return questions;
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
      return null;
    }
  };
  
  
  

// Lấy gợi ý món ăn từ AI
export const getFoodSuggestions = async (userAnswers) => {
    try {
      if (!Array.isArray(userAnswers)) {
        console.error("userAnswers không phải là mảng:", userAnswers);
        return null;
      }
  
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        Người dùng đã chọn các sở thích ăn uống sau: ${userAnswers.join(", ")}.
        Dựa vào sở thích này, hãy gợi ý 4-5 món ăn phù hợp.
        Chỉ trả về tên món ăn, không có giải thích.
      `;
      const result = await model.generateContent(prompt);
      return await result.response.text();
    } catch (error) {
      console.error("Lỗi lấy gợi ý món ăn:", error);
      return null;
    }
  };
  
  
