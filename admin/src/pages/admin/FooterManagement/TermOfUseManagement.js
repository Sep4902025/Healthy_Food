import React, { useEffect, useState } from "react";
import termService from "../../../services/footer/termServices";

const TermOfUseManagement = () => {
  const [terms, setTerms] = useState([]);
  console.log("TERM DATA", terms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ bannerUrl: "", content: "" });

  useEffect(() => {
    fetchTerms();
  }, []);

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
      console.error("Lỗi khi cập nhật trạng thái hiển thị:", response.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn điều khoản này?")) {
      const response = await termService.hardDeleteTerm(id);
      if (response.success) {
        setTerms(terms.filter((term) => term._id !== id)); // ✅ Cập nhật UI ngay lập tức
      } else {
        console.error("Lỗi khi xóa:", response.message);
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
    if (!formData.bannerUrl || !formData.content) {
      console.error("Lỗi: Vui lòng nhập đầy đủ thông tin");
      return;
    }

    let response;
    if (editData) {
      response = await termService.updateTerm(editData._id, formData);
    } else {
      response = await termService.createTerm(formData);
    }

    if (!response.success) {
      console.error("Lỗi:", response.message);
      return;
    }

    // 🛠 Cập nhật danh sách terms từ API sau khi thay đổi dữ liệu
    await fetchTerms();

    setModalOpen(false);
    setEditData(null);
    setFormData({ _id: "", bannerUrl: "", content: "" });
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Quản lý Terms of Use</h1>

      <button
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        onClick={() => handleOpenModal()}
      >
        + Thêm mới
      </button>

      {loading && <p className="text-center text-blue-500">Đang tải...</p>}
      {error && <p className="text-center text-red-500">Lỗi: {error}</p>}

      <div className="bg-white shadow-lg rounded-lg p-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">STT</th>
              <th className="border border-gray-300 p-2">Hình ảnh</th>
              <th className="border border-gray-300 p-2">Nội dung</th>
              <th className="border border-gray-300 p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {terms.length > 0 ? (
              terms.map((item, index) => (
                <tr key={index} className="text-center border border-gray-300">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    <img
                      src={item.bannerUrl}
                      alt="Banner"
                      className="w-20 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-2 text-left">{item.content}</td>
                  <td className="p-2">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleOpenModal(item)}
                      >
                        Sửa
                      </button>
                      <button
                        className={`px-2 py-1 text-white rounded transition ${
                          item.isVisible ? "bg-gray-500" : "bg-green-500"
                        }`}
                        onClick={() => handleToggleVisibility(item)}
                      >
                        {item.isVisible ? "Ẩn" : "Hiện"}
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleHardDelete(item._id)}
                      >
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4">
                  Không có điều khoản nào.
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
            <h2 className="text-2xl font-bold mb-4">{editData ? "Chỉnh sửa" : "Thêm mới"} Term</h2>

            <label className="block mb-2">Banner URL:</label>
            <input
              type="text"
              className="w-full border p-2 mb-4"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            />

            <label className="block mb-2">Nội dung:</label>
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
                Hủy
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSave}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermOfUseManagement;
