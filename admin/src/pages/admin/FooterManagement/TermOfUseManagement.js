import React, { useEffect, useState } from "react";
import termService from "../../../services/footer/termServices";
import UploadComponent from "../../../components/UploadComponent";
import { PlusIcon, EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import Pagination from "../../../components/Pagination";

const TermOfUseManagement = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ bannerUrl: "", content: "" });
  const [currentPage, setCurrentPage] = useState(0); // Bắt đầu từ 0 vì ReactPaginate dùng index 0
  const [termsPerPage, setTermsPerPage] = useState(6); // Mặc định là 6 theo Pagination
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchTerms();
  }, [currentPage, termsPerPage]);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const result = await termService.getTerms(currentPage + 1, termsPerPage); // +1 vì API dùng page từ 1
      if (result.success) {
        setTerms(result.data.data.terms || []);
        setTotalItems(result.data.total || 0);
      } else {
        setError(result.message);
        setTerms([]);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải Terms");
      setTerms([]);
      console.error("❌ Lỗi trong fetchTerms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (term) => {
    const updatedTerm = { ...term, isVisible: !term.isVisible, isDeleted: term.isDeleted || false };
    const response = await termService.updateTerm(term._id, updatedTerm);
    if (response.success) fetchTerms();
    else console.error("Error updating display status:", response.message);
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this term?")) {
      const response = await termService.hardDeleteTerm(id);
      if (response.success) fetchTerms();
      else console.error("Error while deleting:", response.message);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditData(item);
      setFormData({ bannerUrl: item.bannerUrl, content: item.content });
    } else {
      setEditData(null);
      setFormData({ bannerUrl: "", content: "" });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.bannerUrl.trim()) {
      alert("Banner cannot be empty!");
      return;
    }
    if (!formData.content.trim()) {
      alert("Content cannot be empty!");
      return;
    }
    const response = editData
      ? await termService.updateTerm(editData._id, formData)
      : await termService.createTerm(formData);
    if (response.success) {
      setModalOpen(false);
      setEditData(null);
      setFormData({ bannerUrl: "", content: "" });
      fetchTerms();
    } else {
      console.error("Error:", response.message);
      alert(response.message);
    }
  };

  const handleImageUpload = (imageUrl) => setFormData({ ...formData, bannerUrl: imageUrl });

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  if (loading) return <p className="text-center text-blue-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold">Terms of Use Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        onClick={() => handleOpenModal()}
      >
        + Add new
      </button>
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <table className="w-full border-collapse mb-2">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">No.</th>
              <th className="p-3 text-left">Banner</th>
              <th className="p-3 text-left">Content</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {terms.length > 0 ? (
              terms.map((item, index) => (
                <tr key={item._id} className="border-b border-gray-200 text-gray-900">
                  <td className="p-3">{currentPage * termsPerPage + index + 1}</td>
                  <td className="p-3">
                    <img
                      src={item.bannerUrl}
                      alt="Banner"
                      className="w-20 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-3 text-left">{item.content}</td>
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
                <td colSpan="5" className="text-center text-gray-500 p-4">
                  No terms.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          limit={termsPerPage}
          setLimit={setTermsPerPage}
          totalItems={totalItems}
          handlePageClick={handlePageClick}
          text="Terms"
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">{editData ? "Edit" : "Add New"} Term</h2>
            <label className="block mb-2">Banner URL:</label>
            <UploadComponent
              onUploadSuccess={handleImageUpload}
              reset={formData.bannerUrl === ""}
            />
            <label className="block mb-2 mt-4">Content:</label>
            <textarea
              className="w-full border p-2 mb-4"
              rows="4"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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

export default TermOfUseManagement;