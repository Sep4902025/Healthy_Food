import React, { useEffect, useState } from "react";
import faqServices from "../../../services/footer/faqServices";

const FAQsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await faqServices.getFAQs();
      console.log("API Response:", result);
      
      if (result.success) {
        setFaqs(result.data || []);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const categories = [...new Set(faqs.map(faq => faq.category))];
  const filteredFaqs = selectedCategory ? faqs.filter(faq => faq.category === selectedCategory) : faqs;

  if (loading) return <p className="text-center text-green-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">Lỗi: {error}</p>;

  return (
    <div className="container mx-auto px-6 py-12 grid grid-cols-12 gap-6">
      {/* Cột trái - Danh mục */}
      <div className="col-span-4 bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Danh Mục</h2>
        <ul className="space-y-3">
          {categories.map((category, index) => (
            <li
              key={index}
              className={`text-lg font-medium cursor-pointer p-2 rounded-lg ${selectedCategory === category ? "bg-green-500 text-white" : "text-gray-800 hover:bg-green-100"}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Cột phải - Câu hỏi và câu trả lời */}
      <div className="col-span-8">
        {filteredFaqs.length > 0 ? (
          <div className="space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg p-6 border-b">
                <p className="text-lg font-medium text-gray-900">{faq.question}</p>
                <p className="text-gray-700 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Không có FAQs nào.</p>
        )}
      </div>
    </div>
  );
};

export default FAQsPage;
