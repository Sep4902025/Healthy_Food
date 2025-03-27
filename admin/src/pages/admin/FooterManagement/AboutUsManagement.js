import React, { useEffect, useState } from "react";
import aboutService from "../../../services/footer/aboutServices";
import UploadComponent from "../../../components/UploadComponent";
import { EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import Pagination from "../../../components/Pagination"; // Import Pagination từ TableMealPlan
import Loading from "../../../components/Loading"; // Import Loading từ TableMealPlan

const AboutUsManagement = () => {
  const [aboutData, setAboutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ bannerUrl: "", content: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Tương đương với limit
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Thêm totalItems để khớp với Pagination

  useEffect(() => {
    fetchAboutUs();
  }, [currentPage, itemsPerPage]);

  const fetchAboutUs = async (callback) => {
    setLoading(true);
    try {
      const result = await aboutService.getAboutUs(currentPage, itemsPerPage);
      if (result.success) {
        setAboutData(result.data.items || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalItems(result.data.total || 0); // Cập nhật totalItems từ API
        if (callback) callback(result);
      } else {
        setError(result.message);
        setAboutData([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải dữ liệu");
      setAboutData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (about) => {
    const updatedAbout = { ...about, isVisible: !about.isVisible };
    const response = await aboutService.updateAboutUs(about._id, updatedAbout);
    if (response.success) fetchAboutUs();
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const response = await aboutService.hardDeleteAboutUs(id);
      if (response.success) {
        fetchAboutUs((result) => {
          const totalItems = result.data.total;
          const newTotalPages = Math.ceil(totalItems / itemsPerPage) || 1;
          if (result.data.items.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
        });
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
    if (!formData.bannerUrl.trim()) return alert("Banner cannot be empty!");
    if (!formData.content.trim()) return alert("Content cannot be empty!");
    const response = editData
      ? await aboutService.updateAboutUs(editData._id, formData)
      : await aboutService.createAboutUs(formData);
    if (response.success) {
      setModalOpen(false);
      fetchAboutUs();
    } else {
      alert(response.message);
    }
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, bannerUrl: imageUrl });
  };

  // Xử lý sự kiện thay đổi trang từ Pagination
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; // ReactPaginate dùng index từ 0
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

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
          About Us Management
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
            <div className="col-span-1">No.</div>
            <div className="col-span-2 ">Banner</div>
            <div className="col-span-5">Content</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {aboutData.length > 0 ? (
              aboutData.map((item, index) => (
                <div
                  key={item._id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition duration-200 items-center"
                >
                  <div className="col-span-1 text-gray-600 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <img
                      src={item.bannerUrl}
                      alt="Banner"
                      className="w-12 h-12 object-cover rounded-md shadow-sm"
                    />
                  </div>
                  <div className="col-span-5 text-gray-700 text-sm line-clamp-2">
                    {item.content}
                  </div>
                  <div className="col-span-2 text-center">
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
              <div className="p-6 text-center text-gray-500">No data available.</div>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 bg-gray-50">
            <Pagination
              limit={itemsPerPage} // Truyền itemsPerPage thay vì limit
              setLimit={setItemsPerPage} // Cập nhật itemsPerPage
              totalItems={totalItems} // Tổng số mục
              handlePageClick={handlePageClick} // Hàm xử lý thay đổi trang
              text={"About Us Items"} // Tên hiển thị trong Pagination
            />
          </div>
        </div>
      </Loading>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-[#40B491] mb-6">
              {editData ? "Edit About Us" : "Add New About Us"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner
                </label>
                <UploadComponent
                  onUploadSuccess={handleImageUpload}
                  reset={formData.bannerUrl === ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                  rows="4"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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

export default AboutUsManagement;