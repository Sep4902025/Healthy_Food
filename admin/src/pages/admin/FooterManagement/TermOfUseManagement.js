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
          Terms of Use Management
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
          <div className="col-span-2">Banner</div>
          <div className="col-span-6">Content</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {terms.length > 0 ? (
            terms.map((item, index) => (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 items-center"
              >
                <div className="col-span-1 text-gray-600 font-medium">
                  {currentPage * termsPerPage + index + 1}
                </div>
                <div className="col-span-2">
                  <img
                    src={item.bannerUrl}
                    alt="Banner"
                    className="w-14 h-14 object-cover rounded-full shadow-md"
                  />
                </div>
                <div className="col-span-6 text-gray-700 text-sm line-clamp-2">
                  {item.content}
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
            <div className="p-6 text-center text-gray-500">No terms.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={termsPerPage}
            setLimit={(value) => {
              setTermsPerPage(value);
              setCurrentPage(0); // Reset về trang đầu khi thay đổi số lượng item mỗi trang
            }}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text="Terms"
          />
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#40B491]">
              {editData ? "Edit" : "Add New"} Term
            </h2>

            <label className="block mb-2 text-gray-700">Banner:</label>
            <UploadComponent
              onUploadSuccess={handleImageUpload}
              reset={formData.bannerUrl === ""}
            />
            {formData.bannerUrl && (
              <img
                src={formData.bannerUrl}
                alt="Preview"
                className="mt-2 w-20 h-20 object-cover rounded-md"
              />
            )}

            <label className="block mb-2 mt-4 text-gray-700">Content:</label>
            <textarea
              className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              rows="4"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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

export default TermOfUseManagement;