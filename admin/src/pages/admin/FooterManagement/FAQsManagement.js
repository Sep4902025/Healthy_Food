import React, { useEffect, useState } from "react";
import faqService from "../../../services/footer/faqServices";
import { PlusIcon, EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import Pagination from "../../../components/Pagination";

const FAQsManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ category: "", question: "", answer: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [faqsPerPage, setFaqsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchFAQs();
  }, [currentPage, faqsPerPage]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const result = await faqService.getFAQs(currentPage + 1, faqsPerPage); // +1 vì API dùng từ 1
      if (result.success) {
        setFaqs(result.data.data.faqs || []);
        setTotalItems(result.data.total || 0);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải FAQs");
      console.error("❌ Lỗi trong fetchFAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (faq) => {
    const updatedFAQ = { ...faq, isVisible: !faq.isVisible };
    const response = await faqService.updateFAQ(faq._id, updatedFAQ);
    if (response.success) fetchFAQs();
    else console.error("Error updating display status:", response.message);
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await faqService.hardDeleteFAQ(id);
      fetchFAQs();
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditData(item);
      setFormData({ category: item.category, question: item.question, answer: item.answer });
    } else {
      setEditData(null);
      setFormData({ category: "", question: "", answer: "" });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.category.trim()) {
      alert("Category cannot be empty!");
      return;
    }
    if (!formData.question.trim()) {
      alert("Question cannot be left blank!");
      return;
    }
    if (!formData.answer.trim()) {
      alert("Answer cannot be left blank!");
      return;
    }
    const response = editData
      ? await faqService.updateFAQ(editData._id, formData)
      : await faqService.createFAQ(formData);
    if (response.success) {
      setModalOpen(false);
      fetchFAQs();
    } else {
      alert(response.message);
    }
  };

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  if (loading) return <p className="text-center text-blue-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-custom-green mb-2">FAQs Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-custom-green text-white rounded-lg hover:bg-opacity-85"
        onClick={() => handleOpenModal()}
      >
        + Add New
      </button>
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <table className="w-full border-collapse mb-2">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">No.</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Question</th>
              <th className="p-3 text-left">Answer</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {faqs.length > 0 ? (
              faqs.map((item, index) => (
                <tr key={item._id} className="border-b border-gray-200 text-gray-900">
                  <td className="p-3">{currentPage * faqsPerPage + index + 1}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3 text-left">{item.question}</td>
                  <td className="p-3 text-left">{item.answer}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isVisible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        onClick={() => handleOpenModal(item)}
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        className={`p-2 rounded-full text-white ${
                          item.isVisible
                            ? "bg-gray-500 hover:bg-gray-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        onClick={() => handleToggleVisibility(item)}
                      >
                        {item.isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </button>
                      <button
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        onClick={() => handleHardDelete(item._id)}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">
                  There are no FAQs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          limit={faqsPerPage}
          setLimit={setFaqsPerPage}
          totalItems={totalItems}
          handlePageClick={handlePageClick}
          currentPage={currentPage} // Thêm currentPage
          text="FAQs"
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">{editData ? "Edit" : "Add new"} FAQ</h2>
            <label className="block mb-2">Category:</label>
            <input
              type="text"
              className="w-full border p-2 mb-4"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <label className="block mb-2">Question:</label>
            <textarea
              className="w-full border p-2 mb-4"
              rows="2"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            ></textarea>
            <label className="block mb-2">Answer:</label>
            <textarea
              className="w-full border p-2 mb-4"
              rows="4"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQsManagement;
