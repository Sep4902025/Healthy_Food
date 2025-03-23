import React, { useState } from "react";
import { getQuizQuestions, getFoodSuggestions } from "../../services/geminiService";
import "./Quiz.css"; // Import file CSS

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [suggestedFoods, setSuggestedFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 📝 Load câu hỏi từ AI
  const startQuiz = async () => {
    setLoading(true);
    setError("");
    setAnswers({});
    setSuggestedFoods([]);
    setQuestions([]); // Reset danh sách câu hỏi
  
    const quizData = await getQuizQuestions();
    if (quizData) {
      setQuestions(quizData);
    } else {
      setError("Lỗi khi lấy câu hỏi từ AI. Vui lòng thử lại.");
    }
  
    setLoading(false);
  };
  
  
  

  // 🎯 Xử lý chọn đáp án
  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  // 🍜 Lấy gợi ý món ăn sau khi chọn xong 10 câu
  const getSuggestions = async () => {
    const userAnswers = Object.values(answers); // Lấy danh sách đáp án đã chọn của người dùng
  
    if (!Array.isArray(userAnswers) || userAnswers.length < questions.length) {
      setError("Vui lòng chọn đầy đủ các câu hỏi trước khi lấy gợi ý món ăn.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    const suggestions = await getFoodSuggestions(userAnswers);
    if (suggestions) {
      setSuggestedFoods(suggestions.split("\n")); // Chia dòng nếu AI trả về nhiều món
    } else {
      setError("Lỗi khi lấy gợi ý món ăn. Vui lòng thử lại.");
    }
  
    setLoading(false);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setAnswers({});
    setSuggestedFoods([]);
    setLoading(false);
    setError("");
  };
  
  
  

  return (
    <div className="quiz-container">
      <h1>Gợi ý chọn món ăn</h1>

      {loading && <p className="loading">Đang tải...</p>}
      {error && <p className="error">{error}</p>}

      {/* Nút bắt đầu */}
      {questions.length === 0 && !loading && (
        <button className="start-btn" onClick={startQuiz}>
          Bắt đầu
        </button>
      )}

      {/* Danh sách câu hỏi */}
      {questions.length > 0 && (
        <div className="questions">
          {questions.map((q) => (
            <div key={q.id} className="question">
              <p>{q.id}. {q.question}</p>
              <div className="options">
                {q.options.map((opt, index) => (
                  <button
                    key={index}
                    className={`option-btn ${answers[q.id] === opt ? "selected" : ""}`}
                    onClick={() => handleAnswer(q.id, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nhóm nút */}
        {questions.length > 0 && (
        <div className="button-group">
            <button className="submit-btn" onClick={getSuggestions}>
            Gợi ý món ăn
            </button>
            <button className="reset-btn" onClick={resetQuiz}>
            Làm lại
            </button>
        </div>
        )}



      {/* Hiển thị món ăn gợi ý */}
      <div className="suggestions">
        <h2>Gợi ý món ăn</h2>
        {suggestedFoods.length > 0 ? (
          <ul>
            {suggestedFoods.map((food, index) => (
              <li key={index}>{food}</li>
            ))}
          </ul>
        ) : (
          <p>Chưa có gợi ý nào.</p>
        )}
      </div>
    </div>
  );
};

export default Quiz;
