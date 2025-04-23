import React, { useEffect, useState } from "react";
import faqServices from "../../../services/footer/faqServices";

const FAQsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [allCategories, setAllCategories] = useState(new Set()); // Sử dụng Set để tránh trùng lặp
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await faqServices.getFAQs(currentPage, itemsPerPage);
      console.log("API Response:", result);

      if (result.success) {
        const newFaqs = result.data.data.faqs || [];
        setFaqs(newFaqs);

        // Cập nhật danh sách danh mục
        const newCategories = newFaqs.map((faq) => faq.category);
        setAllCategories((prev) => new Set([...prev, ...newCategories]));

        setTotalPages(result.data.totalPages || 1);
      } else {
        setError(result.message);
        setFaqs([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentPage]);

  const filteredFaqs = selectedCategory
    ? faqs.filter((faq) => faq.category === selectedCategory)
    : faqs;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="text-center text-green-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-6 py-12 grid grid-cols-12 gap-6">
      <div className="col-span-4 bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-custom-green mb-4">Categories</h2>
        <ul className="space-y-3">
          {[...allCategories].map((category, index) => (
            <li
              key={index}
              className={`text-lg font-medium cursor-pointer p-2 rounded-lg ${
                selectedCategory === category
                  ? "bg-green-500 text-white"
                  : "text-gray-800 hover:bg-green-100"
              }`}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

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
          <p className="text-gray-600">No FAQs available for this category.</p>
        )}

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
