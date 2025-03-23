import React, { useEffect, useState } from "react";
import termService from "../../../services/footer/termServices";
import UploadComponent from "../../../components/UploadComponent";
import { PlusIcon, EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";

const TermOfUseManagement = () => {
  const [terms, setTerms] = useState([]);
  console.log("TERM DATA", terms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ bannerUrl: "", content: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  useEffect(() => {
    fetchTerms();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentTerms = terms.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchTerms = async () => {
    setLoading(true);
    const result = await termService.getTerms();
    if (result.success) {
      setTerms(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleToggleVisibility = async (term) => {
    const updatedTerm = {
      ...term,
      isVisible: !term.isVisible,
      isDeleted: term.isDeleted || false, // ✅ Đảm bảo có đầy đủ dữ liệu
    };

    const response = await termService.updateTerm(term._id, updatedTerm);

    if (response.success) {
      setTerms(terms.map((t) => (t._id === term._id ? { ...t, isVisible: !t.isVisible } : t)));
    } else {
      console.error("Error updating display status:", response.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this term?")) {
      const response = await termService.hardDeleteTerm(id);
      if (response.success) {
        const updatedTerms = terms.filter((term) => term._id !== id);
        setTerms(updatedTerms);

        // Tính lại tổng số trang
        const totalPages = Math.ceil(updatedTerms.length / usersPerPage);

        // Nếu trang hiện tại không còn dữ liệu, quay về trang trước (nếu có)
        if (currentPage > totalPages) {
          setCurrentPage(totalPages > 0 ? totalPages : 1);
        }
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

    if (!response.success) {
      console.error("Error:", response.message);
      return;
    }

    // 🛠 Cập nhật danh sách terms từ API sau khi thay đổi dữ liệu
    await fetchTerms();

    setModalOpen(false);
    setEditData(null);
    setFormData({ _id: "", bannerUrl: "", content: "" });
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
            {currentTerms.length > 0 ? (
              currentTerms.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 text-gray-900">
                  <td className="p-3">{index + 1}</td>
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
                      {/* Nút chỉnh sửa */}
                      <button
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        onClick={() => handleOpenModal(item)}
                      >
                        <EditIcon size={16} />
                      </button>

                      {/* Nút Ẩn/Hiện */}
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

                      {/* Nút Xóa vĩnh viễn */}
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
                <td colSpan="4" className="text-center text-gray-500 p-4">
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
              onChange={(e) => setUsersPerPage(Number(e.target.value))}
            >
              <option value="5">5 Terms</option>
              <option value="10">10 Terms</option>
              <option value="15">15 Terms</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: Math.ceil(terms.length / usersPerPage) }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"
                }`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(terms.length / usersPerPage)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">{editData ? "Edit" : "Add New"} Term</h2>

            <label className="block mb-2">Banner URL:</label>
            <UploadComponent onUploadSuccess={handleImageUpload} reset={formData.imageUrl === ""} />

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
