import React, { useEffect, useState } from "react";
import termService from "../../../services/footer/termServices";
import UploadComponent from "../../../components/UploadComponent";
import { PlusIcon, EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";

const TermOfUseManagement = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ bannerUrl: "", content: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [termsPerPage, setTermsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTerms();
  }, [currentPage, termsPerPage]);

  const fetchTerms = async (callback) => {
    setLoading(true);
    const result = await termService.getTerms(currentPage, termsPerPage);
    if (result.success) {
      setTerms(result.data.items || []);
      setTotalPages(result.data.totalPages || 1);
      if (callback) callback(result.data);
    } else {
      setError(result.message);
      setTerms([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const handleToggleVisibility = async (term) => {
    const updatedTerm = {
      ...term,
      isVisible: !term.isVisible,
      isDeleted: term.isDeleted || false,
    };

    const response = await termService.updateTerm(term._id, updatedTerm);

    if (response.success) {
      fetchTerms();
    } else {
      console.error("Error updating display status:", response.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this term?")) {
      const response = await termService.hardDeleteTerm(id);
      if (response.success) {
        fetchTerms((result) => {
          const totalItems = result.total;
          const newTotalPages = Math.ceil(totalItems / termsPerPage) || 1;
          if (result.items.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
        });
      } else {
        console.error("Error while deleting:", response.message);
      }
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

    let response;
    if (editData) {
      response = await termService.updateTerm(editData._id, formData);
    } else {
      response = await termService.createTerm(formData);
    }

    if (response.success) {
      setModalOpen(false);
      fetchTerms();
    } else {
      console.error("Error:", response.message);
      alert(response.message);
    }
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, bannerUrl: imageUrl });
  };

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
        <table className="w-full border-collapse">
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
                  <td className="p-3">{(currentPage - 1) * termsPerPage + index + 1}</td>
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

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              className="border rounded px-2 py-1"
              value={termsPerPage}
              onChange={(e) => {
                setTermsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5 Terms</option>
              <option value="10">10 Terms</option>
              <option value="15">15 Terms</option>
            </select>
          </div>
          {totalPages > 1 && (
            <div className="flex space-x-2">
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                {"<"}
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                {">"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">{editData ? "Edit" : "Add New"} Term</h2>

            <label className="block mb-2">Banner URL:</label>
            <UploadComponent onUploadSuccess={handleImageUpload} reset={formData.bannerUrl === ""} />

            <label className="block mb-2">Content:</label>
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
              <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSave}>
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