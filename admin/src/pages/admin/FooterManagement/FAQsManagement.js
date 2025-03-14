import React, { useEffect, useState } from "react";
import faqService from "../../../services/footer/faqServices";

const FAQsManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({ category: "", question: "", answer: "" });

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        setLoading(true);
        const result = await faqService.getFAQs();
        if (result.success) {
            setFaqs(result.data);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleToggleVisibility = async (faqs) => {
        const updatedFAQ = { ...faqs, isVisible: !faqs.isVisible };
        const response = await faqService.updateFAQ(faqs._id, updatedFAQ);
        
        if (response.success) {
            fetchFAQs(); // Cập nhật lại danh sách trên trang quản lý
        } else {
            console.error("Error updating display status:", response.message);
        }
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

        if (editData) {
            await faqService.updateFAQ(editData._id, formData);
        } else {
            const result = await faqService.createFAQ(formData);
            if (!result.success) {
                alert(result.message);
                return;
            }
        }

        setModalOpen(false);
        fetchFAQs();
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-green-700 mb-6">FAQs Management</h1>

            <button
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => handleOpenModal()}
            >
                + Add New
            </button>

            {loading && <p className="text-center text-blue-500">Loading...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}

            <div className="bg-white shadow-lg rounded-lg p-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">No.</th>
                            <th className="border border-gray-300 p-2">Category</th>
                            <th className="border border-gray-300 p-2">Question</th>
                            <th className="border border-gray-300 p-2">Answer</th>
                            <th className="border border-gray-300 p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.length > 0 ? (
                            faqs.map((item, index) => (
                                <tr key={index} className="text-center border border-gray-300">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{item.category}</td>
                                    <td className="p-2 text-left">{item.question}</td>
                                    <td className="p-2 text-left">{item.answer}</td>
                                    <td className="p-2">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                onClick={() => handleOpenModal(item)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`px-2 py-1 text-white rounded transition ${item.isVisible ? "bg-gray-500" : "bg-green-500"
                                                    }`}
                                                onClick={() => handleToggleVisibility(item)}
                                            >
                                                {item.isVisible ? "Hidden" : "Visible"}
                                            </button>
                                            <button
                                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                onClick={() => handleHardDelete(item._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-gray-500 p-4">
                                There are no FAQs yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
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
                                className="px-4 py-2 bg-green-500 text-white rounded"
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
