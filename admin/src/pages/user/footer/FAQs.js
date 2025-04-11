import React, { useEffect, useState } from "react";
import faqServices from "../../../services/footer/faqServices";

const FAQsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Default 5 FAQs per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await faqServices.getFAQs(currentPage, itemsPerPage);
      console.log("API Response:", result);

      if (result.success) {
        setFaqs(result.data.data.faqs || []); // Truy cập đúng result.data.data.faqs
        setTotalPages(result.data.totalPages || 1);
      } else {
        setError(result.message);
        setFaqs([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentPage]);

  const categories = [...new Set(faqs.map((faq) => faq.category))];
  const filteredFaqs = selectedCategory
    ? faqs.filter((faq) => faq.category === selectedCategory)
    : faqs;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="text-center text-green-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-6 py-12 grid grid-cols-12 gap-6">
      {/* Left Column - Categories */}
      <div className="col-span-4 bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Categories</h2>
        <ul className="space-y-3">
          {categories.map((category, index) => (
            <li
              key={index}
              className={`text-lg font-medium cursor-pointer p-2 rounded-lg ${
                selectedCategory === category
                  ? "bg-green-500 text-white"
                  : "text-gray-800 hover:bg-green-100"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column - Questions and Answers */}
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
          <p className="text-gray-600">No FAQs available.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === i + 1
                    ? "bg-green-500 text-white"
                    : "text-gray-700 bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQsPage;
