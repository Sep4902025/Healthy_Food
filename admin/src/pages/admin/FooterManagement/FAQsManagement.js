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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-[#40B491] text-lg font-semibold">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          FAQs Management
        </h1>
        <button
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300 flex items-center"
          onClick={() => handleOpenModal()}
        >
          <PlusIcon size={16} className="mr-2" /> Add New
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
          <div className="col-span-1">No.</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-3">Question</div>
          <div className="col-span-3">Answer</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {faqs.length > 0 ? (
            faqs.map((item, index) => (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 items-center"
              >
                <div className="col-span-1 text-gray-600 font-medium">
                  {currentPage * faqsPerPage + index + 1}
                </div>
                <div className="col-span-2 text-gray-700 text-sm">
                  {item.category}
                </div>
                <div className="col-span-3 text-gray-700 text-sm line-clamp-2">
                  {item.question}
                </div>
                <div className="col-span-3 text-gray-700 text-sm line-clamp-2">
                  {item.answer}
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.isVisible
                        ? "bg-[#40B491] text-white"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
                <div className="col-span-2 flex justify-center space-x-3">
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition"
                    onClick={() => handleOpenModal(item)}
                    title="Edit"
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded text-white ${
                      item.isVisible
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#40B491] hover:bg-[#359c7a]"
                    } transition`}
                    onClick={() => handleToggleVisibility(item)}
                    title={item.isVisible ? "Hide" : "Show"}
                  >
                    {item.isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition"
                    onClick={() => handleHardDelete(item._id)}
                    title="Delete"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">There are no FAQs yet.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={faqsPerPage}
            setLimit={(value) => {
              setFaqsPerPage(value);
              setCurrentPage(0); // Reset về trang đầu khi thay đổi số lượng item mỗi trang
            }}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text="FAQs"
          />
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#40B491]">
              {editData ? "Edit" : "Add New"} FAQ
            </h2>

            <label className="block mb-2 text-gray-700">Category:</label>
            <input
              type="text"
              className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />

            <label className="block mb-2 text-gray-700">Question:</label>
            <textarea
              className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              rows="2"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            ></textarea>

            <label className="block mb-2 text-gray-700">Answer:</label>
            <textarea
              className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              rows="4"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            ></textarea>

            <div className="flex justify-end space-x-2">
              <button
                className="w-11 h-14 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="w-11 h-14 flex items-center justify-center bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition"
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
