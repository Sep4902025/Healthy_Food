import React, { useEffect, useState } from "react";
import faqService from "../../../services/footer/faqServices";
import { EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";

const FAQsManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ category: "", question: "", answer: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [faqsPerPage, setFaqsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchFAQs();
  }, [currentPage, faqsPerPage]);

  const fetchFAQs = async (callback) => {
    setLoading(true);
    try {
      const result = await faqService.getFAQs(currentPage, faqsPerPage);
      if (result.success) {
        setFaqs(result.data.items || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalItems(result.data.total || 0);
        if (callback) callback(result.data);
      } else {
        setError(result.message);
        setFaqs([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải dữ liệu");
      setFaqs([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (faq) => {
    const updatedFAQ = { ...faq, isVisible: !faq.isVisible };
    const response = await faqService.updateFAQ(faq._id, updatedFAQ);
    if (response.success) {
      fetchFAQs();
    } else {
      console.error("Error updating display status:", response.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      const response = await faqService.hardDeleteFAQ(id);
      if (response.success) {
        fetchFAQs((result) => {
          const totalItems = result.total;
          const newTotalPages = Math.ceil(totalItems / faqsPerPage) || 1;
          if (result.items.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
        });
      } else {
        console.error("Error deleting FAQ:", response.message);
      }
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

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

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
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
          onClick={() => handleOpenModal()}
        >
          + Add New
        </button>
      </div>

      {/* Data Container */}
      <Loading isLoading={loading}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
            <div className="col-span-1 text-center">No.</div>
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
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition duration-200 items-center"
                >
                  <div className="col-span-1 text-gray-600 font-medium text-center">
                    {(currentPage - 1) * faqsPerPage + index + 1}
                  </div>
                  <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                    {item.category}
                  </div>
                  <div className="col-span-3 text-gray-700 text-sm line-clamp-1">
                    {item.question}
                  </div>
                  <div className="col-span-3 text-gray-700 text-sm line-clamp-1">
                    {item.answer}
                  </div>
                  <div className="col-span-1 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.isVisible
                          ? "bg-[#40B491] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {item.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-center space-x-3">
                    <button
                      className="p-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                      onClick={() => handleOpenModal(item)}
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className={`p-2 rounded-md text-white ${
                        item.isVisible
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-[#40B491] hover:bg-[#359c7a]"
                      } transition`}
                      onClick={() => handleToggleVisibility(item)}
                    >
                      {item.isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                    <button
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                      onClick={() => handleHardDelete(item._id)}
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
              setLimit={setFaqsPerPage}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              text={"FAQs"}
            />
          </div>
        </div>
      </Loading>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-[#40B491] mb-6">
              {editData ? "Edit FAQ" : "Add New FAQ"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                  rows="2"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                  rows="4"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
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